//! A server-rendered document for a Vite SPA on axum.
//!
//! The server owns the HTML document: the app's [`Shell`] (shared head markup, the loader inside
//! the root element), each page's own head and status from a [`Page`], and the entry's tags.
//! Vite only compiles and serves modules and assets.
//!
//! - [`Vixum::embedded`] takes the entry's script, stylesheet, and modulepreload tags from the
//!   build manifest and serves every other file from the given assets router.
//! - [`Vixum::dev`] runs each document through the Vite dev server's `transformIndexHtml` (the
//!   HMR client, the React preamble, other plugins' tags) and proxies every other request to it,
//!   so the browser only ever talks to the server's port. The Vite side is the `vixum` plugin in
//!   `packages/webapp/plugins/vixum.ts`.
//!
//! With a route table (TanStack Router's navigable full paths, with each route's title and
//! description from its `staticData`), a navigation no route matches answers 404 while the body
//! stays the SPA, which renders its own not-found page; a match carries its path params.

mod dev;
mod page;
mod routes;
mod shell;

use std::fmt;
use std::sync::Arc;

use axum::Router;
use axum::body::Body;
use axum::extract::Request;
use axum::http::{HeaderValue, Method, StatusCode, header, request::Parts};
use axum::response::{IntoResponse, Response};
use tower::ServiceExt;

pub use page::Page;
pub use routes::Route;
pub use shell::Shell;

use routes::Routes;

/// The document renderer and the files around it.
pub struct Vixum {
    shell: Shell,
    mode: Mode,
}

enum Mode {
    Embedded {
        tags: String,
        routes: Option<Routes>,
        assets: Router,
    },
    Dev(Box<dev::Dev>),
}

impl Vixum {
    /// Renders with the entry tags from Vite's build `manifest` and serves other files from
    /// `assets`. `routes` is the route table the `vixum` Vite plugin writes (`routes.json`: an
    /// array of `{"path", "title"?, "description"?}`); `null` means no route table, so every
    /// navigation answers 200.
    ///
    /// # Errors
    ///
    /// When the manifest has no entry chunk, or either JSON document does not parse.
    pub fn embedded(shell: Shell, manifest: &str, routes: &str, assets: Router) -> Result<Self, Error> {
        Ok(Self {
            shell,
            mode: Mode::Embedded {
                tags: shell::entry_tags(manifest)?,
                routes: routes::parse(routes)?,
                assets,
            },
        })
    }

    /// Renders through, and proxies to, the Vite dev server at `origin` (e.g.
    /// `http://127.0.0.1:5173`); `entry` is the module the document loads (e.g. `/app/main.tsx`).
    ///
    /// # Errors
    ///
    /// When `origin` is not an absolute `http` URL.
    pub fn dev(shell: Shell, origin: &str, entry: &str) -> Result<Self, Error> {
        Ok(Self {
            shell,
            mode: Mode::Dev(Box::new(dev::Dev::new(origin, entry)?)),
        })
    }

    /// A router that answers every request: a navigation with the document for the page
    /// `resolve` returns (given the request and its [`Route`]), anything else with the asset (or
    /// the dev server's answer).
    pub fn into_router<F, Fut>(self, resolve: F) -> Router
    where
        F: Fn(Parts, Route) -> Fut + Clone + Send + Sync + 'static,
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
        F: Fn(Parts, Route) -> Fut,
        Fut: Future<Output = Page>,
    {
        if !is_navigation(&req) {
            return match &self.mode {
                // The build's own bookkeeping is read at compile time, never served.
                Mode::Embedded { .. } if is_build_metadata(req.uri().path()) => StatusCode::NOT_FOUND.into_response(),
                Mode::Embedded { assets, .. } => match assets.clone().oneshot(req).await {
                    Ok(res) => res,
                    Err(never) => match never {},
                },
                Mode::Dev(dev) => dev.forward(req).await,
            };
        }

        let (parts, _body) = req.into_parts();
        let uri = parts.uri.clone();
        let route = match &self.mode {
            Mode::Embedded { routes, .. } => routes.as_ref().map_or(Route::Unknown, |r| r.find(uri.path())),
            Mode::Dev(dev) => dev.routes().await.map_or(Route::Unknown, |r| r.find(uri.path())),
        };
        let page = resolve(parts, route).await;
        let mut head = String::new();
        page.write_head(&mut head);
        let html = match &self.mode {
            Mode::Embedded { tags, .. } => self.shell.render(&head, tags),
            Mode::Dev(dev) => match dev.transform(&uri, &self.shell.render(&head, &dev.entry_tag())).await {
                Ok(html) => html,
                Err(reason) => return dev::unavailable(&reason),
            },
        };
        document(html, &page)
    }
}

