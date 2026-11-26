//! HTTP application for the Rusttp server.

mod config;
mod transport;

use axum::Router;

/// Builds the application router: Connect RPC, REST, and the SPA, plus Storybook on `/storybook`
/// unless `APP_MODE` is `production` (the default).
///
/// # Errors
///
/// When `APP_MODE` holds an unknown mode, or the SPA document cannot be set up (an `index.html`
/// without `</head>`, a bad `VITE_DEV_SERVER`).
pub fn build_app() -> Result<Router, Box<dyn std::error::Error + Send + Sync>> {
    Ok(transport::router(config::AppMode::from_env()?)?)
}

/// Binds `addr` and serves the application until Ctrl-C; `APP_MODE` is read as in [`build_app`].
pub async fn serve(addr: &str) -> std::io::Result<()> {
    let mode = config::AppMode::from_env().map_err(std::io::Error::other)?;
    transport::server::serve(addr, mode).await
}
