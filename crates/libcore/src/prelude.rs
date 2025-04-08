// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use serde::Deserialize;
use serde::Serialize;
pub use std::format as f;
pub use tracing::debug as trace_debug;
pub use tracing::error as trace_error;
pub use tracing::info as trace_info;
pub use tracing::warn as trace_warn;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ServerState {
    pub base_url: String,
}

/// Macro for generating a tuple representing a not-yet-implemented response.
///
/// # Example
///
/// ```rust,ignore
/// # use axum::http::StatusCode;
/// # use libcore::not_yet_implemented;
///
/// // Create a not-yet-implemented response with a 418 status code (I'm a teapot)
/// // and a custom message. This can be replacement for todo!() macros.
/// let response = not_yet_implemented!();
///
/// // Assert that the status code is 418 and the message is as expected.
/// assert_eq!(response, (StatusCode::IM_A_TEAPOT, "Not yet implemented!".to_string()));
/// ```
#[macro_export]
macro_rules! not_yet_implemented {
    () => {
        // Return a tuple with the status code and a message.
        (axum::http::StatusCode::IM_A_TEAPOT, "Not yet implemented!".to_string())
    };
}
