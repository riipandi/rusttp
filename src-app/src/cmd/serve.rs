use anyhow::Result;

pub async fn handle(host: String, port: u16) -> Result<i32> {
    let tracing_enabled = std::env::var("TRACING_ENABLE").as_deref() == Ok("true");
    let tracing_sampling = std::env::var("TRACING_SAMPLING").unwrap_or_else(|_| "0.7".into());
    let tracing_reporter = std::env::var("TRACING_REPORTER").unwrap_or_default();
    let log_level = std::env::var("LOG_LEVEL")
        .or_else(|_| std::env::var("RUST_LOG"))
        .unwrap_or_else(|_| "info".into());
    let log_console = std::env::var("LOG_CONSOLE").unwrap_or_default();
    let log_transport = std::env::var("LOG_TRANSPORT").unwrap_or_default();
    log::info!(
        "startup: tracing_enabled={tracing_enabled} tracing_sampling={tracing_sampling} tracing_reporter={tracing_reporter} log_level={log_level} log_console={log_console} log_transport={log_transport}"
    );
    let config = crate::server::ServerConfig::new(host, port);
    crate::server::run(config).await?;
    Ok(0)
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn serve_handle_with_defaults() {
        // smoke test: binds port 0 (OS assigns) and shuts down via signal
        let handle = tokio::spawn(async {
            let cfg = crate::server::ServerConfig::new(String::from("127.0.0.1"), 0);
            let _ = crate::server::run_with_shutdown(cfg, std::future::pending()).await;
            0i32
        });
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        handle.abort();
    }

    #[tokio::test]
    async fn handle_with_env_vars_and_port_zero() {
        unsafe { std::env::set_var("TRACING_ENABLE", "true") };
        unsafe { std::env::set_var("TRACING_REPORTER", "console") };
        unsafe { std::env::set_var("LOG_CONSOLE", "true") };
        let h = tokio::spawn(async {
            let _ = super::handle("127.0.0.1".into(), 0).await;
            0i32
        });
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        h.abort();
        unsafe { std::env::remove_var("TRACING_ENABLE") };
        unsafe { std::env::remove_var("TRACING_REPORTER") };
        unsafe { std::env::remove_var("LOG_CONSOLE") };
    }
}
