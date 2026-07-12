use std::borrow::Cow;
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

/// Single file writer with rotation and configurable prefix.
struct RollingFileWriter {
    dir: PathBuf,
    prefix: String,
    suffix: String,
    rotation: Rotation,
    slot: Option<String>,
    file: Option<BufWriter<std::fs::File>>,
    write_count: u64,
}

impl RollingFileWriter {
    fn new(dir: PathBuf, prefix: &str, suffix: &str, rotation: Rotation) -> Self {
        let _ = fs::create_dir_all(&dir);
        RollingFileWriter {
            dir,
            prefix: prefix.into(),
            suffix: suffix.into(),
            rotation,
            slot: None,
            file: None,
            write_count: 0,
        }
    }

    fn slot(&self, dt: &chrono::DateTime<Local>) -> String {
        match self.rotation {
            Rotation::Minutely => dt.format("%y%m%d%H%M").to_string(),
            Rotation::Hourly => dt.format("%y%m%d%H").to_string(),
            Rotation::Daily => dt.format("%y%m%d").to_string(),
            Rotation::Never => String::new(),
        }
    }

    fn filename(&self, slot: &str) -> PathBuf {
        match self.rotation {
            Rotation::Never => self
                .dir
                .join(format!("{}_{}.jsonl", self.prefix, self.suffix)),
            _ => self
                .dir
                .join(format!("{}_{}_{}.jsonl", self.prefix, slot, self.suffix)),
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

enum LogMsg {
    Line(String),
    Flush(mpsc::Sender<()>),
}

/// Background writer thread: drains the channel and writes to outputs.
fn spawn_writer_thread(rx: mpsc::Receiver<LogMsg>) {
    let console_enabled = std::env::var("LOG_CONSOLE")
        .ok()
        .map(|v| v == "true" || v == "1")
        .unwrap_or(true);
    let file_enabled = std::env::var("LOG_TRANSPORT").as_deref() == Ok("file");
    let emit_console = console_enabled || !file_enabled;

    let rotation =
        parse_rotation(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "hourly".into()));

    struct Writers {
        file: Option<RollingFileWriter>,
        console: Option<io::Stderr>,
    }
    let mut writers = Writers {
        file: file_enabled
            .then(|| RollingFileWriter::new("storage/logs".into(), "rusttp", "log", rotation)),
        console: emit_console.then(io::stderr),
    };
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
        let _ = self.tx.try_send(LogMsg::Line(line));
    }

    fn flush(&self) {
        let (tx, rx) = mpsc::channel();
        let _ = self.tx.send(LogMsg::Flush(tx));
        let _ = rx.recv();
    }
}

// ── File reporter for fastrace spans ───────────────────────────────────────

/// Writes span records as JSONL to a rotated file.
struct FileReporter {
    writer: RollingFileWriter,
}

impl fastrace::collector::Reporter for FileReporter {
    fn report(&mut self, spans: Vec<fastrace::collector::SpanRecord>) {
        for span in spans {
            let entry = span_to_json(&span);
            let line = serde_json::to_string(&entry).unwrap_or_default() + "\n";
            let _ = self.writer.write_all(line.as_bytes());
        }
    }
}

fn span_to_json(span: &fastrace::collector::SpanRecord) -> serde_json::Value {
    let properties: serde_json::Value = span
        .properties
        .iter()
        .map(|(k, v)| {
            (
                k.as_ref().to_string(),
                serde_json::Value::String(v.to_string()),
            )
        })
        .collect();
    let events: Vec<serde_json::Value> = span
        .events
        .iter()
        .map(|e| {
            let ev_props: serde_json::Value = e
                .properties
                .iter()
                .map(|(k, v)| {
                    (
                        k.as_ref().to_string(),
                        serde_json::Value::String(v.to_string()),
                    )
                })
                .collect();
            serde_json::json!({
                "name": e.name,
                "timestamp_unix_ns": e.timestamp_unix_ns,
                "properties": ev_props,
            })
        })
        .collect();
    serde_json::json!({
        "trace_id": span.trace_id.to_string(),
        "span_id": span.span_id.to_string(),
        "parent_id": span.parent_id.to_string(),
        "begin_time_unix_ns": span.begin_time_unix_ns,
        "duration_ns": span.duration_ns,
        "name": span.name,
        "properties": properties,
        "events": events,
    })
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
    let (tx, rx) = mpsc::sync_channel::<LogMsg>(65536);
    spawn_writer_thread(rx);
    JsonLogger { tx, level }
}

fn setup_console_reporter() {
    fastrace::set_reporter(
        fastrace::collector::ConsoleReporter,
        fastrace::collector::Config::default(),
    );
}

fn setup_file_reporter() {
    let rotation =
        parse_rotation(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "hourly".into()));
    let writer = RollingFileWriter::new("storage/traces".into(), "rusttp", "trace", rotation);
    fastrace::set_reporter(
        FileReporter { writer },
        fastrace::collector::Config::default(),
    );
}

