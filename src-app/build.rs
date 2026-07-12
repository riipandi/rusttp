use std::process::Command;

fn main() {
    let git_hash = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "unknown".into());

    println!("cargo:rustc-env=GIT_HASH={git_hash}");

    let build_time = chrono::Utc::now().format("%Y-%m-%d").to_string();

    println!("cargo:rustc-env=BUILD_TIME={build_time}");
    println!("cargo:rustc-env=BUILD_OS={}", std::env::consts::OS);
    println!("cargo:rustc-env=BUILD_ARCH={}", std::env::consts::ARCH);
}
