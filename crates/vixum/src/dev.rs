use axum::body::{Body, to_bytes};
use axum::extract::Request;
use axum::http::uri::{Authority, Scheme};
use axum::http::{HeaderValue, StatusCode, Uri, header};
use axum::response::{Html, IntoResponse, Response};
use hyper_util::client::legacy::Client;
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::rt::TokioExecutor;

use crate::Error;

/// The Vite dev server behind the server's port. The HMR socket does not pass through here: the
/// client connects to Vite directly (`server.hmr` in the Vite config), so a server restart never
/// drops it.
pub(crate) struct Dev {
    scheme: Scheme,
    authority: Authority,
    client: Client<HttpConnector, Body>,
}

impl Dev {
    pub(crate) fn new(origin: &str) -> Result<Self, Error> {
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
            client: Client::builder(TokioExecutor::new()).build_http(),
        })
    }

    fn target(&self, uri: &Uri) -> Result<Uri, String> {
        let path = uri.path_and_query().map_or("/", |pq| pq.as_str());
        Uri::builder()
            .scheme(self.scheme.clone())
            .authority(self.authority.clone())
            .path_and_query(path)
            .build()
            .map_err(|_| "the request path does not form a dev server URL".to_owned())
    }

    pub(crate) async fn forward(&self, mut req: Request) -> Response {
        match self.target(req.uri()) {
            Ok(target) => *req.uri_mut() = target,
            Err(reason) => return unavailable(&reason),
        }
        match self.client.request(req).await {
            Ok(res) => res.map(Body::new),
            Err(err) => unavailable(&err.to_string()),
        }
    }

    /// Vite's `index.html` for `uri`, transformed the way Vite serves it (HMR client, plugin tags).
    pub(crate) async fn index_html(&self, uri: &Uri) -> Result<String, String> {
        let req = Request::get(self.target(uri)?)
            .header(header::ACCEPT, HeaderValue::from_static("text/html"))
            .body(Body::empty())
            .map_err(|err| err.to_string())?;
        let res = self.client.request(req).await.map_err(|err| err.to_string())?;
        let bytes = to_bytes(Body::new(res.into_body()), usize::MAX)
            .await
            .map_err(|err| err.to_string())?;
        String::from_utf8(bytes.to_vec()).map_err(|_| "index.html is not UTF-8".to_owned())
    }
}

pub(crate) fn unavailable(reason: &str) -> Response {
    tracing::warn!(reason, "vite dev server unavailable");
    (
        StatusCode::BAD_GATEWAY,
        Html("<!doctype html><title>Vite is not reachable</title><p>The Vite dev server is not reachable. Run <code>just dev</code>.</p>"),
    )
        .into_response()
}
