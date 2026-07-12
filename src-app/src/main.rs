#[cfg(not(target_env = "msvc"))]
use mimalloc::MiMalloc;

#[cfg(not(target_env = "msvc"))]
#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

use clap::Parser;
use rusttp::cmd;
use std::ffi::OsString;

use lib_observer::ObserverBuilder;
use lib_observer::{LogOutput, Rotation, TracingReporter};

// ── Env-file loader ────────────────────────────────────────────────────────

/// Extract `--env-file <path>` (or `--env-file=<path>`) from raw args and
/// load the file into the process environment, overriding any existing vars.
/// Returns the loaded path if any.
fn load_env_file_from_args<I>(args: &[I]) -> Option<&std::path::Path>
where
    I: AsRef<std::ffi::OsStr> + Clone,
{
    let mut i = 0;
    while i < args.len() {
        let a = args[i].as_ref();
        if a == "--env-file" {
            if let Some(path) = args.get(i + 1) {
                let path = std::path::Path::new(path.as_ref());
                load_dotenv_file(path);
                return Some(path);
            }
        } else if let Some(val) = a.to_str().and_then(|s| s.strip_prefix("--env-file=")) {
            let path = std::path::Path::new(val);
            load_dotenv_file(path);
            return Some(path);
        }
        i += 1;
    }
    None
}

/// Load a `.env` file and `set_env` for each `KEY=VALUE` line.
/// Overrides any existing environment variables (file values win).
fn load_dotenv_file(path: &std::path::Path) {
    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("warning: failed to read env-file {}: {e}", path.display());
            return;
        }
    };
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some(eq) = line.find('=') {
            let key = line[..eq].trim();
            let value = line[eq + 1..].trim();
            if !key.is_empty() {
                // SAFETY: called once at startup, single-threaded, no other
                // code reads env vars concurrently during this window.
                unsafe { std::env::set_var(key, value) };
            }
        }
    }
}

// ── App entrypoint ─────────────────────────────────────────────────────────

