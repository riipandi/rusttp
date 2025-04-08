// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use crate::handlers;
use axum::routing::get;
use axum::Router;

pub fn routes() -> Router {
    Router::new().route("/", get(handlers::index))
}
