// Copyright 2023-current Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

// use entity::MigrateType;
use libcore::prelude::*;
use libcore::utils::random_str;
use libcore::{config::CONFIG, dbx};
use rusttp::{APP_NAME, APP_VERSION, BUILD_TIME};

use clap::{Parser, Subcommand};
use std::env::consts::{ARCH, OS};

const DISPLAY_TARGET: bool = cfg!(debug_assertions);
const LOG_LEVEL: &str = if cfg!(debug_assertions) {
    "rusttp=debug,libcore=debug,entity=debug,mailer=debug,tower_http=info"
} else {
    "rusttp=info,libcore=info,entity=info,mailer=info,tower_http=info"
};

#[derive(Parser)]
#[command(about, long_about = None)]
struct Args {
    /// Address to bind
    #[arg(short = 'a', long = "address", default_value = "0.0.0.0")]
    address: String,
    /// Port to listen
    #[arg(short = 'p', long = "port", default_value = "8000")]
    port: String,
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate application secret key
    GenerateSecret {},
    // /// Run database migration
    // Migrate {
    //     /// Force run, disable confirmation prompt
    //     #[arg(short = 'f', long = "force", default_value_t = false)]
    //     force: bool,
    //     /// Create default administrator user
    //     #[arg(long = "create-admin", default_value_t = false)]
    //     create_admin: bool,
    // },
    // /// Revert database migration
    // MigrateRevert {
    //     /// Force run, disable confirmation prompt
    //     #[arg(short = 'f', long = "force", default_value_t = false)]
    //     force: bool,
    // },
    // /// Reset database migration
    // MigrateReset {
    //     /// Force run, disable confirmation prompt
    //     #[arg(short = 'f', long = "force", default_value_t = false)]
    //     force: bool,
    // },
    /// Print version information
    Version {
        /// Print short version number
        #[arg(short = 's', long = "short", default_value_t = false)]
        short: bool,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok(); // Load environment variables

    // Setup tracing a.k.a logging.
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| LOG_LEVEL.into()))
        .with(tracing_subscriber::fmt::layer().with_target(DISPLAY_TARGET))
        .init();

    // Access the CONFIG variable to get the application configuration
    let config = match CONFIG.as_ref() {
        Ok(config) => config,
        Err(err) => {
            trace_error!("Error loading configuration: {}", err);
            std::process::exit(1); // TODO don't exit, must be self healing?
        }
    };

    // You can check for the existence of subcommands, and if found
    // use their matches just as you would the top level command.
    let args = Args::parse();

    match args.command {
        Some(Commands::GenerateSecret {}) => println!("{}", random_str(64)),
        Some(Commands::Version { short }) => {
            if short {
                println!("{APP_VERSION}");
            } else {
                println!("{APP_NAME} {APP_VERSION} {ARCH}-{OS} ({BUILD_TIME})");
            }
        }
        // Some(Commands::Migrate { force, create_admin }) => {
        //     // dbx::init(config).await?;
        //     // entity::migrate(MigrateType::Up, force, None).await?;
        // }
        // Some(Commands::MigrateRevert { force }) => {
        //     // if cfg!(debug_assertions) {
        //     //     dbx::init(config).await?;
        //     //     entity::migrate(MigrateType::Down, force, None).await?;
        //     // } else {
        //     //     println!("Not applicable on release mode!");
        //     // };
        // }
        // Some(Commands::MigrateReset { force }) => {
        //     // if cfg!(debug_assertions) {
        //     //     dbx::init(config).await?;
        //     //     entity::migrate(MigrateType::Reset, force, None).await?;
        //     // } else {
        //     //     println!("Not applicable on release mode!");
        //     // };
        // }
        None => {
            // Initialize database connection
            dbx::init(config).await?;

            // After all, run the application server
            let app = rusttp::create_app();
            let addr = [args.address, args.port.to_string()].join(":");
            let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
            tracing::info!("listening on {}", listener.local_addr().unwrap());
            axum::serve(listener, app).await.unwrap();
        }
    }

    Ok(())
}
