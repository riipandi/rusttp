// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use crate::config::AppConfig;
use crate::prelude::*;

use anyhow::anyhow;
use once_cell::sync::OnceCell;
use sqlx::{postgres::PgPoolOptions, PgPool};

// Static variable to hold the database connection.
pub static PG_POOL: OnceCell<PgPool> = OnceCell::new();

/// Initializes the database connection.
///
/// This function establishes a connection to the PostgreSQL database using the provided connection URL,
/// sets the maximum number of connections, and initializes the `PG_POOL` static variable.
///
/// # Panics
///
/// Panics if it fails to connect to the database.
pub async fn init(config: &AppConfig) -> anyhow::Result<()> {
    trace_info!("Opening database connection");

    let pg_pool = PgPoolOptions::new()
        .max_connections(config.database_max_pool)
        .connect(config.database_url.as_str())
        .await
        .map_err(|err| anyhow!("Failed to connect to the database: {}", err))?;

    PG_POOL
        .set(pg_pool)
        .map_err(|e| anyhow!("Failed to set database connection {:?}", e))?;

    if check().await {
        trace_info!("Connected to database successfully");
    } else {
        trace_error!("Failed to connect to database. Aborting.");
    }

    Ok(())
}

/// Retrieves a reference to the database connection.
///
/// # Panics
///
/// Panics if the database connection has not been initialized.
pub fn pool() -> &'static PgPool {
    PG_POOL.get().expect("Database connection not initialized")
}

/// Performs a simple check to verify the database connection.
///
/// This function executes a basic query to verify the connectivity to the database.
/// Returns `true` if the check is successful, `false` otherwise.
pub async fn check() -> bool {
    match sqlx::query("SELECT 1").fetch_one(pool()).await {
        Ok(_) => true,
        Err(err) => {
            trace_error!("Database connection check failed: {}", err);
            false
        }
    }
}
