use std::io;

#[derive(clap::Args)]
pub(super) struct UpArgs {
    /// Apply migrations only up to this version
    #[arg(long, value_name = "VERSION")]
    to: Option<u64>,

    /// List the pending migrations without applying them
    #[arg(long)]
    dry_run: bool,

    /// Skip the confirmation prompt
    #[arg(long)]
    force: bool,
}

#[derive(clap::Args)]
pub(super) struct DownArgs {
    /// Number of migrations to roll back
    #[arg(long, default_value_t = 1)]
    count: u32,

    /// List the migrations that would be rolled back without changing anything
    #[arg(long)]
    dry_run: bool,

    /// Skip the confirmation prompt
    #[arg(long)]
    force: bool,
}

#[cfg(debug_assertions)]
#[derive(clap::Args)]
pub(super) struct CreateArgs {
    /// The migration name, e.g. create_wizards
    #[arg(value_name = "MIGRATION_NAME")]
    name: String,
}

#[cfg(debug_assertions)]
#[derive(clap::Args)]
pub(super) struct ResetArgs {
    /// Re-apply all migrations after the rollback (fresh schema)
    #[arg(long)]
    up: bool,

    /// Run the seeders after the re-apply
    #[arg(long, requires = "up")]
    seed: bool,

    /// Print what would be rolled back without changing anything
    #[arg(long)]
    dry_run: bool,

    /// Skip the confirmation prompt
    #[arg(long)]
    force: bool,
}

#[cfg(debug_assertions)]
#[derive(clap::Args)]
pub(super) struct SeedArgs {
    /// Report what would be seeded without changing anything
    #[arg(long)]
    dry_run: bool,

    /// Skip the confirmation prompt
    #[arg(long)]
    force: bool,
}

pub(super) fn up(_args: UpArgs) -> io::Result<()> {
    super::not_implemented("migrate:up")
}

pub(super) fn down(_args: DownArgs) -> io::Result<()> {
    super::not_implemented("migrate:down")
}

pub(super) fn status() -> io::Result<()> {
    super::not_implemented("migrate:status")
}

#[cfg(debug_assertions)]
pub(super) fn create(_args: CreateArgs) -> io::Result<()> {
    super::not_implemented("migrate:create")
}

#[cfg(debug_assertions)]
pub(super) fn validate() -> io::Result<()> {
    super::not_implemented("migrate:validate")
}

#[cfg(debug_assertions)]
pub(super) fn reset(_args: ResetArgs) -> io::Result<()> {
    super::not_implemented("migrate:reset")
}

#[cfg(debug_assertions)]
pub(super) fn seed(_args: SeedArgs) -> io::Result<()> {
    super::not_implemented("migrate:seed")
}
