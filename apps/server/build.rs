//! Prepares the SPA and Storybook builds memory-serve and vixum read (see `src/transport/spa.rs`
//! and `src/transport/storybook.rs`).

use std::fs;
use std::path::Path;

/// Where `pnpm --filter webapp build` writes the SPA (gitignored).
const FRONTEND_DIR: &str = "frontend";
/// Where `pnpm --filter uilibs storybook:build` writes Storybook (gitignored).
const STORYBOOK_DIR: &str = "storybook";

/// `STORYBOOK=false` leaves Storybook out of the binary; anything else (or unset) embeds it.
fn storybook_enabled() -> bool {
    !std::env::var("STORYBOOK").is_ok_and(|value| value.trim().eq_ignore_ascii_case("false"))
}

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

    // `storybook.rs` compiles only under `cfg(storybook)`, so a build with `STORYBOOK=false`
    // neither reads nor embeds the folder, even if an earlier build left one behind.
    println!("cargo::rerun-if-env-changed=STORYBOOK");
    println!("cargo::rustc-check-cfg=cfg(storybook)");
    // The SPA stays first: `memory_serve::load!()` without a name takes the first directory.
    let mut directories = vec![("default", FRONTEND_DIR)];
    if storybook_enabled() {
        println!("cargo::rustc-cfg=storybook");
        // A stub page until `storybook build` fills the folder.
        let storybook = Path::new(STORYBOOK_DIR);
        let index = storybook.join("index.html");
        if !index.exists() {
            fs::create_dir_all(storybook).expect("create the storybook directory");
            fs::write(&index, include_str!("stub/storybook.html")).expect("write the stub storybook page");
        }
        directories.push(("storybook", STORYBOOK_DIR));
    }

    // Release builds embed the files; debug builds read them from disk on each request.
    memory_serve::load_names_directories(directories, !cfg!(debug_assertions));
}
