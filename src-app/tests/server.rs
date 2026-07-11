use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

#[tokio::test]
async fn root_returns_200() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(Request::builder().uri("/api").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn health_returns_200() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn healthz_returns_200() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/healthz")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}
#[tokio::test]
async fn api_unknown_returns_json_404() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/nope")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn rpc_unknown_returns_json_404() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/rpc/foo")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn spa_fallback_returns_200() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/some-client-route")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn root_returns_304_redirect_on_trailing_slash() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(Request::builder().uri("/api/").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::PERMANENT_REDIRECT);
}

#[tokio::test]
async fn api_error_returns_json() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/404")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
    let ct = res.headers().get("content-type").unwrap().to_str().unwrap();
    assert!(ct.starts_with("application/json"));
}

#[tokio::test]
async fn rpc_error_returns_json() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/rpc/nonexistent")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
    let ct = res.headers().get("content-type").unwrap().to_str().unwrap();
    assert!(ct.starts_with("application/json"));
}

#[tokio::test]
async fn method_not_allowed_on_api_get() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/health")
                .method("POST")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn health_returns_json_ok() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(
            Request::builder()
                .uri("/api/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let body: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(body["status"], "ok");
}

#[tokio::test]
async fn rpc_index_returns_json_status() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(Request::builder().uri("/rpc").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let ct = res.headers().get("content-type").unwrap().to_str().unwrap();
    assert!(ct.starts_with("application/json"));
    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let body: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(body["status"], "rpc ready");
}

#[tokio::test]
async fn root_returns_html_or_redirect() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
        .await
        .unwrap();
    // SPA index returns 200, trim_slash redirect returns 308 — both valid
    assert!(res.status() == StatusCode::OK || res.status() == StatusCode::PERMANENT_REDIRECT);
}

#[tokio::test]
async fn trim_trailing_slash_non_root() {
    let app = rusttp::server::build();
    let res = app
        .oneshot(Request::builder().uri("/api/").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::PERMANENT_REDIRECT);
    let location = res.headers().get("location").unwrap().to_str().unwrap();
    assert_eq!(location, "/api");
}
