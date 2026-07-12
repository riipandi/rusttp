use std::path::PathBuf;

use crate::logger::{FileConfig, LoggerConfig};

// ── Rotation ───────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Rotation {
    Never,
    Minutely,
    Hourly,
    Daily,
}

impl Rotation {
    /// Parse from a string (lowercase): `never`, `minutely`, `hourly`, `daily`.
    /// Falls back to `Hourly` for unknown input.
    pub fn parse(s: &str) -> Self {
        match s {
            "daily" => Rotation::Daily,
            "minutely" => Rotation::Minutely,
            "never" => Rotation::Never,
            _ => Rotation::Hourly,
        }
    }
}

// ── Log output configuration ───────────────────────────────────────────────

/// A single log output destination.
pub enum LogOutput {
    /// Write JSON log lines to stderr.
    StdErr,
    /// Write JSON log lines to a rotated file at `{base_dir}/{prefix}_{suffix}.jsonl`
    /// (or `{base_dir}/{prefix}_{slot}_{suffix}.jsonl` when rotation is active).
    File {
        dir: PathBuf,
        prefix: String,
        suffix: String,
        rotation: Rotation,
    },
}

// ── Tracing reporter configuration ─────────────────────────────────────────

/// Which fastrace reporter to install, if any.
pub enum TracingReporter {
    /// No reporter — spans collected in ring buffer, silently evicted.
    None,
    /// Print span traces to stdout (debugging).
    Console,
    /// Write span traces to rotated JSONL files.
    File {
        dir: PathBuf,
        prefix: String,
        suffix: String,
        rotation: Rotation,
    },
    /// Export via OTLP HTTP (requires a running OpenTelemetry Collector or
    /// compatible backend). Configure via `OTEL_EXPORTER_OTLP_*` env vars.
    Otel {
        /// Service name reported to the backend.
        service_name: String,
    },
}

// ── TelemetryBuilder ───────────────────────────────────────────────────────

/// Builder for initializing the telemetry stack (logger + tracer).
///
/// # Example
///
/// ```ignore
/// use lib_telemetry::{TelemetryBuilder, LogOutput, TracingReporter, Rotation};
///
/// TelemetryBuilder::new()
///     .log_level(log::LevelFilter::Info)
///     .log_output(LogOutput::StdErr)
///     .log_output(LogOutput::File {
///         dir: "storage/logs".into(),
///         prefix: "rusttp".into(),
///         suffix: "log".into(),
///         rotation: Rotation::Hourly,
///     })
///     .tracing_enabled(true)
///     .tracing_sampling(0.7)
///     .tracing_reporter(TracingReporter::Console)
///     .init();
/// ```
pub struct TelemetryBuilder {
    log_level: log::LevelFilter,
    log_outputs: Vec<LogOutput>,
    tracing_enabled: bool,
    tracing_sampling: f64,
    tracing_reporter: TracingReporter,
}

impl Default for TelemetryBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl TelemetryBuilder {
    /// Create a new builder with default values.
    ///
    /// Defaults:
    /// - log level: `Info`
    /// - log outputs: none (must be added explicitly)
    /// - tracing: disabled
    /// - sampling: 0.7
    /// - reporter: None
    pub fn new() -> Self {
        TelemetryBuilder {
            log_level: log::LevelFilter::Info,
            log_outputs: Vec::new(),
            tracing_enabled: false,
            tracing_sampling: 0.7,
            tracing_reporter: TracingReporter::None,
        }
    }

    /// Set the maximum log level.
    pub fn log_level(mut self, level: log::LevelFilter) -> Self {
        self.log_level = level;
        self
    }

    /// Add a log output destination. Can be called multiple times.
    pub fn log_output(mut self, output: LogOutput) -> Self {
        self.log_outputs.push(output);
        self
    }

    /// Enable or disable span collection.
    pub fn tracing_enabled(mut self, enabled: bool) -> Self {
        self.tracing_enabled = enabled;
        self
    }

    /// Set the tracing sampling rate (0.0–1.0). Only meaningful when
    /// `tracing_enabled` is `true`.
    pub fn tracing_sampling(mut self, rate: f64) -> Self {
        self.tracing_sampling = rate.clamp(0.0, 1.0);
        self
    }

    /// Set the tracing reporter.
    pub fn tracing_reporter(mut self, reporter: TracingReporter) -> Self {
        self.tracing_reporter = reporter;
        self
    }

