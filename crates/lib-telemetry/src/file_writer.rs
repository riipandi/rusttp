use std::fs::{self, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;

use chrono::Local;

use crate::Rotation;

/// Single file writer with rotation and configurable prefix + suffix.
///
/// File naming:
/// - `Never` rotation: `{dir}/{prefix}_{suffix}.jsonl`
/// - With rotation:    `{dir}/{prefix}_{slot}_{suffix}.jsonl`
pub struct RollingFileWriter {
    dir: PathBuf,
    prefix: String,
    suffix: String,
    rotation: Rotation,
    slot: Option<String>,
    file: Option<BufWriter<std::fs::File>>,
    write_count: u64,
}

impl RollingFileWriter {
    pub fn new(dir: PathBuf, prefix: &str, suffix: &str, rotation: Rotation) -> Self {
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

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
        let dir = std::env::temp_dir().join("libtel-test-never");
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
        let dir = std::env::temp_dir().join("libtel-test-append");
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
        let dir = std::env::temp_dir().join("libtel-test-flush");
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
        let dir = std::env::temp_dir().join("libtel-test-hourly");
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
}