fn setup_otel_reporter() {
    let exporter = match opentelemetry_otlp::SpanExporter::builder()
        .with_http()
        .build()
    {
        Ok(exporter) => exporter,
        Err(e) => {
            log::warn!("otel exporter init failed (tracing disabled): {e}");
            return;
        }
    };
    let resource = opentelemetry_sdk::Resource::builder()
        .with_attributes([opentelemetry::KeyValue::new(
            "service.name",
            std::env::var("OTEL_SERVICE_NAME").unwrap_or_else(|_| "rusttp".into()),
        )])
        .build();
    let scope = opentelemetry::InstrumentationScope::builder("rusttp")
        .with_version(env!("CARGO_PKG_VERSION"))
        .build();
    let reporter =
        fastrace_opentelemetry::OpenTelemetryReporter::new(exporter, Cow::Owned(resource), scope);
    fastrace::set_reporter(reporter, fastrace::collector::Config::default());
}

// ── Main ───────────────────────────────────────────────────────────────────

/// Run the application with explicit CLI args (testable).
async fn run_main_with_args<I>(args: I) -> i32
where
    I: IntoIterator,
    I::Item: Into<OsString> + Clone,
{
    // Fastrace reporter: console | file | otel | (unset = no reporter)
    let tracing_reporter = std::env::var("TRACING_REPORTER").unwrap_or_default();
    match tracing_reporter.as_str() {
        "console" => setup_console_reporter(),
        "file" => setup_file_reporter(),
        "otel" => setup_otel_reporter(),
        _ => {} // no reporter — spans collected in ring buffer, silently evicted
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
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Never);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "");
    }

    #[test]
    fn slot_minutely() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Minutely);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "2607122038");
    }

    #[test]
    fn slot_hourly() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Hourly);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "26071220");
    }

    #[test]
    fn slot_daily() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Daily);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "260712");
    }

    #[test]
    fn filename_never() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Never);
        assert_eq!(w.filename(""), PathBuf::from("/tmp/rusttp_log.jsonl"));
    }

    #[test]
    fn filename_rotated() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "log", Rotation::Hourly);
        assert_eq!(
            w.filename("26071220"),
            PathBuf::from("/tmp/rusttp_26071220_log.jsonl")
        );
    }

    #[test]
    fn write_creates_file_never() {
        let dir = std::env::temp_dir().join("rusttp-test-never");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), "rusttp", "log", Rotation::Never);
        w.write_all(b"hello\n").unwrap();
        w.flush().unwrap();
        let path = dir.join("rusttp_log.jsonl");
        assert!(path.exists(), "file should exist after write");
        let content = std::fs::read_to_string(&path).unwrap();
        assert_eq!(content, "hello\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn write_appends_to_existing_file() {
        let dir = std::env::temp_dir().join("rusttp-test-append");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), "rusttp", "log", Rotation::Never);
        w.write_all(b"first\n").unwrap();
        w.write_all(b"second\n").unwrap();
        w.flush().unwrap();
        let content = std::fs::read_to_string(dir.join("rusttp_log.jsonl")).unwrap();
        assert_eq!(content, "first\nsecond\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn flush_after_write_persists_data() {
        let dir = std::env::temp_dir().join("rusttp-test-flush");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), "rusttp", "log", Rotation::Never);
        w.write_all(b"data\n").unwrap();
        w.flush().unwrap();
        let content = std::fs::read_to_string(dir.join("rusttp_log.jsonl")).unwrap();
        assert_eq!(content, "data\n");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn write_hourly_creates_timestamped_file() {
        let dir = std::env::temp_dir().join("rusttp-test-hourly");
        let _ = std::fs::remove_dir_all(&dir);
        let mut w = RollingFileWriter::new(dir.clone(), "rusttp", "log", Rotation::Hourly);
        w.write_all(b"line\n").unwrap();
        let entries: Vec<_> = std::fs::read_dir(&dir).unwrap().collect();
        assert_eq!(entries.len(), 1);
        let fname = entries[0].as_ref().unwrap().file_name();
        let fname = fname.to_str().unwrap();
        assert!(fname.starts_with("rusttp_"));
        assert!(fname.ends_with("_log.jsonl"));
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