/// Run the application with explicit CLI args (testable).
async fn run_main_with_args<I>(args: I) -> i32
where
    I: IntoIterator,
    I::Item: Into<OsString> + Clone,
{
    let args: Vec<OsString> = args.into_iter().map(|a| a.into()).collect();

    // Load env-file before anything else so file vars override system env
    let env_file_loaded = load_env_file_from_args(&args).map(|p| p.to_path_buf());
    // ── Parse CLI ─────────────────────────────────────────────────────────
    let cli = match cmd::Cli::try_parse_from(args) {
        Ok(cli) => cli,
        Err(e) => {
            let code = e.exit_code();
            let _ = e.print();
            return code;
        }
    };

    // ── Parse tracing config from env ─────────────────────────────────────
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
    let rotation = Rotation::parse(&std::env::var("LOG_ROTATION").unwrap_or_else(|_| "daily".into()));

    let mut builder = ObserverBuilder::new()
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

    if let Some(ref path) = env_file_loaded {
        log::debug!("loaded env from {}", path.display());
    }

    // ── Dispatch ──────────────────────────────────────────────────────────
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
        assert_eq!(code, 0);
    }

    // ── Env-file tests ────────────────────────────────────────────────────

    fn make_env_file(dir: &std::path::Path, content: &str) -> std::path::PathBuf {
        let _ = std::fs::create_dir_all(dir);
        let path = dir.join(".env");
        std::fs::write(&path, content).unwrap();
        path
    }

    #[test]
    fn load_dotenv_file_sets_vars() {
        let dir = std::env::temp_dir().join("envtest_sets_vars");
        let path = make_env_file(&dir, "FOO=bar\nBAZ=qux\n");
        load_dotenv_file(&path);
        assert_eq!(std::env::var("FOO").as_deref(), Ok("bar"));
        assert_eq!(std::env::var("BAZ").as_deref(), Ok("qux"));
        unsafe { std::env::remove_var("FOO") };
        unsafe { std::env::remove_var("BAZ") };
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_dotenv_file_skips_comments_and_blanks() {
        let dir = std::env::temp_dir().join("envtest_skip_comments");
        let path = make_env_file(&dir, "# comment\n\nKEY=val\n");
        load_dotenv_file(&path);
        assert_eq!(std::env::var("KEY").as_deref(), Ok("val"));
        unsafe { std::env::remove_var("KEY") };
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_env_file_from_args_extracts_separate_arg() {
        let args: [&str; 4] = ["rusttp", "--env-file", "/path/to/env", "serve"];
        let got = load_env_file_from_args(&args);
        assert_eq!(got, Some(std::path::Path::new("/path/to/env")));
    }

    #[test]
    fn load_env_file_from_args_extracts_eq_form() {
        let args: [&str; 3] = ["rusttp", "--env-file=/path/to/env", "serve"];
        let got = load_env_file_from_args(&args);
        assert_eq!(got, Some(std::path::Path::new("/path/to/env")));
    }

    #[test]
    fn load_env_file_from_args_returns_none_when_absent() {
        let args: [&str; 2] = ["rusttp", "serve"];
        let got = load_env_file_from_args(&args);
        assert_eq!(got, None);
    }

    #[tokio::test]
    async fn env_file_overrides_system_env() {
        let dir = std::env::temp_dir().join("envtest_override");
        let path = make_env_file(&dir, "LOG_LEVEL=debug\nTRACING_ENABLE=true\n");

        // Set system env that should be overridden
        unsafe { std::env::set_var("LOG_LEVEL", "error") };
        unsafe { std::env::set_var("TRACING_ENABLE", "false") };

        let code = run_main_with_args(["rusttp", "--env-file", &path.to_string_lossy(), "hc"]).await;
        assert_eq!(code, 0);

        // Env vars from file must have won
        assert_eq!(std::env::var("LOG_LEVEL").as_deref(), Ok("debug"));
        assert_eq!(std::env::var("TRACING_ENABLE").as_deref(), Ok("true"));

        let _ = std::fs::remove_dir_all(&dir);
    }
    #[test]
    fn load_dotenv_file_missing_file_does_not_panic() {
        load_dotenv_file(std::path::Path::new("/nonexistent_dir/.env"));
        // Test passes if no panic
    }

    #[test]
    fn load_dotenv_file_empty_key() {
        let dir = std::env::temp_dir().join("envtest_empty_key");
        let path = make_env_file(&dir, "=orphan\nKEY=val\n");
        load_dotenv_file(&path);
        assert_eq!(std::env::var("KEY").as_deref(), Ok("val"));
        unsafe { std::env::remove_var("KEY") };
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_env_file_from_args_last_arg_no_value() {
        let args: [&str; 2] = ["rusttp", "--env-file"];
        let got = load_env_file_from_args(&args);
        assert_eq!(got, None);
    }

    #[tokio::test]
    async fn run_main_with_file_logging() {
        unsafe { std::env::set_var("LOG_TRANSPORT", "file") };
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
        unsafe { std::env::remove_var("LOG_TRANSPORT") };
    }

    #[tokio::test]
    async fn run_main_with_file_reporter() {
        unsafe { std::env::set_var("TRACING_ENABLE", "true") };
        unsafe { std::env::set_var("TRACING_REPORTER", "file") };
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
        unsafe { std::env::remove_var("TRACING_ENABLE") };
        unsafe { std::env::remove_var("TRACING_REPORTER") };
    }

    #[tokio::test]
    async fn run_main_with_otel_reporter() {
        unsafe { std::env::set_var("TRACING_ENABLE", "true") };
        unsafe { std::env::set_var("TRACING_REPORTER", "otel") };
        // OTLP init will log a warning and disable tracing — that's fine
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
        unsafe { std::env::remove_var("TRACING_ENABLE") };
        unsafe { std::env::remove_var("TRACING_REPORTER") };
    }

    #[tokio::test]
    async fn run_main_with_tracing_console_reporter() {
        unsafe { std::env::set_var("TRACING_ENABLE", "true") };
        unsafe { std::env::set_var("TRACING_REPORTER", "console") };
        let code = run_main_with_args(["rusttp", "hc"]).await;
        assert_eq!(code, 0);
        unsafe { std::env::remove_var("TRACING_ENABLE") };
        unsafe { std::env::remove_var("TRACING_REPORTER") };
    }

    #[tokio::test]
    async fn run_main_with_dispatch_error() {
        // Invalid host causes socket_addr() to fail -> dispatch error path
        let code = run_main_with_args(["rusttp", "serve", "--host", "!", "--port", "0"]).await;
        assert_eq!(code, 1);
    }
}
