use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;

use chrono::Local;
use clap::Parser;
use rusttp::cmd;
use tracing_subscriber::fmt::time::ChronoLocal;
use tracing_subscriber::fmt::writer::MakeWriter;
use tracing_subscriber::prelude::*;

#[derive(Clone, Copy)]
enum Rotation {
    Never,
    Minutely,
    Hourly,
    Daily,
}

/// Single file writer with rotation. Runs inside a tracing_appender background thread.
struct RollingFileWriter {
    dir: PathBuf,
    rotation: Rotation,
    slot: Option<String>,
    file: Option<BufWriter<std::fs::File>>,
    write_count: u64,
}

impl RollingFileWriter {
    fn new(dir: PathBuf, rotation: Rotation) -> Self {
        let _ = fs::create_dir_all(&dir);
        RollingFileWriter {
            dir,
            rotation,
            slot: None,
            file: None,
            write_count: 0,
        }
    }

    fn slot(&self, dt: &chrono::DateTime<Local>) -> String {
        match self.rotation {
            Rotation::Minutely => dt.format("%Y%m%d_%H%M").to_string(),
            Rotation::Hourly => dt.format("%Y%m%d_%H00").to_string(),
            Rotation::Daily => dt.format("%Y%m%d").to_string(),
            Rotation::Never => String::new(),
        }
    }

    fn filename(&self, slot: &str) -> PathBuf {
        match self.rotation {
            Rotation::Never => self.dir.join("rusttp.jsonl"),
            _ => self.dir.join(format!("rusttp-{}.jsonl", slot)),
        }
    }

    fn maybe_rotate(&mut self) -> io::Result<()> {
        self.write_count += 1;
        let check_exists = self.write_count % 100 == 0;
        let now = Local::now();

        let need_new = match self.rotation {
            Rotation::Never => self.file.is_none() || (check_exists && !self.filename("").exists()),
            _ => {
                let s = self.slot(&now);
                if self.slot.as_ref() != Some(&s) {
                    self.slot = Some(s);
                    true
                } else {
                    check_exists && !self.filename(self.slot.as_deref().unwrap_or("")).exists()
                }
            }
        };
        if !need_new && self.file.is_some() {
            return Ok(());
        }
        let path = self.filename(self.slot.as_deref().unwrap_or(""));
        let _ = fs::create_dir_all(&self.dir);
        let file = OpenOptions::new().create(true).append(true).open(&path)?;
        self.file = Some(BufWriter::new(file));
        Ok(())
    }
}

impl Write for RollingFileWriter {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        self.maybe_rotate()?;
        self.file
            .as_mut()
            .ok_or_else(|| io::Error::other("log file not opened"))?
            .write(buf)
    }
    fn flush(&mut self) -> io::Result<()> {
        if let Some(ref mut f) = self.file {
            f.flush()
        } else {
            Ok(())
        }
    }
}

/// Fan-out writer for multi-output. Only used when both stderr + file are active.
struct MultiWriter {
    writers: Vec<tracing_appender::non_blocking::NonBlocking>,
}

struct MultiLog {
    writers: Vec<tracing_appender::non_blocking::NonBlocking>,
}

impl Write for MultiLog {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        for w in &mut self.writers {
            let _ = w.write(buf);
        }
        Ok(buf.len())
    }
    fn flush(&mut self) -> io::Result<()> {
        for w in &mut self.writers {
            let _ = w.flush();
        }
        Ok(())
    }
}

impl<'a> MakeWriter<'a> for MultiWriter {
    type Writer = MultiLog;
    fn make_writer(&'a self) -> Self::Writer {
        MultiLog {
            writers: self.writers.clone(),
        }
    }
}

fn parse_rotation(s: &str) -> Rotation {
    match s {
        "daily" => Rotation::Daily,
        "minutely" => Rotation::Minutely,
        "never" => Rotation::Never,
        _ => Rotation::Hourly,
    }
}

