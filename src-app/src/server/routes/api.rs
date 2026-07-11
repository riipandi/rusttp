use axum::{Json, Router, routing::get};
use serde::Serialize;

use crate::server::error;

#[derive(Serialize)]
pub struct RootResponse {
    pub message: &'static str,
}

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
}

async fn root() -> Json<RootResponse> {
    Json(RootResponse {
        message: "rusttp is running",
    })
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

pub fn router() -> Router {
    Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/healthz", get(health))
        .fallback(error::not_found)
        .method_not_allowed_fallback(error::method_not_allowed)
}
