use std::io;
use std::path::Path;

#[derive(clap::Args)]
#[command(after_help = "Pass the global --env-file to write the keys into that file instead of printing them.")]
pub(super) struct Args {
    /// JWT signature algorithm for the key pair, or an HS* algorithm for AUTH_SECRET_KEY
    #[arg(long)]
    algorithm: Option<String>,

    /// Replace existing values in the env file without asking
    #[arg(long)]
    overwrite: bool,
}

pub(super) fn run(_args: Args, _env_file: Option<&Path>) -> io::Result<()> {
    super::not_implemented("generate:keys")
}
