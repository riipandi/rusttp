//! Rusttp server binary.

use clap::{Parser, Subcommand};
use tokio::net::TcpListener;

#[derive(Parser)]
#[command(version, about)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Start the HTTP server
    Serve {
        /// Address to listen on [env: BIND_ADDR] [default: 127.0.0.1:3000]
        #[arg(long)]
        bind: Option<String>,
    },
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let cli = Cli::parse();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    match cli.command {
        Command::Serve { bind } => {
            let addr = bind
                .or_else(|| std::env::var("BIND_ADDR").ok())
                .unwrap_or_else(|| "127.0.0.1:3000".to_string());
            serve(&addr).await
        }
    }
}

async fn serve(addr: &str) -> std::io::Result<()> {
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(%addr, "listening");
    axum::serve(listener, rusttp_server::build_app())
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
}
