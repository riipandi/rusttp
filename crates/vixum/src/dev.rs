use axum::body::{Body, to_bytes};
use axum::extract::Request;
use axum::http::uri::{Authority, Scheme};
use axum::http::{HeaderValue, Method, StatusCode, Uri, header};
use axum::response::{Html, IntoResponse, Response};
use hyper_util::client::legacy::Client;
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::rt::TokioExecutor;

use crate::Error;
use crate::routes::{self, Routes};

/// The Vite dev server behind the server's port. The HMR socket does not pass through here: the
/// client connects to Vite directly (`server.hmr` in the Vite config), so a server restart never
/// drops it.
pub(crate) struct Dev {
    scheme: Scheme,
    authority: Authority,
    entry: String,
    client: Client<HttpConnector, Body>,
}

impl Dev {
    pub(crate) fn new(origin: &str, entry: &str) -> Result<Self, Error> {
        let uri: Uri = origin
            .parse()
            .map_err(|_| Error(format!("dev server origin {origin:?} does not parse")))?;
        let (Some(scheme), Some(authority)) = (uri.scheme(), uri.authority()) else {
            return Err(Error(format!("dev server origin {origin:?} needs a scheme and a host")));
        };
        if *scheme != Scheme::HTTP {
            return Err(Error(format!("dev server origin {origin:?} must be http")));
        }
        Ok(Self {
            scheme: scheme.clone(),
            authority: authority.clone(),
            entry: entry.to_owned(),
            client: Client::builder(TokioExecutor::new()).build_http(),
        })
    }

    pub(crate) fn entry_tag(&self) -> String {
        format!("<script type=\"module\" src=\"{}\"></script>", self.entry)
    }

    fn target(&self, path_and_query: &str) -> Result<Uri, String> {
        Uri::builder()
            .scheme(self.scheme.clone())
            .authority(self.authority.clone())
            .path_and_query(path_and_query)
            .build()
            .map_err(|_| "the request path does not form a dev server URL".to_owned())
    }

    pub(crate) async fn forward(&self, mut req: Request) -> Response {
        let path = req.uri().path_and_query().map_or("/", |pq| pq.as_str());
        match self.target(path) {
            Ok(target) => *req.uri_mut() = target,
            Err(reason) => return unavailable(&reason),
        }
        match self.client.request(req).await {
            Ok(res) => res.map(Body::new),
            Err(err) => unavailable(&err.to_string()),
        }
    }

    async fn call(&self, method: Method, path: &str, body: Body) -> Result<String, String> {
        let req = Request::builder()
            .method(method)
            .uri(self.target(path)?)
            .body(body)
            .map_err(|err| err.to_string())?;
        let res = self.client.request(req).await.map_err(|err| err.to_string())?;
        if !res.status().is_success() {
            return Err(format!("{path} answered {}", res.status()));
        }
        let bytes = to_bytes(Body::new(res.into_body()), usize::MAX)
            .await
            .map_err(|err| err.to_string())?;
        String::from_utf8(bytes.to_vec()).map_err(|_| format!("{path} is not UTF-8"))
    }

    /// The document after Vite's `transformIndexHtml` for `uri` (the HMR client, plugin tags).
    pub(crate) async fn transform(&self, uri: &Uri, html: &str) -> Result<String, String> {
        let url: String = form_urlencode(uri.path_and_query().map_or("/", |pq| pq.as_str()));
        self.call(
            Method::POST,
            &format!("/__vixum/transform?url={url}"),
            Body::from(html.to_owned()),
        )
        .await
    }

    /// The route table the Vite plugin reads from the generated route tree, fresh per navigation.
    pub(crate) async fn routes(&self) -> Option<Routes> {
        let json = self
            .call(Method::GET, "/__vixum/routes.json", Body::empty())
            .await
            .ok()?;
        routes::parse(&json).ok().flatten()
    }
}

fn form_urlencode(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' | b'/' => out.push(byte as char),
            _ => out.push_str(&format!("%{byte:02X}")),
        }
    }
    out
}

pub(crate) fn unavailable(reason: &str) -> Response {
    tracing::warn!(reason, "vite dev server unavailable");
    (
        StatusCode::BAD_GATEWAY,
        [(header::CACHE_CONTROL, HeaderValue::from_static("no-store"))],
        Html("<!doctype html><title>Vite is not reachable</title><p>The Vite dev server is not reachable. Run <code>just dev</code>.</p>"),
    )
        .into_response()
}
