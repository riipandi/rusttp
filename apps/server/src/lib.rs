//! HTTP application for the Rusttp server.

mod transport;

use axum::Router;

/// Builds the application router: Connect RPC, REST, and the SPA.
pub fn build_app() -> Router {
    transport::router()
}

/// Binds `addr` and serves the application until Ctrl-C.
pub async fn serve(addr: &str) -> std::io::Result<()> {
    transport::server::serve(addr).await
}