fn build_layer<W>(
    writer: W,
    use_local: bool,
) -> Box<dyn tracing_subscriber::Layer<tracing_subscriber::Registry> + Send + Sync>
where
    W: for<'a> MakeWriter<'a> + Send + Sync + 'static,
{
    let base = tracing_subscriber::fmt::layer().json().with_target(true);
    if use_local {
        base.with_timer(ChronoLocal::default())
            .with_writer(writer)
            .boxed()
    } else {
        base.with_writer(writer).boxed()
    }
}

/// Run the application with explicit CLI args (testable).
async fn run_main_with_args<I>(args: I) -> i32
where
    I: IntoIterator,
    I::Item: Into<OsString> + Clone,
{
    let mut _guards: Vec<Box<dyn std::any::Any>> = Vec::new();

    let level = std::env::var("LOG_LEVEL")
        .or_else(|_| std::env::var("RUST_LOG"))
        .unwrap_or_else(|_| "info".into());
    let env_filter =
        tracing_subscriber::EnvFilter::try_new(&level).unwrap_or_else(|_| "info".into());

    let console_enabled = std::env::var("LOG_CONSOLE")
        .ok()
        .map(|v| v == "true" || v == "1")
        .unwrap_or(true);
    let file_enabled = std::env::var("LOG_TRANSPORT").as_deref() == Ok("file");
    let emit_console = console_enabled || !file_enabled;

    let rotation =
        parse_rotation(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "hourly".into()));
    let use_local = std::env::var("APP_TIMEZONE").is_ok() || std::env::var("TZ").is_ok();

    let mut writers: Vec<tracing_appender::non_blocking::NonBlocking> = Vec::new();

    if file_enabled {
        let w = RollingFileWriter::new("storage/logs".into(), rotation);
        let (w, g) = tracing_appender::non_blocking(w);
        _guards.push(Box::new(g));
        writers.push(w);
    }

    if emit_console {
        let (w, g) = tracing_appender::non_blocking(std::io::stderr());
        _guards.push(Box::new(g));
        writers.push(w);
    }

    if writers.is_empty() {
        let (w, g) = tracing_appender::non_blocking(std::io::stderr());
        _guards.push(Box::new(g));
        writers.push(w);
    }

    let layer = if writers.len() == 1 {
        let w = writers.into_iter().next().unwrap();
        build_layer(w, use_local)
    } else {
        build_layer(MultiWriter { writers }, use_local)
    };

    let _ = tracing_subscriber::registry()
        .with(layer)
        .with(env_filter)
        .try_init();

    let cli = match cmd::Cli::try_parse_from(args) {
        Ok(cli) => cli,
        Err(e) => {
            let _ = e.print();
            return 2;
        }
    };

    cmd::dispatch(&cli).await.unwrap_or_else(|e| {
        tracing::error!(error = %e, "command failed");
        1
    })
}

