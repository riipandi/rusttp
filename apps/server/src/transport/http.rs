//! REST under `/api`. Every error is `application/problem+json` (RFC 9457).

use std::any::Any;

use axum::Router;
use axum::body::Body;
use axum::http::{StatusCode, header};
use axum::response::Response;
use tower_http::catch_panic::CatchPanicLayer;

pub(super) fn router() -> Router {
    // Versioned routes nest here, e.g. `.nest("/v1", v1::router())`.
    Router::new()
        .fallback(|| async { problem(StatusCode::NOT_FOUND, "No API route matches this path.") })
        .method_not_allowed_fallback(|| async {
            problem(StatusCode::METHOD_NOT_ALLOWED, "This route does not accept the request method.")
        })
        .layer(CatchPanicLayer::custom(internal_error))
}

pub(super) fn problem(status: StatusCode, detail: &str) -> Response {
    let body = serde_json::json!({
        "type": "about:blank",
        "title": status.canonical_reason().unwrap_or_default(),
        "status": status.as_u16(),
        "detail": detail,
    });
    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, "application/problem+json")
        .body(Body::from(body.to_string()))
        .unwrap_or_default()
}

fn internal_error(_panic: Box<dyn Any + Send + 'static>) -> Response {
    problem(StatusCode::INTERNAL_SERVER_ERROR, "The server failed to handle the request.")
}

#[cfg(test)]
mod tests {
    use axum::body::{Body, to_bytes};
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    #[tokio::test]
    async fn unknown_api_route_is_problem_json() {
        let res = crate::transport::router()
            .unwrap()
            .oneshot(Request::get("/api/v1/hogwarts/houses").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::NOT_FOUND);
        assert_eq!(res.headers()[header::CONTENT_TYPE], "application/problem+json");
        let body = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 404);
    }
}
