use std::borrow::Cow;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::PathBuf;

use chrono::Local;

use crate::Rotation;

// ── Rolling file writer (shared by FileReporter) ───────────────────────────

/// Single file writer with rotation and configurable prefix + suffix.
struct RollingFileWriter {
    dir: PathBuf,
    prefix: String,
    suffix: String,
    rotation: Rotation,
    slot: Option<String>,
    file: Option<std::fs::File>,
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

    fn maybe_rotate(&mut self) -> io::Result<()> {
        self.write_count += 1;
        let check_exists = self.write_count.is_multiple_of(100);
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

        // Flush the previous file before rotating
        if let Some(ref mut f) = self.file {
            let _ = f.flush();
        }

        let path = self.filename(self.slot.as_deref().unwrap_or(""));
        let _ = fs::create_dir_all(&self.dir);
        let file = OpenOptions::new().create(true).append(true).open(&path)?;
        self.file = Some(file);
        Ok(())
    }
}

/// Flush file contents on drop to minimise data loss.
impl Drop for RollingFileWriter {
    fn drop(&mut self) {
        if let Some(ref mut f) = self.file {
            let _ = f.flush();
        }
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

// ── File reporter for fastrace spans ───────────────────────────────────────

/// Writes span records as JSONL to a rotated file.
pub struct FileReporter {
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

// ── Reporter setup helpers ────────────────────────────────────────────────

/// Install the fastrace `ConsoleReporter`.
pub fn setup_console_reporter() {
    fastrace::set_reporter(
        fastrace::collector::ConsoleReporter,
        fastrace::collector::Config::default(),
    );
}

/// Install a file-based reporter that writes JSONL spans.
pub fn setup_file_reporter(dir: PathBuf, prefix: &str, suffix: &str, rotation: Rotation) {
    let writer = RollingFileWriter::new(dir, prefix, suffix, rotation);
    fastrace::set_reporter(
        FileReporter { writer },
        fastrace::collector::Config::default(),
    );
}

/// Install an OpenTelemetry reporter via OTLP HTTP.
pub fn setup_otel_reporter(service_name: &str) {
    let name: Cow<'static, str> = Cow::Owned(service_name.to_string());
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
            service_name.to_string(),
        )])
        .build();
    let scope = opentelemetry::InstrumentationScope::builder(name)
        .with_version(env!("CARGO_PKG_VERSION"))
        .build();
    let reporter =
        fastrace_opentelemetry::OpenTelemetryReporter::new(exporter, Cow::Owned(resource), scope);
    fastrace::set_reporter(reporter, fastrace::collector::Config::default());
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_span(
        name: &'static str,
        properties: Vec<(&'static str, &'static str)>,
    ) -> fastrace::collector::SpanRecord {
        fastrace::collector::SpanRecord {
            trace_id: fastrace::collector::TraceId(42),
            span_id: fastrace::collector::SpanId(1),
            parent_id: fastrace::collector::SpanId(0),
            begin_time_unix_ns: 1000,
            duration_ns: 500,
            name: std::borrow::Cow::Borrowed(name),
            properties: properties
                .into_iter()
                .map(|(k, v)| (std::borrow::Cow::Borrowed(k), std::borrow::Cow::Borrowed(v)))
                .collect(),
            events: vec![],
            links: vec![],
        }
    }

    #[test]
    fn span_to_json_renders_required_fields() {
        let span = make_span("test-span", vec![]);
        let json = span_to_json(&span);
        assert_eq!(json["name"], "test-span");
        assert_eq!(json["trace_id"], "0000000000000000000000000000002a");
        assert_eq!(json["span_id"], "0000000000000001");
        assert_eq!(json["parent_id"], "0000000000000000");
        assert_eq!(json["begin_time_unix_ns"], 1000);
        assert_eq!(json["duration_ns"], 500);
    }

    #[test]
    fn span_to_json_renders_properties() {
        let span = make_span(
            "props",
            vec![("http.method", "GET"), ("http.status", "200")],
        );
        let json = span_to_json(&span);
        assert_eq!(json["properties"]["http.method"], "GET");
        assert_eq!(json["properties"]["http.status"], "200");
    }

    #[test]
    fn span_to_json_empty_properties_is_empty_object() {
        let span = make_span("empty", vec![]);
        let json = span_to_json(&span);
        assert_eq!(json["properties"], serde_json::json!({}));
    }

    #[test]
    fn span_to_json_events_are_rendered() {
        let mut span = make_span("with-event", vec![]);
        span.events = vec![fastrace::collector::EventRecord {
            name: std::borrow::Cow::Borrowed("db.query"),
            timestamp_unix_ns: 1200,
            properties: vec![(
                std::borrow::Cow::Borrowed("query"),
                std::borrow::Cow::Borrowed("SELECT 1"),
            )],
        }];
        let json = span_to_json(&span);
        assert_eq!(json["events"][0]["name"], "db.query");
        assert_eq!(json["events"][0]["timestamp_unix_ns"], 1200);
        assert_eq!(json["events"][0]["properties"]["query"], "SELECT 1");
    }

    #[test]
    fn rolling_file_writer_slot_never() {
        use chrono::TimeZone;
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "trace", Rotation::Never);
        let dt = Local.with_ymd_and_hms(2026, 7, 12, 20, 38, 0).unwrap();
        assert_eq!(w.slot(&dt), "");
    }

    #[test]
    fn rolling_file_writer_filename_rotated() {
        let w = RollingFileWriter::new("/tmp".into(), "rusttp", "trace", Rotation::Hourly);
        assert_eq!(
            w.filename("2026071220"),
            PathBuf::from("/tmp/rusttp_2026071220.trace.jsonl")
        );
    }
}
