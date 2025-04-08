// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

mod api;
mod web;

use axum::Router;

pub fn create_routes() -> Router {
    Router::new().merge(web::routes()).merge(api::routes())
}