#[tokio::main]
async fn main() {
    std::process::exit(run_main_with_args(std::env::args_os()).await);
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn parse_rotation_defaults_to_hourly() {
        assert!(matches!(parse_rotation(""), Rotation::Hourly));
        assert!(matches!(parse_rotation("bogus"), Rotation::Hourly));
    }

    #[test]
    fn parse_rotation_all_variants() {
        assert!(matches!(parse_rotation("never"), Rotation::Never));
        assert!(matches!(parse_rotation("minutely"), Rotation::Minutely));
        assert!(matches!(parse_rotation("hourly"), Rotation::Hourly));
        assert!(matches!(parse_rotation("daily"), Rotation::Daily));
    }

    #[test]
    fn rotation_derive_clone_copy() {
        let r = Rotation::Hourly;
        let c = r;
        assert!(matches!(c, Rotation::Hourly));
    }

    #[test]
    fn slot_never() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Never);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "");
    }

    #[test]
    fn slot_minutely() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Minutely);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "20260712_2038");
    }

    #[test]
    fn slot_hourly() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Hourly);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "20260712_2000");
    }

    #[test]
    fn slot_daily() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Daily);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "20260712");
    }

    #[test]
    fn filename_never() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Never);
        assert_eq!(w.filename(""), PathBuf::from("/tmp/rusttp.jsonl"));
    }

    #[test]
    fn filename_rotated() {
        let w = RollingFileWriter::new("/tmp".into(), Rotation::Hourly);
        assert_eq!(
            w.filename("20260712_2000"),
            PathBuf::from("/tmp/rusttp-20260712_2000.jsonl")
        );
    }

    #[test]
    fn write_creates_file_never() {
        let dir = std::env::temp_dir().join("rusttp-test-never");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), Rotation::Never);
        w.write_all(b"hello\n").unwrap();
        w.flush().unwrap();
        let path = dir.join("rusttp.jsonl");
        assert!(path.exists(), "file should exist after write");
        let content = std::fs::read_to_string(&path).unwrap();
        assert_eq!(content, "hello\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn write_appends_to_existing_file() {
        let dir = std::env::temp_dir().join("rusttp-test-append");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), Rotation::Never);
        w.write_all(b"first\n").unwrap();
        w.write_all(b"second\n").unwrap();
        w.flush().unwrap();
        let content = std::fs::read_to_string(dir.join("rusttp.jsonl")).unwrap();
        assert_eq!(content, "first\nsecond\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn flush_after_write_persists_data() {
        let dir = std::env::temp_dir().join("rusttp-test-flush");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), Rotation::Never);
        w.write_all(b"data\n").unwrap();
        w.flush().unwrap();
        let content = std::fs::read_to_string(dir.join("rusttp.jsonl")).unwrap();
        assert_eq!(content, "data\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn write_hourly_creates_timestamped_file() {
        let dir = std::env::temp_dir().join("rusttp-test-hourly");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), Rotation::Hourly);
        w.write_all(b"line\n").unwrap();
        let entries: Vec<_> = std::fs::read_dir(&dir).unwrap().collect();
        assert_eq!(entries.len(), 1);
        let fname = entries[0].as_ref().unwrap().file_name();
        let fname = fname.to_str().unwrap();
        assert!(fname.starts_with("rusttp-"));
        assert!(fname.ends_with(".jsonl"));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn build_layer_returns_boxed_layer() {
        let (nb, _g) = tracing_appender::non_blocking(std::io::sink());
        let layer = build_layer(nb, false);
        let _s = tracing_subscriber::registry().with(layer);
    }

    #[test]
    fn build_layer_with_local_timer() {
        let (nb, _g) = tracing_appender::non_blocking(std::io::sink());
        let layer = build_layer(nb, true);
        let _s = tracing_subscriber::registry().with(layer);
    }

    #[tokio::test]
    async fn run_main_with_health_command() {
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
    }

    #[tokio::test]
    async fn run_main_with_health_subcommand() {
        let code = run_main_with_args(["rusttp", "health"]).await;
        assert_eq!(code, 0);
    }

    #[tokio::test]
    async fn run_main_with_help_shows_usage() {
        let code = run_main_with_args(["rusttp", "--help"]).await;
        assert_eq!(code, 2);
    }

    #[tokio::test]
    async fn run_main_with_file_transport() {
        unsafe { std::env::set_var("LOG_TRANSPORT", "file") };
        unsafe { std::env::set_var("LOG_CONSOLE", "false") };
        unsafe { std::env::set_var("LOG_ROTATION", "never") };
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
        let _ = std::fs::remove_dir_all("storage");
        unsafe { std::env::remove_var("LOG_TRANSPORT") };
        unsafe { std::env::remove_var("LOG_CONSOLE") };
        unsafe { std::env::remove_var("LOG_ROTATION") };
    }

    #[test]
    fn multi_writer_fan_out() {
        let (w1, _g1) = tracing_appender::non_blocking(std::io::sink());
        let (w2, _g2) = tracing_appender::non_blocking(std::io::sink());
        let mw = MultiWriter {
            writers: vec![w1, w2],
        };
        let mut ml = mw.make_writer();
        ml.write_all(b"fan-out test\n").unwrap();
        ml.flush().unwrap();
    }
}
