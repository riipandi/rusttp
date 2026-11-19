use std::io;

use tokio::net::TcpListener;

#[derive(clap::Args)]
pub(super) struct Args {
    /// Address to bind to [env: BIND_ADDR] [default: 127.0.0.1:3000]
    #[arg(long, value_name = "ADDR")]
    bind: Option<String>,

    /// Base URL (e.g. http://localhost:3000)
    #[arg(long, value_name = "URL")]
    base_url: Option<String>,
}

pub(super) async fn run(args: Args) -> io::Result<()> {
    let addr = args
        .bind
        .or_else(|| std::env::var("BIND_ADDR").ok())
        .unwrap_or_else(|| "127.0.0.1:3000".to_string());
    let listener = TcpListener::bind(&addr).await?;
    tracing::info!(%addr, "listening");
    axum::serve(listener, rusttp_server::build_app())
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
}
