//! HTTP transport. Connect RPC (the primary protocol) on `/rpc`, REST for external integrations
//! (OAuth/OIDC, webhooks) on `/api`, and the SPA on every other path. Errors under `/api` and
//! `/rpc` are always JSON; everywhere else they fall back to the SPA document or a static HTML page.

mod http;
mod rpc;
pub(crate) mod server;
mod spa;
mod r#static;

use axum::{Router, routing::get};
use tower_http::catch_panic::CatchPanicLayer;
use tower_http::trace::TraceLayer;

pub(crate) fn router() -> Result<Router, vixum::Error> {
    Ok(Router::new()
        .route("/healthz", get(healthz))
        .nest("/api", http::router())
        .nest("/rpc", rpc::router())
        .merge(spa::router()?)
        // `/api` and `/rpc` catch their own panics as JSON first; this one only sees the SPA's.
        .layer(CatchPanicLayer::custom(r#static::internal_error))
        .layer(TraceLayer::new_for_http()))
}

async fn healthz() -> &'static str {
    "ok"
}
