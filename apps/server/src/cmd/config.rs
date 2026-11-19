use std::io;
use std::path::PathBuf;

#[derive(clap::Args)]
pub(super) struct GenerateArgs {
    /// Write to this path instead of the default config file
    #[arg(long, value_name = "FILE")]
    output: Option<PathBuf>,

    /// Also write .env.example with the development defaults
    #[arg(long)]
    env_example: bool,

    /// Replace existing config, schema, and example env file
    #[arg(long)]
    overwrite: bool,
}

#[derive(clap::Args)]
pub(super) struct PrintArgs {
    /// Show the layer each value came from
    #[arg(long)]
    source: bool,
}

pub(super) fn generate(_args: GenerateArgs) -> io::Result<()> {
    super::not_implemented("config:generate")
}

pub(super) fn validate() -> io::Result<()> {
    super::not_implemented("config:validate")
}

pub(super) fn print(_args: PrintArgs) -> io::Result<()> {
    super::not_implemented("config:print")
}
