use lib_observer::{LogOutput, ObserverBuilder, Rotation, TracingReporter};

/// Helper: create a TempDir path string for use in test values.
fn tmp_dir() -> String {
    tempfile::TempDir::new()
        .expect("tempdir")
        .path()
        .to_string_lossy()
        .into_owned()
}

#[test]
fn builder_new_returns_observer_builder() {
    let _b: ObserverBuilder = ObserverBuilder::new();
}

#[test]
fn builder_log_level_chainable() {
    let _b = ObserverBuilder::new().log_level(log::LevelFilter::Debug);
}

#[test]
fn builder_log_output_stderr_chainable() {
    let _b = ObserverBuilder::new().log_output(LogOutput::StdErr);
}

#[test]
fn builder_log_output_file_chainable() {
    let _b = ObserverBuilder::new().log_output(LogOutput::File {
        dir: tmp_dir().into(),
        prefix: "test".into(),
        suffix: "log".into(),
        rotation: Rotation::Hourly,
    });
}

#[test]
fn builder_multiple_outputs() {
    let dir = tmp_dir();
    let _b = ObserverBuilder::new()
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
    let _b = ObserverBuilder::new().tracing_enabled(true);
}

#[test]
fn builder_tracing_disabled_chainable() {
    let _b = ObserverBuilder::new().tracing_enabled(false);
}

#[test]
fn builder_sampling_chainable() {
    let _b = ObserverBuilder::new().tracing_sampling(0.5);
}

#[test]
fn builder_reporter_none() {
    let _b = ObserverBuilder::new().tracing_reporter(TracingReporter::None);
}

#[test]
fn builder_reporter_console() {
    let _b = ObserverBuilder::new().tracing_reporter(TracingReporter::Console);
}

#[test]
fn builder_reporter_file() {
    let _b = ObserverBuilder::new().tracing_reporter(TracingReporter::File {
        dir: tmp_dir().into(),
        prefix: "test".into(),
        suffix: "trace".into(),
        rotation: Rotation::Hourly,
    });
}

#[test]
fn builder_reporter_otel() {
    let _b = ObserverBuilder::new().tracing_reporter(TracingReporter::Otel {
        service_name: "rusttp".into(),
    });
}

#[test]
fn builder_full_chain() {
    let _b = ObserverBuilder::new()
        .log_level(log::LevelFilter::Warn)
        .log_output(LogOutput::StdErr)
        .tracing_enabled(true)
        .tracing_sampling(0.1)
        .tracing_reporter(TracingReporter::Console);
}

#[test]
fn builder_default_compiles() {
    let _b: ObserverBuilder = Default::default();
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

// ── Init tests (each runs in its own process via nextest) ────────────

#[test]
fn builder_init_with_file_log_and_console_reporter() {
    let dir = tempfile::TempDir::new().unwrap();
    ObserverBuilder::new()
        .log_level(log::LevelFilter::Debug)
        .log_output(LogOutput::File {
            dir: dir.path().into(),
            prefix: "rusttp".into(),
            suffix: "log".into(),
            rotation: Rotation::Daily,
        })
        .log_output(LogOutput::StdErr)
        .tracing_enabled(true)
        .tracing_reporter(TracingReporter::Console)
        .init();
    log::info!("builder_init_with_file_log_and_console_reporter");
}

#[test]
fn builder_init_with_file_reporter() {
    let dir = tempfile::TempDir::new().unwrap();
    ObserverBuilder::new()
        .log_output(LogOutput::StdErr)
        .tracing_enabled(true)
        .tracing_reporter(TracingReporter::File {
            dir: dir.path().into(),
            prefix: "rusttp".into(),
            suffix: "trace".into(),
            rotation: Rotation::Daily,
        })
        .init();
    log::info!("builder_init_with_file_reporter");
}

#[test]
fn builder_init_with_otel_reporter() {
    ObserverBuilder::new()
        .log_output(LogOutput::StdErr)
        .tracing_enabled(true)
        .tracing_reporter(TracingReporter::Otel {
            service_name: "rusttp-test".into(),
        })
        .init();
    // OTLP exporter init will log a warning and fall back — that's fine
    log::info!("builder_init_with_otel_reporter");
}

#[test]
fn builder_init_no_tracing() {
    ObserverBuilder::new()
        .log_output(LogOutput::StdErr)
        .tracing_enabled(false)
        .init();
    log::info!("builder_init_no_tracing");
}
