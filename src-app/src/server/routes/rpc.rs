use axum::{Json, Router, routing::get};
use serde::Serialize;

use crate::server::error;

#[derive(Serialize)]
pub struct RpcStatus {
    pub status: &'static str,
}

async fn index() -> Json<RpcStatus> {
    Json(RpcStatus {
        status: "rpc ready",
    })
}

pub fn router() -> Router {
    Router::new()
        .route("/", get(index))
        .fallback(error::not_found)
        .method_not_allowed_fallback(error::method_not_allowed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rpc_status_serializes_to_json() {
        let s = RpcStatus { status: "ready" };
        let json = serde_json::to_value(&s).unwrap();
        assert_eq!(json["status"], "ready");
    }
}
