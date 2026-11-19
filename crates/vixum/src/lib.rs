//! A server-rendered document shell for a Vite SPA on axum.
//!
//! The server owns the HTML document, so every page answers with its own `<head>` (title,
//! description, Open Graph, canonical, JSON-LD) and status code for crawlers, while the body
//! stays the SPA's. The document is Vite's own `index.html` with the page's head written in
//! before `</head>`:
//!
//! - [`Vixum::embedded`] renders from the built `index.html` (the hashed script and style tags
//!   Vite wrote) and serves every other file from the given assets router.
//! - [`Vixum::dev`] fetches the transformed `index.html` from the Vite dev server per navigation
//!   (the HMR client and React preamble included) and proxies every other request to it, so the
//!   browser only ever talks to the server's port.

mod dev;
mod page;

use std::fmt;
use std::sync::Arc;

use axum::Router;
use axum::body::Body;
use axum::extract::Request;
use axum::http::{HeaderValue, Method, header, request::Parts};
use axum::response::{IntoResponse, Response};
use tower::ServiceExt;

pub use page::Page;

/// The document shell and the files around it.
pub struct Vixum {
    mode: Mode,
}

enum Mode {
    Embedded {
        before: &'static str,
        after: &'static str,
        assets: Router,
    },
    Dev(Box<dev::Dev>),
}

impl Vixum {
    /// Renders from a built `index.html` and serves other files from `assets`.
    ///
    /// # Errors
    ///
    /// When `index_html` has no `</head>` to write the page's head before.
    pub fn embedded(index_html: &'static str, assets: Router) -> Result<Self, Error> {
        let (before, after) = split_head(index_html)?;
        Ok(Self {
            mode: Mode::Embedded { before, after, assets },
        })
    }

    /// Renders from, and proxies to, the Vite dev server at `origin` (e.g. `http://127.0.0.1:5173`).
    ///
    /// # Errors
    ///
    /// When `origin` is not an absolute `http` URL.
    pub fn dev(origin: &str) -> Result<Self, Error> {
        Ok(Self {
            mode: Mode::Dev(Box::new(dev::Dev::new(origin)?)),
        })
    }

    /// A router that answers every request: a navigation with the document for the page
    /// `resolve` returns, anything else with the asset (or the dev server's answer).
    pub fn into_router<F, Fut>(self, resolve: F) -> Router
    where
        F: Fn(Parts) -> Fut + Clone + Send + Sync + 'static,
        Fut: Future<Output = Page> + Send + 'static,
    {
        let this = Arc::new(self);
        Router::new().fallback(move |req: Request| {
            let this = Arc::clone(&this);
            let resolve = resolve.clone();
            async move { this.handle(req, resolve).await }
        })
    }

    async fn handle<F, Fut>(&self, req: Request, resolve: F) -> Response
    where
        F: Fn(Parts) -> Fut,
        Fut: Future<Output = Page>,
    {
        let dev = matches!(self.mode, Mode::Dev(_));
        if !is_navigation(&req, dev) {
            return match &self.mode {
                Mode::Embedded { assets, .. } => match assets.clone().oneshot(req).await {
                    Ok(res) => res,
                    Err(never) => match never {},
                },
                Mode::Dev(dev) => dev.forward(req).await,
            };
        }

        let (parts, _body) = req.into_parts();
        let uri = parts.uri.clone();
        let page = resolve(parts).await;
        match &self.mode {
            Mode::Embedded { before, after, .. } => document(before, after, &page),
            Mode::Dev(dev) => match dev.index_html(&uri).await {
                Ok(html) => match split_head(&html) {
                    Ok((before, after)) => document(before, after, &page),
                    Err(err) => dev::unavailable(&err.0),
                },
                Err(reason) => dev::unavailable(&reason),
            },
        }
    }
}

/// A navigation gets the document. In dev only an explicit `Accept: text/html` counts, because
/// Vite's own paths (`/@vite/client`, `/@id/…`) have no extension either.
fn is_navigation(req: &Request, dev: bool) -> bool {
    if req.method() != Method::GET && req.method() != Method::HEAD {
        return false;
    }
    let accepts_html = req
        .headers()
        .get(header::ACCEPT)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.contains("text/html"));
    let no_extension = !req.uri().path().rsplit('/').next().unwrap_or_default().contains('.');
    accepts_html || (!dev && no_extension)
}

