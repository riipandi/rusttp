//! The SPA. The server renders the whole document through vixum (the shell in `stub/head.html`
//! and `stub/body.html`, each page's head and status, the entry's tags); in a debug build started
//! by the Vite plugin (`VITE_DEV_SERVER` set) modules and assets are proxied to Vite, otherwise
//! they are served from `apps/server/frontend` (see `build.rs`).

use axum::Router;
use axum::extract::Request;
use axum::http::request::Parts;
use axum::http::{HeaderValue, StatusCode, header};
use axum::middleware::{self, Next};
use axum::response::Response;
use vixum::{Page, Route, Shell, Vixum};

fn shell() -> Shell {
    Shell::new("en")
        .head(include_str!("../../stub/head.html"))
        .body(include_str!("../../stub/body.html"))
}

pub(super) fn router() -> Result<Router, vixum::Error> {
    #[cfg(debug_assertions)]
    if let Ok(origin) = std::env::var("VITE_DEV_SERVER") {
        return Ok(Vixum::dev(shell(), &origin, "/app/main.tsx")?.into_router(page));
    }
    let assets = memory_serve::load!()
        .index_file(None)
        .into_router()
        .layer(middleware::from_fn(immutable_assets));
    let manifest = include_str!("../../frontend/.vite/manifest.json");
    let routes = include_str!("../../frontend/routes.json");
    Ok(Vixum::embedded(shell(), manifest, routes, assets)?.into_router(page))
}

/// The head and status for each navigation. The title and description are the route's
/// `staticData` (`pageTitle`, `pageDescription`) from the SPA, with the same template
/// `__root.tsx` uses, so a crawler reads what the browser shows; a path TanStack Router has no
/// route for answers 404 (the SPA still renders its not-found page). For data-driven pages,
/// match on `route.pattern` and load by `route.param(...)` here.
async fn page(_parts: Parts, route: Route) -> Page {
    let title = route
        .title()
        .map_or_else(|| "Rusttp".to_owned(), |title| format!("{title} - Rusttp"));
    let page = Page::new(title)
        .description(route.description().unwrap_or("Rusttp web application"))
        .noindex(true);
    match route {
        Route::NotFound => page.status(StatusCode::NOT_FOUND),
        Route::Matched { .. } | Route::Unknown => page,
    }
}

/// Vite content-hashes everything under `/assets/`, so a file there never changes.
async fn immutable_assets(req: Request, next: Next) -> Response {
    let hashed = req.uri().path().starts_with("/assets/");
    let mut res = next.run(req).await;
    if hashed && res.status().is_success() {
        res.headers_mut().insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=31536000, immutable"),
        );
    }
    res
}

#[cfg(test)]
mod tests {
    use axum::body::{Body, to_bytes};
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    #[tokio::test]
    async fn a_page_renders_the_server_document() {
        let res = crate::transport::router(crate::config::AppMode::Production)
            .unwrap()
            .oneshot(Request::get("/").body(Body::empty()).unwrap())
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
        let html = String::from_utf8_lossy(&html);
        // "Home - Rusttp" from the SPA's route table, or "Rusttp" from a stub build without one.
        assert!(html.contains("<title>Home - Rusttp</title>") || html.contains("<title>Rusttp</title>"));
        assert!(html.contains("s-loader"));
        assert!(html.contains("<script type=\"module\""));
    }
}