    /// Initialise the logger and tracer, consuming the builder.
    ///
    /// This registers the global `log::Log` implementation via logforth and
    /// optionally installs the fastrace reporter.
    pub fn init(self) {
        self.init_logger();
        self.init_tracer();
    }

    fn init_logger(&self) {
        // Guard: logforth::starter_log::builder().apply() panics on second call.
        static INIT: std::sync::Once = std::sync::Once::new();
        INIT.call_once(|| {
            let has_file = self
                .log_outputs
                .iter()
                .any(|o| matches!(o, LogOutput::File { .. }));
            let has_console = self
                .log_outputs
                .iter()
                .any(|o| matches!(o, LogOutput::StdErr));
            let emit_console = has_console || !has_file;

            let file = self.log_outputs.iter().find_map(|o| {
                if let LogOutput::File {
                    dir,
                    prefix,
                    suffix,
                    rotation,
                } = o
                {
                    Some(FileConfig {
                        dir: dir.clone(),
                        prefix: prefix.clone(),
                        suffix: suffix.clone(),
                        rotation: *rotation,
                    })
                } else {
                    None
                }
            });

            crate::logger::init(&LoggerConfig {
                log_level: self.log_level,
                emit_console,
                file,
            });
        });
    }

    fn init_tracer(&self) {
        if !self.tracing_enabled {
            return;
        }
        match &self.tracing_reporter {
            TracingReporter::None => {}
            TracingReporter::Console => crate::tracing::setup_console_reporter(),
            TracingReporter::File {
                dir,
                prefix,
                suffix,
                rotation,
            } => {
                crate::tracing::setup_file_reporter(dir.clone(), prefix, suffix, *rotation);
            }
            TracingReporter::Otel { service_name } => {
                crate::tracing::setup_otel_reporter(service_name);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rotation_parse_all_variants() {
        assert_eq!(Rotation::parse("never"), Rotation::Never);
        assert_eq!(Rotation::parse("minutely"), Rotation::Minutely);
        assert_eq!(Rotation::parse("hourly"), Rotation::Hourly);
        assert_eq!(Rotation::parse("daily"), Rotation::Daily);
    }

    #[test]
    fn rotation_parse_defaults_to_hourly() {
        assert_eq!(Rotation::parse(""), Rotation::Hourly);
        assert_eq!(Rotation::parse("bogus"), Rotation::Hourly);
    }

    #[test]
    fn rotation_derive_clone_copy() {
        let r = Rotation::Hourly;
        let c = r;
        assert_eq!(c, Rotation::Hourly);
    }

    #[test]
    fn builder_defaults() {
        let b = TelemetryBuilder::new();
        assert_eq!(b.log_level, log::LevelFilter::Info);
        assert!(b.log_outputs.is_empty());
        assert!(!b.tracing_enabled);
        assert!((b.tracing_sampling - 0.7).abs() < f64::EPSILON);
        assert!(matches!(b.tracing_reporter, TracingReporter::None));
    }

    #[test]
    fn builder_log_level() {
        let b = TelemetryBuilder::new().log_level(log::LevelFilter::Debug);
        assert_eq!(b.log_level, log::LevelFilter::Debug);
    }

    #[test]
    fn builder_log_output() {
        let b = TelemetryBuilder::new()
            .log_output(LogOutput::StdErr)
            .log_output(LogOutput::File {
                dir: "/tmp".into(),
                prefix: "test".into(),
                suffix: "log".into(),
                rotation: Rotation::Hourly,
            });
        assert_eq!(b.log_outputs.len(), 2);
    }

    #[test]
    fn builder_tracing_enabled() {
        let b = TelemetryBuilder::new().tracing_enabled(true);
        assert!(b.tracing_enabled);
    }

    #[test]
    fn builder_tracing_sampling_clamps() {
        let b = TelemetryBuilder::new().tracing_sampling(1.5);
        assert_eq!(b.tracing_sampling, 1.0);
        let b = TelemetryBuilder::new().tracing_sampling(-0.5);
        assert_eq!(b.tracing_sampling, 0.0);
        let b = TelemetryBuilder::new().tracing_sampling(0.5);
        assert_eq!(b.tracing_sampling, 0.5);
    }

    #[test]
    fn builder_tracing_reporter() {
        let b = TelemetryBuilder::new().tracing_reporter(TracingReporter::Console);
        assert!(matches!(b.tracing_reporter, TracingReporter::Console));
    }

    #[test]
    fn builder_default_impl() {
        let b: TelemetryBuilder = Default::default();
        assert!(!b.tracing_enabled);
    }
}
