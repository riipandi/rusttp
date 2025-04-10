// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

mod handlers;
mod routes;
mod server;

/// Return the ready-to-use Axum router
pub use server::create_app;

// The application name and version, extracted from Cargo metadata.
pub const APP_NAME: &'static str = core::env!("CARGO_PKG_NAME");
pub const APP_VERSION: &'static str = core::env!("CARGO_PKG_VERSION");
pub const BUILD_TIME: &'static str = build_time::build_time_utc!("%Y-%m-%d %H:%M:%S UTC");
