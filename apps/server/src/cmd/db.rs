use std::io;
use std::path::PathBuf;

#[derive(clap::Args)]
pub(super) struct ExportArgs {
    /// Write the dump to this path
    #[arg(long, value_name = "FILE")]
    output: Option<PathBuf>,

    /// Compress the dump
    #[arg(long, value_enum, default_value_t = Compression::None)]
    compression: Compression,

    /// Export the schema without any rows
    #[arg(long, conflicts_with = "data_only")]
    schema_only: bool,

    /// Export the rows without any DDL
    #[arg(long)]
    data_only: bool,

    /// Replace the generated dump file when it already exists
    #[arg(long)]
    overwrite: bool,
}

#[derive(Clone, Copy, clap::ValueEnum)]
enum Compression {
    None,
    Gzip,
    Zlib,
    Zip,
}

#[derive(clap::Args)]
pub(super) struct ImportArgs {
    /// The backup file to load
    #[arg(value_name = "FILE")]
    file: PathBuf,

    /// Empty every table in the dump before loading it
    #[arg(long)]
    truncate: bool,

    /// Skip the confirmation prompt
    #[arg(long)]
    force: bool,

    /// Report what would be loaded without changing the database
    #[arg(long)]
    dry_run: bool,
}

pub(super) fn export(_args: ExportArgs) -> io::Result<()> {
    super::not_implemented("db:export")
}

pub(super) fn import(_args: ImportArgs) -> io::Result<()> {
    super::not_implemented("db:import")
}
