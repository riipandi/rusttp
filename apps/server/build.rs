//! Prepares the SPA build memory-serve and vixum read (see `src/transport/spa.rs`).

use std::fs;
use std::path::Path;

/// Where `pnpm --filter webapp build` writes the SPA (gitignored).
const FRONTEND_DIR: &str = "frontend";

fn main() {
    // `spa.rs` embeds the build manifest and the route table, and memory-serve panics on a missing
    // directory, so a server built before the SPA gets a stub entry that says so. `vite build`
    // empties the folder first, replacing all three.
    let dir = Path::new(FRONTEND_DIR);
    let manifest = dir.join(".vite/manifest.json");
    if !manifest.exists() {
        fs::create_dir_all(dir.join(".vite")).expect("create the frontend directory");
        fs::create_dir_all(dir.join("assets")).expect("create the frontend assets directory");
        fs::write(dir.join("assets/stub.js"), include_str!("stub/default.js")).expect("write the stub entry");
        fs::write(&manifest, r#"{"stub": {"file": "assets/stub.js", "isEntry": true}}"#)
            .expect("write the stub manifest");
    }
    let routes = dir.join("routes.json");
    if !routes.exists() {
        fs::write(&routes, "null").expect("write the empty route table");
    }
    // Release builds embed the files; debug builds read them from disk on each request.
    memory_serve::load_directory(FRONTEND_DIR);
}
