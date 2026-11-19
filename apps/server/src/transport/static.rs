//! Static HTML for the errors the SPA cannot render itself, such as a panic while serving it.

use std::any::Any;

use axum::http::StatusCode;
use axum::response::{Html, IntoResponse, Response};

const INTERNAL_ERROR_PAGE: &str = include_str!("internal-error.html");

pub(super) fn internal_error(_panic: Box<dyn Any + Send + 'static>) -> Response {
    (StatusCode::INTERNAL_SERVER_ERROR, Html(INTERNAL_ERROR_PAGE)).into_response()
}
