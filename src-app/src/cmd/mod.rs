mod health;
mod serve;

use anyhow::Result;
use clap::{CommandFactory, Parser, Subcommand};

const VERSION: &str = concat!(
    env!("CARGO_PKG_VERSION"),
    " ",
    env!("BUILD_OS"),
    "/",
    env!("BUILD_ARCH"),
    " (",
    env!("GIT_HASH"),
    " ",
    env!("BUILD_TIME"),
    ")"
);

/// Rusttp — Axum web application
#[derive(Parser)]
#[command(name = "rusttp", about, version = VERSION)]
pub struct Cli {
    /// Load env file, will override system envars
    #[arg(long = "env-file", global = true)]
    pub env_file: Option<String>,

    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Start the web server
    #[command(alias = "s")]
    Serve {
        /// Host to bind the server
        #[arg(long, default_value = "0.0.0.0", env = "HOST")]
        host: String,

        /// Port to listen on
        #[arg(long, default_value = "3080", env = "PORT")]
        port: u16,
    },

    /// Check server health
    #[command(alias = "hc")]
    Health,
}

pub async fn dispatch(cli: &Cli) -> Result<i32> {
    match &cli.command {
        None => {
            let mut cmd = Cli::command();
            let _ = cmd.print_help();
            println!();
            Ok(0)
        }
        Some(Commands::Serve { host, port }) => serve::handle(host.clone(), *port).await,
        Some(Commands::Health) => Ok(health::handle()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::Parser;

    #[test]
    fn cli_no_args_is_none() {
        let cli = Cli::try_parse_from(["rusttp"]).unwrap();
        assert!(cli.command.is_none());
    }

    #[test]
    fn cli_serve_subcommand() {
        let cli = Cli::try_parse_from(["rusttp", "serve"]).unwrap();
        assert!(matches!(cli.command, Some(Commands::Serve { .. })));
    }

    #[test]
    fn cli_serve_alias_s() {
        let cli = Cli::try_parse_from(["rusttp", "s"]).unwrap();
        assert!(matches!(cli.command, Some(Commands::Serve { .. })));
    }

    #[test]
    fn cli_serve_defaults_host_and_port() {
        let cli = Cli::try_parse_from(["rusttp", "serve"]).unwrap();
        if let Some(Commands::Serve { host, port }) = &cli.command {
            assert_eq!(host, "0.0.0.0");
            assert_eq!(*port, 3080);
        }
    }

    #[test]
    fn cli_serve_parses_host_and_port() {
        let cli = Cli::try_parse_from(["rusttp", "serve", "--host", "127.0.0.1", "--port", "9090"]).unwrap();
        if let Some(Commands::Serve { host, port }) = &cli.command {
            assert_eq!(host, "127.0.0.1");
            assert_eq!(*port, 9090);
        }
    }

    #[test]
    fn cli_health_subcommand() {
        let cli = Cli::try_parse_from(["rusttp", "health"]).unwrap();
        assert!(matches!(cli.command, Some(Commands::Health)));
    }

    #[test]
    fn cli_health_alias_hc() {
        let cli = Cli::try_parse_from(["rusttp", "hc"]).unwrap();
        assert!(matches!(cli.command, Some(Commands::Health)));
    }

    #[test]
    fn dispatch_health_returns_zero() {
        let cli = Cli::try_parse_from(["rusttp", "health"]).unwrap();
        let rt = tokio::runtime::Runtime::new().unwrap();
        let code = rt.block_on(dispatch(&cli)).unwrap();
        assert_eq!(code, 0);
    }

    #[tokio::test]
    async fn dispatch_none_shows_help() {
        let cli = Cli::try_parse_from(["rusttp"]).unwrap();
        let code = dispatch(&cli).await.unwrap();
        assert_eq!(code, 0);
    }
}
