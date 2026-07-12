use axum::Router;
use tower_http::catch_panic::CatchPanicLayer;

use super::{error, middleware as mw, routes};

pub fn build() -> Router {
    let mut app = routes::router()
        .layer(axum::middleware::from_fn(mw::trim_trailing_slash))
        .layer(axum::middleware::from_fn(mw::request_logger))
        .layer(CatchPanicLayer::custom(|_| error::panic_response()));

    // TRACING_ENABLE controls whether fastrace traces are collected at all.
    // Default: false (max perf). Set to "true" to enable span collection.
    if std::env::var("TRACING_ENABLE").as_deref() == Ok("true") {
        let sample_rate: f64 = std::env::var("TRACING_SAMPLING")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(0.7);
        let sample_rate = sample_rate.clamp(0.0, 1.0);

        app = app.layer(
            fastrace_axum::FastraceLayer::default().with_span_context_extractor(move |_req| {
                if sample_rate >= 1.0 || rand::random::<f64>() < sample_rate {
                    Some(fastrace::collector::SpanContext::random())
                } else {
                    None // noop span — request still runs, no tracing overhead
                }
            }),
        );
    }

    app
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
