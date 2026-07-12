use axum::body::Body;
use axum::http::{Request, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Json, extract::OriginalUri};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ErrorDetail {
    pub status: u16,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: ErrorDetail,
}

impl ErrorResponse {
    pub fn new(status: StatusCode, message: impl Into<String>) -> Self {
        Self {
            error: ErrorDetail {
                status: status.as_u16(),
                message: message.into(),
            },
        }
    }

    pub fn into_response(self, status: StatusCode) -> Response {
        (status, [("content-type", "application/json")], Json(self)).into_response()
    }
}

pub fn panic_response() -> Response {
    ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "internal server error")
        .into_response(StatusCode::INTERNAL_SERVER_ERROR)
}

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    NotFound(String),
    Internal(String),
}

impl AppError {
    fn status(&self) -> StatusCode {
        match self {
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> &str {
        match self {
            Self::BadRequest(m) | Self::NotFound(m) | Self::Internal(m) => m,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status();
        ErrorResponse::new(status, self.message()).into_response(status)
    }
}

pub async fn not_found(OriginalUri(original_uri): OriginalUri, _req: Request<Body>) -> Response {
    ErrorResponse::new(StatusCode::NOT_FOUND, format!("route `{}` not found", original_uri.path()))
        .into_response(StatusCode::NOT_FOUND)
}

pub async fn method_not_allowed(OriginalUri(original_uri): OriginalUri, req: Request<Body>) -> Response {
    ErrorResponse::new(
        StatusCode::METHOD_NOT_ALLOWED,
        format!("method `{}` not allowed for `{}`", req.method(), original_uri.path()),
    )
    .into_response(StatusCode::METHOD_NOT_ALLOWED)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn error_response_new_creates_correct_detail() {
        let res = ErrorResponse::new(StatusCode::NOT_FOUND, "test message");
        assert_eq!(res.error.status, 404);
        assert_eq!(res.error.message, "test message");
    }

    #[test]
    fn error_response_into_response_has_json_content_type() {
        let res = ErrorResponse::new(StatusCode::BAD_REQUEST, "bad").into_response(StatusCode::BAD_REQUEST);
        let headers = res.headers();
        assert_eq!(headers.get("content-type").unwrap().to_str().unwrap(), "application/json");
        assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    }

    #[test]
    fn panic_response_returns_500() {
        let res = panic_response();
        assert_eq!(res.status(), StatusCode::INTERNAL_SERVER_ERROR);
        let headers = res.headers();
        assert_eq!(headers.get("content-type").unwrap().to_str().unwrap(), "application/json");
    }

    #[test]
    fn app_error_bad_request() {
        let err = AppError::BadRequest("bad input".into());
        assert_eq!(err.status(), StatusCode::BAD_REQUEST);
        assert_eq!(err.message(), "bad input");
    }

    #[test]
    fn app_error_not_found() {
        let err = AppError::NotFound("missing".into());
        assert_eq!(err.status(), StatusCode::NOT_FOUND);
        assert_eq!(err.message(), "missing");
    }

    #[test]
    fn app_error_internal() {
        let err = AppError::Internal("oops".into());
        assert_eq!(err.status(), StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(err.message(), "oops");
    }

    #[test]
    fn app_error_into_response() {
        let err = AppError::NotFound("gone".into());
        let res: Response = err.into_response();
        assert_eq!(res.status(), StatusCode::NOT_FOUND);
    }

    #[test]
    fn error_response_json_body_serializes() {
        let er = ErrorResponse::new(StatusCode::NOT_FOUND, "route not found");
        let body = serde_json::to_value(&er).unwrap();
        assert_eq!(body["error"]["status"], 404);
        assert_eq!(body["error"]["message"], "route not found");
    }
}
