mod error;
mod middleware;
mod router;
mod routes;
mod web_assets;
pub use error::AppError;
pub use router::build;
use std::net::SocketAddr;

use anyhow::{Context, Result};
use axum::serve;
use tokio::net::TcpListener;
use tokio::signal;

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

impl ServerConfig {
    pub fn new(host: impl Into<String>, port: u16) -> Self {
        Self {
            host: host.into(),
            port,
        }
    }

    pub fn socket_addr(&self) -> Result<SocketAddr> {
        format!("{}:{}", self.host, self.port)
            .parse()
            .with_context(|| format!("invalid listen address {}:{}", self.host, self.port))
    }
}

/// Start the server with a graceful shutdown triggered by an external future.
/// Tests use this with a oneshot channel so the server exits without signals.
pub async fn run_with_shutdown(
    config: ServerConfig,
    shutdown: impl std::future::Future<Output = ()> + Send + 'static,
) -> Result<()> {
    let addr = config.socket_addr()?;
    let app = build();
    let listener = TcpListener::bind(addr).await?;
    log::info!("server ready on {addr}");
    serve(listener, app)
        .with_graceful_shutdown(shutdown)
        .await?;
    Ok(())
}

/// Start the server and wait for Ctrl+C or SIGTERM.
pub async fn run(config: ServerConfig) -> Result<()> {
    run_with_shutdown(config, shutdown_signal()).await
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            // INVARIANT: Ctrl+C handler install fails only if OS is broken — unrecoverable
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            // INVARIANT: SIGTERM handler install fails only if OS is broken — unrecoverable
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }

    log::info!("server shutting down");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn server_config_new_sets_host_and_port() {
        let cfg = ServerConfig::new("127.0.0.1", 8080);
        assert_eq!(cfg.host, "127.0.0.1");
        assert_eq!(cfg.port, 8080);
    }

    #[test]
    fn server_config_socket_addr_returns_ok() {
        let cfg = ServerConfig::new("0.0.0.0", 3080);
        let addr = cfg.socket_addr().unwrap();
        assert_eq!(addr.to_string(), "0.0.0.0:3080");
    }

    #[test]
    fn server_config_socket_addr_fails_on_bad_host() {
        let cfg = ServerConfig::new("", 3080);
        assert!(cfg.socket_addr().is_err());
    }

    #[test]
    fn build_returns_router() {
        let _ = super::build();
    }

    #[tokio::test]
    async fn run_with_shutdown_accepts_external_signal() {
        let cfg = ServerConfig::new("127.0.0.1", 0);
        let (tx, rx) = tokio::sync::oneshot::channel::<()>();
        let shutdown = async {
            let _ = rx.await;
        };
        tokio::spawn(async {
            tokio::time::sleep(Duration::from_millis(50)).await;
            let _ = tx.send(());
        });
        run_with_shutdown(cfg, shutdown).await.unwrap();
    }

    #[tokio::test]
    async fn shutdown_signal_responds_to_sigterm() {
        let task = tokio::spawn(async { shutdown_signal().await });
        tokio::time::sleep(Duration::from_millis(200)).await;
        // Send SIGTERM to our process — tokio's handler intercepts it
        std::process::Command::new("kill")
            .args(["-s", "TERM", &std::process::id().to_string()])
            .status()
            .unwrap();
        tokio::time::timeout(Duration::from_secs(5), task)
            .await
            .unwrap()
            .unwrap();
    }
}
