use std::io;

#[derive(clap::Args)]
pub(super) struct Args {
    /// Print only the aggregated status: healthy or unhealthy
    #[arg(long, conflicts_with = "json")]
    short: bool,

    /// Print the result as JSON instead of text
    #[arg(long)]
    json: bool,

    /// Deadline for the whole check
    #[arg(long, value_name = "DURATION", default_value = "5s")]
    timeout: String,

    /// Run every check now instead of reusing a cached result
    #[arg(long)]
    no_cache: bool,
}

pub(super) fn run(_args: Args) -> io::Result<()> {
    super::not_implemented("health")
}
