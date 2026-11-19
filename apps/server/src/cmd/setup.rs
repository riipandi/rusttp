use std::io;

#[derive(clap::Args)]
pub(super) struct ResetPasswordArgs {
    /// The replacement credential (generated when absent)
    #[arg(long, value_name = "PASSWORD")]
    new_password: Option<String>,
}

#[derive(clap::Args)]
pub(super) struct SetupAdminArgs {
    /// The administrator email address
    #[arg(long, default_value = "admin@example.com")]
    email: String,

    /// The administrator password (generated and printed once when absent)
    #[arg(long)]
    password: Option<String>,

    /// The administrator handle
    #[arg(long, default_value = "admin")]
    username: String,
}

pub(super) fn reset_password(_args: ResetPasswordArgs) -> io::Result<()> {
    super::not_implemented("reset-password")
}

pub(super) fn setup_admin(_args: SetupAdminArgs) -> io::Result<()> {
    super::not_implemented("setup-admin")
}
