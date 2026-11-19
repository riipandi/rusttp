//! Connect RPC under `/rpc`: services answer at `/rpc/<package.Service>/<Method>`. connectrpc
//! renders its own errors (an unknown procedure is a JSON `unimplemented` with HTTP 404).

use std::any::Any;

use axum::Router;
use axum::body::Body;
use axum::http::{StatusCode, header};
use axum::response::Response;
use tower_http::catch_panic::CatchPanicLayer;

pub(super) fn router() -> Router {
    // Generated services register here, e.g. `.add_service(Arc::new(GreetServiceImpl))`.
    connectrpc::Router::new()
        .into_axum_router()
        .layer(CatchPanicLayer::custom(internal_error))
}

/// A Connect error body, so a panic reads like any other `internal` error to the client.
fn internal_error(_panic: Box<dyn Any + Send + 'static>) -> Response {
    let body = serde_json::json!({
        "code": "internal",
        "message": "The server failed to handle the request.",
    });
    Response::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body.to_string()))
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use axum::body::Body;
    use axum::http::{Request, StatusCode, header};
    use tower::ServiceExt;

    #[tokio::test]
    async fn unknown_procedure_is_connect_json() {
        let res = crate::transport::router()
            .oneshot(
                Request::post("/rpc/gringotts.v1.VaultService/OpenVault")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from("{}"))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::NOT_FOUND);
        assert!(
            res.headers()[header::CONTENT_TYPE]
                .to_str()
                .unwrap()
                .starts_with("application/json")
        );
    }
}
