//! The SPA. The server renders its document through vixum so each page carries its own head and
//! status; in a debug build started by the Vite plugin (`VITE_DEV_SERVER` set) everything else is
//! proxied to Vite, otherwise it is served from `apps/server/frontend` (see `build.rs`).

use axum::Router;
use axum::http::request::Parts;
use vixum::{Page, Vixum};

pub(super) fn router() -> Result<Router, vixum::Error> {
    #[cfg(debug_assertions)]
    if let Ok(origin) = std::env::var("VITE_DEV_SERVER") {
        return Ok(Vixum::dev(&origin)?.into_router(page));
    }
    let assets = memory_serve::load!().index_file(None).into_router();
    Ok(Vixum::embedded(include_str!("../../frontend/index.html"), assets)?.into_router(page))
}

/// The head for each path. Every path answers the SPA, so the default is the app's own page;
/// match on `parts.uri` here (and load data) to give a route its title, description, and status.
async fn page(_parts: Parts) -> Page {
    Page::new("Rusttp").description("Rusttp web application").noindex(true)
}

#[cfg(test)]
mod tests {
    use axum::body::{Body, to_bytes};
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    #[tokio::test]
    async fn unknown_page_renders_the_spa_document() {
        let res = crate::transport::router()
            .unwrap()
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
        let html = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        assert!(String::from_utf8_lossy(&html).contains("<title>Rusttp</title>"));
    }
}
