use std::borrow::Cow;
use std::io::Write;

use crate::file_writer::RollingFileWriter;

// ── File reporter for fastrace spans ───────────────────────────────────────

/// Writes span records as JSONL to a rotated file.
pub struct FileReporter {
    pub(crate) writer: RollingFileWriter,
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
pub fn setup_file_reporter(writer: RollingFileWriter) {
    fastrace::set_reporter(
        FileReporter { writer },
        fastrace::collector::Config::default(),
    );
}

/// Install an OpenTelemetry reporter via OTLP HTTP.
///
/// Uses `SpanExporter::builder().with_http()` which respects standard
/// `OTEL_EXPORTER_OTLP_*` environment variables for endpoint configuration.
/// On init failure the error is logged and tracing continues without a reporter
/// (graceful degradation).
pub fn setup_otel_reporter(service_name: &str) {
    let name: std::borrow::Cow<'static, str> = std::borrow::Cow::Owned(service_name.to_string());
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
}
