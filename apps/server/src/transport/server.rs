use std::io;

use tokio::net::TcpListener;

/// Binds `addr` and serves the app until Ctrl-C.
pub(crate) async fn serve(addr: &str) -> io::Result<()> {
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(%addr, "listening");
    axum::serve(listener, super::router())
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
}
