// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use axum::response::{Html, Json};
use serde_json::{json, Value};

pub async fn index() -> Html<&'static str> {
    Html("<h1>Hello, Rusttp!</h1>")
}

pub async fn health() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "version": crate::APP_VERSION,
        "build_time": crate::BUILD_TIME,
    }))
}
