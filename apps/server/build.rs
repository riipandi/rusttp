//! Prepares the SPA assets memory-serve serves (see `src/transport/spa.rs`).

use std::fs;
use std::path::Path;

/// Where `pnpm --filter webapp build` writes the SPA (gitignored).
const FRONTEND_DIR: &str = "frontend";

fn main() {
    // memory-serve canonicalizes the directory and `load!` panics on an empty one, so a fresh
    // checkout gets a stub page until the SPA is built; `vite build` empties the folder first.
    let index = Path::new(FRONTEND_DIR).join("index.html");
    if !index.exists() {
        fs::create_dir_all(FRONTEND_DIR).expect("create the frontend directory");
        fs::write(&index, include_str!("stub.html")).expect("write the frontend stub");
    }
    // Release builds embed the files; debug builds read them from disk on each request.
    memory_serve::load_directory(FRONTEND_DIR);
}
