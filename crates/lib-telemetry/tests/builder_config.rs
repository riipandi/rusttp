use lib_telemetry::{LogOutput, Rotation, TelemetryBuilder, TracingReporter};

/// Helper: create a TempDir path string for use in test values.
fn tmp_dir() -> String {
    tempfile::TempDir::new()
        .expect("tempdir")
        .path()
        .to_string_lossy()
        .into_owned()
}

#[test]
fn builder_new_returns_telemetry_builder() {
    let _b: TelemetryBuilder = TelemetryBuilder::new();
}

#[test]
fn builder_log_level_chainable() {
    let _b = TelemetryBuilder::new().log_level(log::LevelFilter::Debug);
}

#[test]
fn builder_log_output_stderr_chainable() {
    let _b = TelemetryBuilder::new().log_output(LogOutput::StdErr);
}

#[test]
fn builder_log_output_file_chainable() {
    let _b = TelemetryBuilder::new().log_output(LogOutput::File {
        dir: tmp_dir().into(),
        prefix: "test".into(),
        suffix: "log".into(),
        rotation: Rotation::Hourly,
    });
}

#[test]
fn builder_multiple_outputs() {
    let dir = tmp_dir();
    let _b = TelemetryBuilder::new()
        .log_output(LogOutput::StdErr)
        .log_output(LogOutput::File {
            dir: dir.clone().into(),
            prefix: "test".into(),
            suffix: "log".into(),
            rotation: Rotation::Daily,
        });
}

#[test]
fn builder_tracing_enabled_chainable() {
    let _b = TelemetryBuilder::new().tracing_enabled(true);
}

#[test]
fn builder_tracing_disabled_chainable() {
    let _b = TelemetryBuilder::new().tracing_enabled(false);
}

#[test]
fn builder_sampling_chainable() {
    let _b = TelemetryBuilder::new().tracing_sampling(0.5);
}

#[test]
fn builder_reporter_none() {
    let _b = TelemetryBuilder::new().tracing_reporter(TracingReporter::None);
}

#[test]
fn builder_reporter_console() {
    let _b = TelemetryBuilder::new().tracing_reporter(TracingReporter::Console);
}

#[test]
fn builder_reporter_file() {
    let _b = TelemetryBuilder::new().tracing_reporter(TracingReporter::File {
        dir: tmp_dir().into(),
        prefix: "test".into(),
        suffix: "trace".into(),
        rotation: Rotation::Hourly,
    });
}

#[test]
fn builder_reporter_otel() {
    let _b = TelemetryBuilder::new().tracing_reporter(TracingReporter::Otel {
        service_name: "my-app".into(),
    });
}

#[test]
fn builder_full_chain() {
    let _b = TelemetryBuilder::new()
        .log_level(log::LevelFilter::Warn)
        .log_output(LogOutput::StdErr)
        .tracing_enabled(true)
        .tracing_sampling(0.1)
        .tracing_reporter(TracingReporter::Console);
}

#[test]
fn builder_default_compiles() {
    let _b: TelemetryBuilder = Default::default();
}

#[test]
fn rotation_all_variants_compile() {
    assert_eq!(Rotation::parse("never"), Rotation::Never);
    assert_eq!(Rotation::parse("hourly"), Rotation::Hourly);
    assert_eq!(Rotation::parse("daily"), Rotation::Daily);
    assert_eq!(Rotation::parse("weekly"), Rotation::Weekly);
}

#[test]
fn rotation_fallback() {
    assert_eq!(Rotation::parse("bogus"), Rotation::Daily);
    assert_eq!(Rotation::parse(""), Rotation::Daily);
}
