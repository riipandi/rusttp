//! The command line: argument parsing and dispatch. Each subcommand owns its arguments and `run`.

mod config;
mod db;
mod health;
mod jwks;
mod keys;
mod migrate;
mod serve;
mod setup;

use std::io;
use std::path::PathBuf;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(version, about, disable_help_subcommand = true, arg_required_else_help = true)]
pub(crate) struct Cli {
    /// Load environment variables from a file
    #[arg(long, global = true, value_name = "FILE", help_heading = "Global Options")]
    env_file: Option<PathBuf>,

    /// Load configuration from a JSON file
    #[arg(long, global = true, value_name = "FILE", help_heading = "Global Options")]
    config_file: Option<PathBuf>,

    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Start the application server
    Serve(serve::Args),
    /// Check application health status
    #[command(visible_alias = "hc")]
    Health(health::Args),
    /// Generate the application secret keys
    #[command(name = "generate:keys")]
    GenerateKeys(keys::Args),
    /// Generate a signing key pair for the OAuth provider
    #[command(name = "generate:jwks")]
    GenerateJwks(jwks::Args),
    /// Write a starter config file
    #[command(name = "config:generate")]
    ConfigGenerate(config::GenerateArgs),
    /// Check the configuration
    #[command(name = "config:validate")]
    ConfigValidate,
    /// Print the resolved configuration (sensitive values are redacted)
    #[command(name = "config:print")]
    ConfigPrint(config::PrintArgs),
    /// Run database migrations
    #[command(name = "migrate:up")]
    MigrateUp(migrate::UpArgs),
    /// Rollback database migrations
    #[command(name = "migrate:down")]
    MigrateDown(migrate::DownArgs),
    /// Check database migration status and version
    #[command(name = "migrate:status")]
    MigrateStatus,
    /// Create a new migration file
    #[cfg(debug_assertions)]
    #[command(name = "migrate:create")]
    MigrateCreate(migrate::CreateArgs),
    /// Check the migration files
    #[cfg(debug_assertions)]
    #[command(name = "migrate:validate")]
    MigrateValidate,
    /// Rollback all migrations
    #[cfg(debug_assertions)]
    #[command(name = "migrate:reset")]
    MigrateReset(migrate::ResetArgs),
    /// Seed the database with initial data
    #[cfg(debug_assertions)]
    #[command(name = "migrate:seed")]
    MigrateSeed(migrate::SeedArgs),
    /// Export the application database to a SQL file
    #[command(name = "db:export")]
    DbExport(db::ExportArgs),
    /// Import a database backup file
    #[command(name = "db:import")]
    DbImport(db::ImportArgs),
    /// Replace an administrator credential
    ResetPassword(setup::ResetPasswordArgs),
    /// Create an administrator account (default name: Admin Sistem)
    SetupAdmin(setup::SetupAdminArgs),
}

impl Cli {
    pub(crate) async fn run(self) -> io::Result<()> {
        match self.command {
            Command::Serve(args) => serve::run(args).await,
            Command::Health(args) => health::run(args),
            // The global `--env-file` doubles as the target file: one flag cannot carry two meanings.
            Command::GenerateKeys(args) => keys::run(args, self.env_file.as_deref()),
            Command::GenerateJwks(args) => jwks::run(args),
            Command::ConfigGenerate(args) => config::generate(args),
            Command::ConfigValidate => config::validate(),
            Command::ConfigPrint(args) => config::print(args),
            Command::MigrateUp(args) => migrate::up(args),
            Command::MigrateDown(args) => migrate::down(args),
            Command::MigrateStatus => migrate::status(),
            #[cfg(debug_assertions)]
            Command::MigrateCreate(args) => migrate::create(args),
            #[cfg(debug_assertions)]
            Command::MigrateValidate => migrate::validate(),
            #[cfg(debug_assertions)]
            Command::MigrateReset(args) => migrate::reset(args),
            #[cfg(debug_assertions)]
            Command::MigrateSeed(args) => migrate::seed(args),
            Command::DbExport(args) => db::export(args),
            Command::DbImport(args) => db::import(args),
            Command::ResetPassword(args) => setup::reset_password(args),
            Command::SetupAdmin(args) => setup::setup_admin(args),
        }
    }
}

/// The placeholder result of a command whose behavior has not landed yet.
fn not_implemented(command: &str) -> io::Result<()> {
    Err(io::Error::other(format!("`{command}` is not implemented yet")))
}

#[cfg(test)]
mod tests {
    use clap::CommandFactory;

    #[test]
    fn cli_definition_is_valid() {
        super::Cli::command().debug_assert();
    }
}
