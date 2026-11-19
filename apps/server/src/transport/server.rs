use std::io;

use tokio::net::TcpListener;

/// Builds the app, binds `addr`, and serves until Ctrl-C.
pub(crate) async fn serve(addr: &str) -> io::Result<()> {
    let app = super::router().map_err(io::Error::other)?;
    let listener = bind(addr).await?;
    tracing::info!(addr = %listener.local_addr()?, "listening");
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
}

#[cfg(not(debug_assertions))]
async fn bind(addr: &str) -> io::Result<TcpListener> {
    TcpListener::bind(addr).await
}

/// Debug builds share the port (`SO_REUSEPORT`), so the Vite plugin starts the rebuilt server
/// beside the running one and stops the old one only once the new one listens. Release builds
/// never set it: it would let another process of the same user bind the port too.
#[cfg(debug_assertions)]
async fn bind(addr: &str) -> io::Result<TcpListener> {
    let addr = tokio::net::lookup_host(addr)
        .await?
        .next()
        .ok_or_else(|| io::Error::new(io::ErrorKind::AddrNotAvailable, format!("{addr} resolves to nothing")))?;
    let socket = if addr.is_ipv4() {
        tokio::net::TcpSocket::new_v4()?
    } else {
        tokio::net::TcpSocket::new_v6()?
    };
    socket.set_reuseaddr(true)?;
    #[cfg(unix)]
    socket.set_reuseport(true)?;
    socket.bind(addr)?;
    socket.listen(1024)
}
