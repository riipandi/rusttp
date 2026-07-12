use std::fmt;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

use logforth::Layout;
use logforth::append;
use logforth::layout::JsonLayout;
use logforth::record::{Level, LevelFilter};

use crate::Rotation;

// ── Custom rolling file appender ───────────────────────────────────────────

struct RollingLogWriter {
    dir: PathBuf,
    prefix: String,
    suffix: String,
    rotation: Rotation,
    slot: Option<String>,
    file: Option<std::fs::File>,
    write_count: u64,
}

impl RollingLogWriter {
    fn new(dir: PathBuf, prefix: String, suffix: String, rotation: Rotation) -> Self {
        let _ = std::fs::create_dir_all(&dir);
        RollingLogWriter {
            dir,
            prefix,
            suffix,
            rotation,
            slot: None,
            file: None,
            write_count: 0,
        }
    }

    fn slot(&self, dt: &chrono::DateTime<chrono::Local>) -> String {
        match self.rotation {
            Rotation::Hourly => dt.format("%Y%m%d%H").to_string(),
            Rotation::Daily => dt.format("%Y%m%d").to_string(),
            Rotation::Weekly => dt.format("%GW%V").to_string(),
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
                .join(format!("{}_{}.{}.jsonl", self.prefix, slot, self.suffix)),
        }
    }

    fn maybe_rotate(&mut self) -> std::io::Result<()> {
        self.write_count += 1;
        let check_exists = self.write_count.is_multiple_of(100);
        let now = chrono::Local::now();

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

        // Flush the previous file before rotating to a new one
        if let Some(ref mut f) = self.file {
            let _ = f.flush();
        }

        let path = self.filename(self.slot.as_deref().unwrap_or(""));
        let _ = std::fs::create_dir_all(&self.dir);
        let file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)?;
        self.file = Some(file);
        Ok(())
    }
}

/// Flush file contents on drop to minimise data loss.
impl Drop for RollingLogWriter {
    fn drop(&mut self) {
        if let Some(ref mut f) = self.file {
            let _ = f.flush();
        }
    }
}

impl Write for RollingLogWriter {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        self.maybe_rotate()?;
        self.file
            .as_mut()
            .ok_or_else(|| std::io::Error::other("log file not opened"))?
            .write(buf)
    }

    fn flush(&mut self) -> std::io::Result<()> {
        if let Some(ref mut f) = self.file {
            f.flush()
        } else {
            Ok(())
        }
    }
}

/// A logforth appender that writes JSON lines to a rolling file with
/// `{prefix}_{slot}_{suffix}.jsonl` naming.
struct RollingFileAppender {
    writer: Mutex<RollingLogWriter>,
}

impl fmt::Debug for RollingFileAppender {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("RollingFileAppender").finish()
    }
}

impl logforth::Append for RollingFileAppender {
    fn append(
        &self,
        record: &logforth::record::Record<'_>,
        diags: &[Box<dyn logforth::Diagnostic>],
    ) -> Result<(), logforth::Error> {
        let layout = JsonLayout::default();
        let mut bytes = layout.format(record, diags)?;
        bytes.push(b'\n');
        let mut writer = self
            .writer
            .lock()
            .map_err(|_| logforth::Error::new("lock"))?;
        writer
            .write_all(&bytes)
            .map_err(logforth::Error::from_io_error)?;
        Ok(())
    }

    fn flush(&self) -> Result<(), logforth::Error> {
        let mut writer = self
            .writer
            .lock()
            .map_err(|_| logforth::Error::new("lock"))?;
        writer.flush().map_err(logforth::Error::from_io_error)
    }
}

// ── Async wrapper ──────────────────────────────────────────────────────────

/// Wrap an appender with a non-blocking background thread.
fn non_blocking<A: logforth::Append + Send + 'static>(
    name: &str,
    appender: A,
) -> append::asynchronous::Async {
    append::asynchronous::AsyncBuilder::new(name)
        .overflow_drop_incoming()
        .append(appender)
        .build()
}

// ── Initialisation ─────────────────────────────────────────────────────────

/// Initialise the global logger via logforth with non-blocking appenders.
pub fn init(config: &LoggerConfig) {
    let mut builder = logforth::starter_log::builder();

    // Stderr dispatch (non-blocking)
    if config.emit_console {
        let stderr = append::Stderr::default().with_layout(JsonLayout::default());
        let stderr = non_blocking("stderr", stderr);
        builder = builder.dispatch(|d| d.filter(config.level_to_logforth()).append(stderr));
    }

    // File dispatch with custom rolling-writer appender (non-blocking)
    if let Some(ref file_cfg) = config.file {
        let writer = RollingLogWriter::new(
            file_cfg.dir.clone(),
            file_cfg.prefix.clone(),
            file_cfg.suffix.clone(),
            file_cfg.rotation,
        );
        let appender = RollingFileAppender {
            writer: Mutex::new(writer),
        };
        let appender = non_blocking("file", appender);
        builder = builder.dispatch(|d| d.filter(config.level_to_logforth()).append(appender));
    }

    builder.apply();
    log::set_max_level(config.log_level);
}

// ── Configuration ──────────────────────────────────────────────────────────

pub struct LoggerConfig {
    pub log_level: log::LevelFilter,
    pub emit_console: bool,
    pub file: Option<FileConfig>,
}

pub struct FileConfig {
    pub dir: PathBuf,
    pub prefix: String,
    pub suffix: String,
    pub rotation: Rotation,
}

impl LoggerConfig {
    fn level_to_logforth(&self) -> LevelFilter {
        match self.log_level {
            log::LevelFilter::Off => LevelFilter::Off,
            log::LevelFilter::Error => LevelFilter::MoreSevereEqual(Level::Error),
            log::LevelFilter::Warn => LevelFilter::MoreSevereEqual(Level::Warn),
            log::LevelFilter::Info => LevelFilter::MoreSevereEqual(Level::Info),
            log::LevelFilter::Debug => LevelFilter::MoreSevereEqual(Level::Debug),
            log::LevelFilter::Trace => LevelFilter::All,
        }
    }
}
