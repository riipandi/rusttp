mod api;
mod rpc;
mod web;

use axum::Router;

pub fn router() -> Router {
    Router::new()
        .nest("/api", api::router())
        .nest("/rpc", rpc::router())
        .route("/", axum::routing::get(web::serve_index))
        .fallback(web::serve_fallback)
}