/// A navigation gets the document: a `GET`/`HEAD` that asks for HTML, or one for a path without
/// a file extension (crawlers and `curl` send `*/*`). The same rule holds in both modes, so a
/// request answers alike in dev and production; paths under `/@…` and `/__…` (Vite's modules,
/// the dev endpoints) never count.
fn is_navigation(req: &Request) -> bool {
    if req.method() != Method::GET && req.method() != Method::HEAD {
        return false;
    }
    let path = req.uri().path();
    if path.starts_with("/@") || path.starts_with("/__") {
        return false;
    }
    let accepts_html = req
        .headers()
        .get(header::ACCEPT)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.contains("text/html"));
    let no_extension = !path.rsplit('/').next().unwrap_or_default().contains('.');
    accepts_html || no_extension
}

fn is_build_metadata(path: &str) -> bool {
    path.starts_with("/.vite/") || path == "/routes.json"
}

fn document(html: String, page: &Page) -> Response {
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

/// A document that cannot be set up: a build manifest or route table that does not parse, or a
/// dev server origin that does not.
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

    const MANIFEST: &str = r#"{"app/main.tsx": {"file": "assets/main-abc.js", "isEntry": true}}"#;

    fn app(routes: &str) -> Router {
        let assets = Router::new().route("/assets/main-abc.js", get(|| async { "console.log('lumos')" }));
        let shell = Shell::new("en").head("<meta charset=\"utf-8\">").body("<p>Loading</p>");
        Vixum::embedded(shell, MANIFEST, routes, assets).unwrap().into_router(
            |_parts: Parts, route: Route| async move {
                match route {
                    Route::NotFound => Page::new("Not Found").status(StatusCode::NOT_FOUND).noindex(true),
                    _ if route.param("vaultId") == Some("713") => {
                        Page::new("Vault 713 - Gringotts").description("Where the Philosopher's Stone was kept.")
                    }
                    _ => Page::new("Gringotts"),
                }
            },
        )
    }

    async fn get_body(app: Router, uri: &str, accept: &str) -> (StatusCode, String) {
        let res = app
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
    async fn navigation_renders_the_shell_page_head_and_entry() {
        let (status, html) = get_body(
            app(r#"[{"path": "/vaults/$vaultId", "title": "Vault"}]"#),
            "/vaults/713",
            "text/html",
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert!(html.starts_with(
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Vault 713 - Gringotts</title>"
        ));
        assert!(html.contains("Philosopher&#39;s Stone"));
        assert!(html.contains("<script type=\"module\" crossorigin src=\"/assets/main-abc.js\"></script></head>"));
        assert!(html.ends_with("<div id=\"root\"><p>Loading</p></div></body></html>"));
    }

    #[tokio::test]
    async fn an_unmatched_route_answers_404_with_the_spa() {
        let routes = r#"[{"path": "/"}, {"path": "/vaults/$vaultId"}]"#;
        let (status, _) = get_body(app(routes), "/vaults/713", "*/*").await;
        assert_eq!(status, StatusCode::OK);
        let (status, html) = get_body(app(routes), "/chamber-of-secrets", "*/*").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert!(html.contains("noindex, nofollow"));
        assert!(html.contains("/assets/main-abc.js"));
    }

    #[tokio::test]
    async fn assets_bypass_the_document() {
        let (status, body) = get_body(app("null"), "/assets/main-abc.js", "*/*").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body, "console.log('lumos')");
        let (status, _) = get_body(app("null"), "/assets/missing.js", "*/*").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn build_metadata_is_not_served() {
        let assets = Router::new().route("/routes.json", get(|| async { "[]" }));
        let app = Vixum::embedded(Shell::new("en"), MANIFEST, "null", assets)
            .unwrap()
            .into_router(|_: Parts, _: Route| async { Page::new("Rusttp") });
        let (status, _) = get_body(app, "/routes.json", "*/*").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[test]
    fn navigation_is_the_same_rule_in_both_modes() {
        let nav = |path: &str, accept: &str| {
            is_navigation(
                &Request::get(path)
                    .header(header::ACCEPT, accept)
                    .body(Body::empty())
                    .unwrap(),
            )
        };
        assert!(nav("/vaults/713", "*/*"));
        assert!(nav("/vaults/v1.2", "text/html"));
        assert!(!nav("/assets/main-abc.js", "*/*"));
        assert!(!nav("/@vite/client", "*/*"));
        assert!(!nav("/@react-refresh", "text/html"));
        assert!(!nav("/__vixum/routes.json", "*/*"));
    }

    #[test]
    fn bad_inputs_are_refused() {
        assert!(Vixum::embedded(Shell::new("en"), "{}", "null", Router::new()).is_err());
        assert!(Vixum::embedded(Shell::new("en"), MANIFEST, "{", Router::new()).is_err());
        assert!(Vixum::dev(Shell::new("en"), "localhost:5173", "/app/main.tsx").is_err());
    }
}
