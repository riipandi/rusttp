//! The SPA from `apps/server/frontend` (see `build.rs`). An unknown path answers `index.html`
//! with 200, so the client router renders its own not-found page.

use axum::Router;
use axum::http::StatusCode;

pub(super) fn router() -> Router {
    memory_serve::load!()
        .index_file(Some("/index.html"))
        .fallback(Some("/index.html"))
        .fallback_status(StatusCode::OK)
        .into_router()
}

#[cfg(test)]
mod tests {
    use axum::body::Body;
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    #[tokio::test]
    async fn unknown_page_falls_back_to_the_spa() {
        let res = crate::transport::router()
            .oneshot(Request::get("/vatican/archives").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        assert!(
            res.headers()[header::CONTENT_TYPE]
                .to_str()
                .unwrap()
                .starts_with("text/html")
        );
    }
}
