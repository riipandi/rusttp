//! HTTP application for the Rusttp server.

use axum::{Router, routing::get};

/// Builds the application router.
pub fn build_app() -> Router {
    Router::new().route("/healthz", get(healthz))
}

async fn healthz() -> &'static str {
    "ok"
}
