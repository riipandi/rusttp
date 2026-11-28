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
use memory_serve::CacheControl;
#[cfg(storybook)]
use tower::ServiceExt;

/// Storybook's own links are relative (`./iframe.html`), so they resolve under `/storybook/` only
/// with the trailing slash. memory-serve would mount its index on the bare `/storybook`, so the
/// index is turned off and the two forms are routed here: the bare path redirects, the slash path
/// serves `index.html` through the same asset router (keeping encoding and ETag handling).
///
/// Every file answers `Cache-Control: no-cache`, HTML included: `index.json`, `sb-manager/*` and
/// `sb-addons/*` are not content-hashed, so any `max-age` lets a browser read a stale story index
/// beside new hashed chunks. `no-cache` still revalidates with the ETag, so an unchanged file
/// costs a 304.
#[cfg(storybook)]
pub(super) fn router() -> Router {
    let assets = memory_serve::load!("storybook")
        .index_file(None)
        .cache_control(CacheControl::NoCache)
        .html_cache_control(CacheControl::NoCache)
        .into_router();
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
    use axum::body::{Body, Bytes, to_bytes};
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

    /// Status, content type, and body of a path, to compare one answer with another.
    async fn answer(mode: AppMode, path: &str) -> (StatusCode, Option<String>, Bytes) {
        let res = get(mode, path).await;
        let status = res.status();
        let kind = res
            .headers()
            .get(header::CONTENT_TYPE)
            .map(|v| v.to_str().unwrap().to_owned());
        (status, kind, to_bytes(res.into_body(), usize::MAX).await.unwrap())
    }

    // A build without the SPA has no route table, so an unknown path answers 200 there and 404 in
    // a built one. Either way a Storybook path must be answered exactly like any unknown path.
    #[tokio::test]
    async fn production_answers_every_storybook_path_like_an_unknown_one() {
        let unknown = answer(AppMode::Production, "/no-such-page").await;
        for path in [
            "/storybook",
            "/storybook/",
            "/storybook/index.html",
            "/storybook/iframe.html",
        ] {
            assert_eq!(answer(AppMode::Production, path).await, unknown, "{path}");
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

            // Storybook's own 404 is the app's: a missing file is not served as its index.
            assert_eq!(
                answer(mode, "/storybook/missing.html").await,
                answer(mode, "/no-such-page").await
            );
        }
    }
    // Storybook's manager files and `index.json` keep one name across builds, so any `max-age`
    // lets a browser pair an old index with new chunks (the Docs `of` error). `no-cache` makes the
    // browser revalidate every file against its ETag, which answers 304 while nothing changed.
    #[cfg(storybook)]
    #[tokio::test]
    async fn storybook_files_revalidate_instead_of_being_cached() {
        let built = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("storybook");
        let mut paths = vec!["/storybook/".to_owned(), "/storybook/index.html".to_owned()];
        // The stub page is all a server built before `storybook:build` has.
        for name in ["index.json", "iframe.html"] {
            if built.join(name).exists() {
                paths.push(format!("/storybook/{name}"));
            }
        }
        if let Some(asset) = std::fs::read_dir(built.join("assets"))
            .ok()
            .and_then(|dir| dir.flatten().next())
        {
            paths.push(format!("/storybook/assets/{}", asset.file_name().to_string_lossy()));
        }

        for path in paths {
            let res = get(AppMode::Development, &path).await;
            assert_eq!(res.status(), StatusCode::OK, "{path}");
            assert_eq!(res.headers()[header::CACHE_CONTROL], "no-cache", "{path}");

            let etag = res.headers()[header::ETAG].clone();
            let revalidated = crate::transport::router(AppMode::Development)
                .unwrap()
                .oneshot(
                    Request::get(&path)
                        .header(header::ACCEPT, "text/html")
                        .header(header::IF_NONE_MATCH, etag)
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_eq!(revalidated.status(), StatusCode::NOT_MODIFIED, "{path}");
        }
    }
}
