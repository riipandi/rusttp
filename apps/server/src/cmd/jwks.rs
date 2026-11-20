use std::io;

#[derive(clap::Args)]
pub(super) struct Args {
    /// Signature algorithm
    #[arg(long, value_enum, default_value_t = Algorithm::Es256)]
    algorithm: Algorithm,
}

#[derive(Clone, Copy, clap::ValueEnum)]
#[value(rename_all = "UPPER")]
enum Algorithm {
    Es256,
    Es384,
    Rs256,
}

pub(super) fn run(_args: Args) -> io::Result<()> {
    super::not_implemented("generate:jwks")
}
