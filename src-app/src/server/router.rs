use axum::Router;
use tower_http::catch_panic::CatchPanicLayer;

use super::{error, middleware as mw, routes};

pub fn build() -> Router {
    routes::router()
        .layer(axum::middleware::from_fn(mw::trim_trailing_slash))
        .layer(axum::middleware::from_fn(mw::request_logger))
        .layer(CatchPanicLayer::custom(|_| error::panic_response()))
        // FastraceLayer outermost — captures the full request trace
        .layer(fastrace_axum::FastraceLayer::default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_returns_router_with_layers() {
        let router = build();
        // Router can be cloned (cheaply)
        let _clone = router.clone();
    }
}
