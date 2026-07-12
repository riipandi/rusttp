use std::ffi::OsString;

use clap::Parser;
use lib_telemetry::{LogOutput, Rotation, TelemetryBuilder, TracingReporter};
use rusttp::cmd;

/// Run the application with explicit CLI args (testable).
async fn run_main_with_args<I>(args: I) -> i32
where
    I: IntoIterator,
    I::Item: Into<OsString> + Clone,
{
    // ── Parse tracing config from env ──────────────────────────────────────
    let tracing_reporter = std::env::var("TRACING_REPORTER").unwrap_or_default();
    let tracing_enabled = std::env::var("TRACING_ENABLE").as_deref() == Ok("true");
    let tracing_sampling: f64 = std::env::var("TRACING_SAMPLING")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(0.7);
    let log_level_str = std::env::var("LOG_LEVEL")
        .or_else(|_| std::env::var("RUST_LOG"))
        .unwrap_or_else(|_| "info".into());

    // ── Build log outputs ─────────────────────────────────────────────────
    let console_enabled = std::env::var("LOG_CONSOLE")
        .ok()
        .map(|v| v == "true" || v == "1")
        .unwrap_or(true);
    let file_enabled = std::env::var("LOG_TRANSPORT").as_deref() == Ok("file");
    let rotation =
        Rotation::parse(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "hourly".into()));

    let mut builder = TelemetryBuilder::new()
        .log_level(parse_log_level(&log_level_str))
        .tracing_enabled(tracing_enabled)
        .tracing_sampling(tracing_sampling);

    // Add log outputs
    if file_enabled {
        builder = builder.log_output(LogOutput::File {
            dir: "storage/logs".into(),
            prefix: "rusttp".into(),
            suffix: "log".into(),
            rotation,
        });
    }
    // Console output is enabled by default, or as fallback when no file
    if console_enabled || !file_enabled {
        builder = builder.log_output(LogOutput::StdErr);
    }

    // ── Tracing reporter ──────────────────────────────────────────────────
    let reporter = match tracing_reporter.as_str() {
        "console" => TracingReporter::Console,
        "file" => TracingReporter::File {
            dir: "storage/traces".into(),
            prefix: "rusttp".into(),
            suffix: "trace".into(),
            rotation,
        },
        "otel" => TracingReporter::Otel {
            service_name: std::env::var("OTEL_SERVICE_NAME").unwrap_or_else(|_| "rusttp".into()),
        },
        _ => TracingReporter::None,
    };
    builder = builder.tracing_reporter(reporter);

    // ── Init ──────────────────────────────────────────────────────────────
    builder.init();

    // ── Startup status ────────────────────────────────────────────────────
    log::info!(
        "startup: tracing_enabled={tracing_enabled} tracing_sampling={tracing_sampling} tracing_reporter={tracing_reporter} log_level={log_level_str} log_console={console_enabled} log_transport={}",
        if file_enabled { "file" } else { "stderr" }
    );

    // ── CLI ────────────────────────────────────────────────────────────────
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

fn parse_log_level(s: &str) -> log::LevelFilter {
    match s.to_lowercase().as_str() {
        "trace" => log::LevelFilter::Trace,
        "debug" => log::LevelFilter::Debug,
        "info" => log::LevelFilter::Info,
        "warn" => log::LevelFilter::Warn,
        "error" => log::LevelFilter::Error,
        "off" => log::LevelFilter::Off,
        _ => log::LevelFilter::Info,
    }
}

#[tokio::main]
async fn main() {
    std::process::exit(run_main_with_args(std::env::args_os()).await);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_log_level_parses_correctly() {
        assert_eq!(parse_log_level("debug"), log::LevelFilter::Debug);
        assert_eq!(parse_log_level("info"), log::LevelFilter::Info);
        assert_eq!(parse_log_level("warn"), log::LevelFilter::Warn);
        assert_eq!(parse_log_level("error"), log::LevelFilter::Error);
        assert_eq!(parse_log_level("trace"), log::LevelFilter::Trace);
        assert_eq!(parse_log_level("off"), log::LevelFilter::Off);
        assert_eq!(parse_log_level("bogus"), log::LevelFilter::Info);
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
}
