//! HTTP transport. Connect RPC (the primary protocol) on `/rpc`, REST for external integrations
//! (OAuth/OIDC, webhooks) on `/api`, Storybook on `/storybook` outside production, and the SPA on
//! every other path. Errors under `/api` and `/rpc` are always JSON; everywhere else they fall back
//! to the SPA document or a static HTML page.

mod http;
mod rpc;
pub(crate) mod server;
mod spa;
mod r#static;
mod storybook;

use axum::{Router, routing::get};

use tower_http::catch_panic::CatchPanicLayer;
use tower_http::trace::TraceLayer;

use crate::config::AppMode;

pub(crate) fn router(mode: AppMode) -> Result<Router, vixum::Error> {
    let mut app = Router::new()
        .route("/healthz", get(healthz))
        .nest("/api", http::router())
        .nest("/rpc", rpc::router());
    // Left unmounted in production, `/storybook` falls through to the SPA's own 404.
    if mode.serves_dev_tools() {
        app = app.merge(storybook::router());
    }
    Ok(app
        .merge(spa::router()?)
        // `/api` and `/rpc` catch their own panics as JSON first; this one only sees the SPA's.
        .layer(CatchPanicLayer::custom(r#static::internal_error))
        .layer(TraceLayer::new_for_http()))
}

async fn healthz() -> &'static str {
    "ok"
}
