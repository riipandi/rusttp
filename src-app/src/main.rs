use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;
use std::sync::mpsc;

use chrono::Local;
use clap::Parser;
use rusttp::cmd;

#[derive(Clone, Copy)]
enum Rotation {
    Never,
    Minutely,
    Hourly,
    Daily,
}

/// Single file writer with rotation.
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

// ── Non-blocking channel-based logger ──────────────────────────────────────

/// Messages sent from the logger frontend to the background writer thread.
enum LogMsg {
    Line(String),
    Flush(mpsc::Sender<()>),
}

/// The background writer thread: drains the channel and writes to outputs.
fn spawn_writer_thread(rx: mpsc::Receiver<LogMsg>) {
    // Writers are built inside the thread — no Mutex needed, no contention.
    // They are NOT Send because RollingFileWriter lives in this thread only.
    let console_enabled = std::env::var("LOG_CONSOLE")
        .ok()
        .map(|v| v == "true" || v == "1")
        .unwrap_or(true);
    let file_enabled = std::env::var("LOG_TRANSPORT").as_deref() == Ok("file");
    let emit_console = console_enabled || !file_enabled;

    let rotation =
        parse_rotation(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "hourly".into()));

    // Local writer collection — single-threaded, no Mutex
    struct Writers {
        file: Option<RollingFileWriter>,
        console: Option<io::Stderr>,
    }
    let mut writers = Writers {
        file: file_enabled.then(|| RollingFileWriter::new("storage/logs".into(), rotation)),
        console: emit_console.then(io::stderr),
    };
    // Fallback: if both disabled, still write to stderr
    if !file_enabled && !emit_console {
        writers.console = Some(io::stderr());
    }

    std::thread::spawn(move || {
        for msg in rx {
            match msg {
                LogMsg::Line(line) => {
                    if let Some(ref mut w) = writers.file {
                        let _ = w.write_all(line.as_bytes());
                    }
                    if let Some(ref mut w) = writers.console {
                        let _ = w.write_all(line.as_bytes());
                    }
                }
                LogMsg::Flush(tx) => {
                    if let Some(ref mut w) = writers.file {
                        let _ = w.flush();
                    }
                    if let Some(ref mut w) = writers.console {
                        let _ = w.flush();
                    }
                    // Signal completion
                    let _ = tx.send(());
                }
            }
        }
    });
}

/// Logger frontend — fast path: format JSON, push to channel, return.
struct JsonLogger {
    tx: mpsc::SyncSender<LogMsg>,
    level: log::LevelFilter,
}

