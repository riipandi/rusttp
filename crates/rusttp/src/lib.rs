// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

mod handlers;
mod routes;
mod server;

/// Return the ready-to-use Axum router
pub use server::create_app;

/// Application identifier
pub fn identifier() -> &'static str {
    env!("CARGO_CRATE_NAME")
}

/// Version of the application
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
