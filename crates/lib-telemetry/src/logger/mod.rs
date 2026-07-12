use std::io::{self, Write};
use std::sync::mpsc;

use chrono::Local;

use crate::file_writer::RollingFileWriter;

// ── Messages ───────────────────────────────────────────────────────────────

pub(crate) enum LogMsg {
    Line(String),
    Flush(mpsc::Sender<()>),
}

// ── Background writer thread ───────────────────────────────────────────────

struct Writers {
    file: Option<RollingFileWriter>,
    console: Option<io::Stderr>,
}

/// Spawn a background thread that drains log lines from the channel
/// and writes them to the configured outputs.
pub(crate) fn spawn_writer(
    rx: mpsc::Receiver<LogMsg>,
    file_writer: Option<RollingFileWriter>,
    emit_console: bool,
) {
    let mut writers = Writers {
        file: file_writer,
        console: emit_console.then(io::stderr),
    };
    if writers.file.is_none() && !emit_console {
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

// ── Logger frontend ────────────────────────────────────────────────────────

/// Logger that formats messages as JSON and pushes to a background writer.
pub struct JsonLogger {
    tx: mpsc::SyncSender<LogMsg>,
    level: log::LevelFilter,
}

impl JsonLogger {
    pub(crate) fn new(tx: mpsc::SyncSender<LogMsg>, level: log::LevelFilter) -> Self {
        JsonLogger { tx, level }
    }

    pub fn level(&self) -> log::LevelFilter {
        self.level
    }

    pub(crate) fn create_channel(
        capacity: usize,
    ) -> (mpsc::SyncSender<LogMsg>, mpsc::Receiver<LogMsg>) {
        mpsc::sync_channel(capacity)
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_logger_enabled_checks_level() {
        use log::Log;
        let (tx, _rx) = JsonLogger::create_channel(16);
        let logger = JsonLogger::new(tx, log::LevelFilter::Warn);
        let info_md = log::Record::builder().level(log::Level::Info).build();
        let err_md = log::Record::builder().level(log::Level::Error).build();
        assert!(!logger.enabled(info_md.metadata()));
        assert!(logger.enabled(err_md.metadata()));
    }

    #[test]
    fn json_logger_level_getter() {
        let (tx, _rx) = JsonLogger::create_channel(16);
        let logger = JsonLogger::new(tx, log::LevelFilter::Debug);
        assert_eq!(logger.level(), log::LevelFilter::Debug);
    }
}