impl log::Log for JsonLogger {
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        metadata.level() <= self.level
    }

    fn log(&self, record: &log::Record) {
        if !self.enabled(record.metadata()) {
            return;
        }
        let entry = serde_json::json!({
            "timestamp": Local::now().format("%Y-%m-%dT%H:%M:%S%.3f%:z").to_string(),
            "level": record.level().to_string(),
            "target": record.target(),
            "message": record.args().to_string(),
        });
        let line = serde_json::to_string(&entry).unwrap_or_default() + "\n";
        // Non-blocking push — drops line if buffer is full (backpressure)
        let _ = self.tx.try_send(LogMsg::Line(line));
    }

    fn flush(&self) {
        let (tx, rx) = mpsc::channel();
        // Use send() not try_send() — flush is supposed to block until complete
        let _ = self.tx.send(LogMsg::Flush(tx));
        let _ = rx.recv();
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────

fn parse_rotation(s: &str) -> Rotation {
    match s {
        "daily" => Rotation::Daily,
        "minutely" => Rotation::Minutely,
        "never" => Rotation::Never,
        _ => Rotation::Hourly,
    }
}

fn parse_log_level() -> log::LevelFilter {
    let level_str = std::env::var("LOG_LEVEL")
        .or_else(|_| std::env::var("RUST_LOG"))
        .unwrap_or_else(|_| "info".into());
    match level_str.to_lowercase().as_str() {
        "trace" => log::LevelFilter::Trace,
        "debug" => log::LevelFilter::Debug,
        "info" => log::LevelFilter::Info,
        "warn" => log::LevelFilter::Warn,
        "error" => log::LevelFilter::Error,
        "off" => log::LevelFilter::Off,
        _ => log::LevelFilter::Info,
    }
}

fn init_channel_logger() -> JsonLogger {
    let level = parse_log_level();
    // Bounded channel: 65536 entries ≈ protects memory under burst without dropping too many
    let (tx, rx) = mpsc::sync_channel::<LogMsg>(65536);
    spawn_writer_thread(rx);
    JsonLogger { tx, level }
}

// ── Main ───────────────────────────────────────────────────────────────────

/// Run the application with explicit CLI args (testable).
async fn run_main_with_args<I>(args: I) -> i32
where
    I: IntoIterator,
    I::Item: Into<OsString> + Clone,
{
    // Fastrace: only install a reporter when explicitly configured.
    // Without a reporter, spans are collected in a thread-local ring buffer
    // and silently evicted — near-zero overhead in the hot path.
    let tracing_reporter = std::env::var("TRACING_REPORTER").unwrap_or_default();
    if tracing_reporter == "console" {
        fastrace::set_reporter(
            fastrace::collector::ConsoleReporter,
            fastrace::collector::Config::default(),
        );
    }
    let tracing_enabled = std::env::var("TRACING_ENABLE").as_deref() == Ok("true");
    let tracing_sampling: f64 = std::env::var("TRACING_SAMPLING")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(0.7);
    let tracing_sampling = tracing_sampling.clamp(0.0, 1.0);

    // Channel-based JSON logger (non-blocking, background thread)
    let logger = init_channel_logger();
    let max_level = logger.level;
    let _ = log::set_boxed_logger(Box::new(logger));
    log::set_max_level(max_level);

    // Startup status
    {
        let log_level = std::env::var("LOG_LEVEL")
            .or_else(|_| std::env::var("RUST_LOG"))
            .unwrap_or_else(|_| "info".into());
        let log_console = std::env::var("LOG_CONSOLE").unwrap_or_else(|_| "true".into());
        let log_transport = std::env::var("LOG_TRANSPORT").unwrap_or_else(|_| "stderr".into());
        log::info!(
            "startup: tracing_enabled={tracing_enabled} tracing_sampling={tracing_sampling} tracing_reporter={tracing_reporter} log_level={log_level} log_console={log_console} log_transport={log_transport}"
        );
    }
    let cli = match cmd::Cli::try_parse_from(args) {
        Ok(cli) => cli,
        Err(e) => {
            let _ = e.print();
            return 2;
        }
    };

    let exit_code = cmd::dispatch(&cli).await.unwrap_or_else(|e| {
        log::error!("command failed: {e}");
        1
    });

    // Flush remaining traces and logs before exit
    fastrace::flush();
    log::logger().flush();

    exit_code
}

#[tokio::main]
async fn main() {
    std::process::exit(run_main_with_args(std::env::args_os()).await);
}

// ── Tests ──────────────────────────────────────────────────────────────────

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
    fn parse_log_level_parses_env_vars() {
        unsafe { std::env::set_var("LOG_LEVEL", "debug") };
        assert_eq!(parse_log_level(), log::LevelFilter::Debug);
        unsafe { std::env::remove_var("LOG_LEVEL") };

        unsafe { std::env::set_var("RUST_LOG", "warn") };
        assert_eq!(parse_log_level(), log::LevelFilter::Warn);
        unsafe { std::env::remove_var("RUST_LOG") };

        unsafe { std::env::remove_var("LOG_LEVEL") };
        unsafe { std::env::remove_var("RUST_LOG") };
        assert_eq!(parse_log_level(), log::LevelFilter::Info);

        unsafe { std::env::set_var("LOG_LEVEL", "bogus") };
        assert_eq!(parse_log_level(), log::LevelFilter::Info);
        unsafe { std::env::remove_var("LOG_LEVEL") };

        unsafe { std::env::remove_var("LOG_LEVEL") };
        unsafe { std::env::remove_var("RUST_LOG") };
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
    fn init_channel_logger_does_not_panic() {
        // Smoke test: creating the logger should not panic
        let _logger = init_channel_logger();
    }

    #[test]
    fn json_logger_enabled_checks_level() {
        use log::Log;
        let logger = JsonLogger {
            tx: mpsc::sync_channel(16).0,
            level: log::LevelFilter::Warn,
        };
        let info_md = log::Record::builder().level(log::Level::Info).build();
        let err_md = log::Record::builder().level(log::Level::Error).build();
        assert!(!logger.enabled(info_md.metadata()));
        assert!(logger.enabled(err_md.metadata()));
    }
}
