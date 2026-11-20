//! Rusttp server binary.

mod cmd;

use std::process::ExitCode;

use clap::Parser;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::filter::LevelFilter;

#[tokio::main]
async fn main() -> ExitCode {
    let cli = cmd::Cli::parse();
    let filter = log_filter(std::env::var("LOG_LEVEL").ok().as_deref());
    // Module paths help when debugging internals; at `info` and above they are noise, so they
    // print only when some directive enables `debug` or `trace`.
    let with_target = filter.max_level_hint().is_some_and(|level| level >= LevelFilter::DEBUG);
    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(with_target)
        .init();

    match cli.run().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) => {
            eprintln!("error: {err}");
            ExitCode::FAILURE
        }
    }
}

/// The filter from `LOG_LEVEL`: a level (`info`) or `EnvFilter` directives (`info,vixum=debug`),
/// `info` when unset or invalid. memory-serve's per-asset `info` lines stay at `warn` unless a
/// directive names it.
fn log_filter(level: Option<&str>) -> EnvFilter {
    // A bare word must be a level: EnvFilter reads any other word as a target enabled at `trace`.
    let level = level
        .map(str::trim)
        .filter(|level| !level.is_empty())
        .filter(|level| level.contains(['=', ',']) || level.parse::<LevelFilter>().is_ok())
        .unwrap_or("info");
    let directives = if level.contains("memory_serve") {
        level.to_owned()
    } else {
        format!("{level},memory_serve=warn")
    };
    EnvFilter::try_new(directives).unwrap_or_else(|_| EnvFilter::new("info,memory_serve=warn"))
}

#[cfg(test)]
mod tests {
    use tracing_subscriber::filter::LevelFilter;

    use super::log_filter;

    #[test]
    fn log_level_accepts_a_level_or_directives() {
        assert_eq!(log_filter(None).max_level_hint(), Some(LevelFilter::INFO));
        assert_eq!(log_filter(Some("warn")).max_level_hint(), Some(LevelFilter::WARN));
        assert_eq!(
            log_filter(Some("info,rusttp_server=debug")).max_level_hint(),
            Some(LevelFilter::DEBUG)
        );
        assert_eq!(log_filter(Some("not a level!")).max_level_hint(), Some(LevelFilter::INFO));
        assert_eq!(log_filter(Some("")).max_level_hint(), Some(LevelFilter::INFO));
    }
}