/// Splits at the last `</head>` before `<body`, so the text `</head>` in an earlier comment or
/// script does not move the page's head out of the real one.
fn split_head(html: &str) -> Result<(&str, &str), Error> {
    let body = html.find("<body").unwrap_or(html.len());
    html[..body]
        .rfind("</head>")
        .map(|at| html.split_at(at))
        .ok_or_else(|| Error("index.html has no </head>".into()))
}

fn document(before: &str, after: &str, page: &Page) -> Response {
    let mut html = String::with_capacity(before.len() + after.len() + 1024);
    html.push_str(before);
    page.write_head(&mut html);
    html.push_str(after);
    (
        page.status_code(),
        [
            (header::CONTENT_TYPE, HeaderValue::from_static("text/html; charset=utf-8")),
            // The document carries per-request head data; only the hashed assets are cacheable.
            (header::CACHE_CONTROL, HeaderValue::from_static("no-cache")),
        ],
        Body::from(html),
    )
        .into_response()
}

/// A shell that cannot be set up: a missing `</head>`, or a dev server origin that does not parse.
#[derive(Debug)]
pub struct Error(String);

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "vixum: {}", self.0)
    }
}

impl std::error::Error for Error {}

#[cfg(test)]
mod tests {
    use axum::body::{Body, to_bytes};
    use axum::http::{Request, StatusCode, header};
    use axum::routing::get;
    use tower::ServiceExt;

    use super::*;

    const INDEX: &str =
        "<html><head><script src=\"/assets/index-abc.js\"></script></head><body><div id=\"root\"></div></body></html>";

    fn app() -> Router {
        let assets = Router::new().route("/assets/index-abc.js", get(|| async { "console.log('lumos')" }));
        Vixum::embedded(INDEX, assets)
            .unwrap()
            .into_router(|parts: Parts| async move {
                if parts.uri.path() == "/vault/713" {
                    Page::new("Vault 713 - Gringotts").description("Where the Philosopher's Stone was kept.")
                } else {
                    Page::new("Not Found").status(StatusCode::NOT_FOUND).noindex(true)
                }
            })
    }

    async fn get_body(uri: &str, accept: &str) -> (StatusCode, String) {
        let res = app()
            .oneshot(
                Request::get(uri)
                    .header(header::ACCEPT, accept)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        let status = res.status();
        let body = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        (status, String::from_utf8(body.to_vec()).unwrap())
    }

    #[tokio::test]
    async fn navigation_renders_the_page_head_before_vites_tags_close() {
        let (status, html) = get_body("/vault/713", "text/html").await;
        assert_eq!(status, StatusCode::OK);
        assert!(html.contains("<title>Vault 713 - Gringotts</title>"));
        assert!(html.contains("Philosopher&#39;s Stone"));
        assert!(html.contains("index-abc.js\"></script><title>"));
        assert!(html.ends_with("</head><body><div id=\"root\"></div></body></html>"));
    }

    #[tokio::test]
    async fn the_resolver_sets_the_status() {
        let (status, html) = get_body("/chamber-of-secrets", "*/*").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert!(html.contains("<meta name=\"robots\" content=\"noindex, nofollow\">"));
    }

    #[tokio::test]
    async fn assets_bypass_the_document() {
        let (status, body) = get_body("/assets/index-abc.js", "*/*").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body, "console.log('lumos')");
        let (status, _) = get_body("/assets/missing.js", "*/*").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[test]
    fn the_real_head_end_wins_over_one_in_a_comment() {
        let (before, after) =
            split_head("<head><!-- ends at </head> --><script></script></head><body></body>").unwrap();
        assert!(before.ends_with("<script></script>"));
        assert_eq!(after, "</head><body></body>");
    }

    #[test]
    fn an_index_without_head_is_refused() {
        assert!(Vixum::embedded("<html><body></body></html>", Router::new()).is_err());
        assert!(Vixum::dev("localhost:5173").is_err());
    }
}
