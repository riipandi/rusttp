//! HTTP application for the Rusttp server.

use axum::{Router, routing::get};
use tower_http::trace::TraceLayer;

/// Builds the application router.
pub fn build_app() -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .layer(TraceLayer::new_for_http())
}

async fn healthz() -> &'static str {
    "ok"
}
