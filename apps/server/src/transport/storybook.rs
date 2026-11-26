//! Storybook, the UI library's documentation, embedded like the SPA (`build.rs`) and served under
//! `/storybook/`. Only `transport::router` decides whether to mount it (`AppMode`); in production
//! the router is never built, so nothing answers and the path falls through to the SPA's 404.
//! A build with `STORYBOOK=false` (`build.rs`) does not embed Storybook and compiles `router` to an
//! empty one, so the same 404 answers in every mode.

use axum::Router;
#[cfg(storybook)]
use axum::extract::{Request, State};
#[cfg(storybook)]
use axum::http::Uri;
#[cfg(storybook)]
use axum::response::{Redirect, Response};
#[cfg(storybook)]
use axum::routing::get;
#[cfg(storybook)]
use tower::ServiceExt;

/// Storybook's own links are relative (`./iframe.html`), so they resolve under `/storybook/` only
/// with the trailing slash. memory-serve would mount its index on the bare `/storybook`, so the
/// index is turned off and the two forms are routed here: the bare path redirects, the slash path
/// serves `index.html` through the same asset router (keeping encoding and ETag handling).
#[cfg(storybook)]
pub(super) fn router() -> Router {
    let assets = memory_serve::load!("storybook").index_file(None).into_router();
    Router::new()
        .route("/storybook", get(|| async { Redirect::temporary("/storybook/") }))
        .route("/storybook/", get(index).with_state(assets.clone()))
        .nest("/storybook", assets)
}

#[cfg(not(storybook))]
pub(super) fn router() -> Router {
    Router::new()
}

#[cfg(storybook)]
async fn index(State(assets): State<Router>, mut req: Request) -> Response {
    *req.uri_mut() = Uri::from_static("/index.html");
    match assets.oneshot(req).await {
        Ok(res) => res,
        Err(never) => match never {},
    }
}

#[cfg(test)]
mod tests {
    use axum::body::Body;
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    use crate::config::AppMode;

    async fn get(mode: AppMode, path: &str) -> axum::response::Response {
        crate::transport::router(mode)
            .unwrap()
            .oneshot(
                Request::get(path)
                    .header(header::ACCEPT, "text/html")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap()
    }

    #[tokio::test]
    async fn production_answers_the_spa_404_on_every_storybook_path() {
        for path in [
            "/storybook",
            "/storybook/",
            "/storybook/index.html",
            "/storybook/iframe.html",
        ] {
            let res = get(AppMode::Production, path).await;
            assert_eq!(res.status(), StatusCode::NOT_FOUND, "{path}");
            assert!(
                res.headers()[header::CONTENT_TYPE]
                    .to_str()
                    .unwrap()
                    .starts_with("text/html")
            );
        }
    }

    #[cfg(storybook)]
    #[tokio::test]
    async fn other_modes_serve_storybook_under_its_prefix() {
        for mode in [AppMode::Development, AppMode::Test] {
            let res = get(mode, "/storybook").await;
            assert_eq!(res.status(), StatusCode::TEMPORARY_REDIRECT);
            assert_eq!(res.headers()[header::LOCATION], "/storybook/");

            let res = get(mode, "/storybook/").await;
            assert_eq!(res.status(), StatusCode::OK);
            assert!(
                res.headers()[header::CONTENT_TYPE]
                    .to_str()
                    .unwrap()
                    .starts_with("text/html")
            );

            let res = get(mode, "/storybook/index.html").await;
            assert_eq!(res.status(), StatusCode::OK);

            let res = get(mode, "/storybook/missing.html").await;
            assert_eq!(res.status(), StatusCode::NOT_FOUND);
        }
    }
}
