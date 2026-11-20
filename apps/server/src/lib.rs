//! HTTP application for the Rusttp server.

mod transport;

use axum::Router;

/// Builds the application router: Connect RPC, REST, and the SPA.
///
/// # Errors
///
/// When the SPA document cannot be set up (an `index.html` without `</head>`, a bad
/// `VITE_DEV_SERVER`).
pub fn build_app() -> Result<Router, Box<dyn std::error::Error + Send + Sync>> {
    Ok(transport::router()?)
}

/// Binds `addr` and serves the application until Ctrl-C.
pub async fn serve(addr: &str) -> std::io::Result<()> {
    transport::server::serve(addr).await
}
