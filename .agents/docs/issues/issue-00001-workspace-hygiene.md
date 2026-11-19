---
status: considering
created: 2026-11-19T16:20:00+07:00
updated: 2026-11-19T17:15:00+07:00
summary: "Workspace hygiene gaps found before the first module: six resolved on 2026-11-19 (members, axum deps, dependency pinning, README claims, task recipes, workspace clippy); the location of domain modules awaits the owner."
count: 7
---

# Workspace hygiene gaps

## Workspace members exclude two crates

- status: resolved (2026-11-19)
  area: workspace
  summary: `Cargo.toml:3` is `members = ["apps/*", "crates/corelib"]`; `crates/libmailer` and `crates/observer` exist on disk but are outside the workspace, so check, clippy, and tests never touch them.
  resolution: `Cargo.toml` members are now `["apps/*", "crates/*"]`; every crate is checked and linted.
  trigger: None — closed.

## Framework crates depend on axum for nothing

- status: resolved (2026-11-19)
  area: crates
  summary: `crates/corelib/Cargo.toml:19`, `crates/libmailer/Cargo.toml:19`, and `crates/observer/Cargo.toml:19` each declare `axum.workspace = true` while their sources are empty; a mailer or observer has no reason to depend on the web framework.
  resolution: the `axum` dependency was removed from `corelib`, `libmailer`, and `observer`.
  trigger: None — closed.

## Server pins versions outside the workspace

- status: resolved (2026-11-19)
  area: apps/server
  summary: `apps/server/Cargo.toml` writes versions directly (`axum`, `clap`, `serde`, `serde_json`, `tokio`, `tower-http`, `tracing`, `tracing-subscriber`) instead of `dep.workspace = true`, breaking the single-version rule in `rules.md`.
  resolution: every server dependency moved to `[workspace.dependencies]`; unused `serde`/`serde_json` dropped; `tower-http` now provides the request `TraceLayer`.
  trigger: None — closed.

## README describes files that do not exist

- status: resolved (2026-11-19)
  area: docs
  summary: `README.md:34`, `README.md:35`, `README.md:46`, and `README.md:55` refer to `.env.example`, `just generate-key`, a root `compose.yaml`, and a `Dockerfile`. `just generate-key` exists since 2026-11-19; `.env.example` and `Dockerfile` do not, and the compose file is `container/compose.yaml` (empty), so `just compose-*` and `just docker-*` fail until they land.
  resolution: `.env.example`, `container/compose.yaml` (Postgres), and `deploy/Dockerfile` exist; the README Docker section now uses the `just compose-*` / `docker-*` recipes.
  trigger: None — closed.

## Task recipes are empty

- status: resolved (2026-11-19, the four `scripts/task-*.just` files)
  area: scripts
  summary: `scripts/task-build.just`, `task-container.just`, `task-dev.just`, and `task-tests.just` were empty, so `just` exposed no gate.
  resolution: the recipes now cover dev, build, quality gates (`just verify`), Hurl specs, and container tasks; `shape.md` lists them. `just lint` and `just verify` still fail on the workspace clippy item below.
  trigger: None — closed.

## Location of domain modules is not confirmed

- status: considering (trigger: the owner confirms before the first module crate is created)
  area: workspace layout
  summary: the docs assume top-level `modules/<name>/`; the owner asked on 2026-11-19 why not `apps/server/modules/`. Options as analysed then: top-level `modules/` (recommended — keeps `apps/` for binaries and stays neutral for a second binary) or crates under `apps/server/modules/` (equivalent technically, ties modules to one app). A plain `mod` inside the server crate was rejected (no compile-time boundaries).
  trigger: creating the first crate under either path.

## Workspace clippy fails on empty framework crates

- status: resolved (2026-11-19)
  area: crates
  summary: `cargo clippy --workspace --all-targets -- -D warnings` fails on `crates/corelib` because its empty `src/lib.rs` has no crate doc (`missing_docs`, promoted by `-D warnings`); cargo also warns about unused dependencies (`axum` in `crates/corelib/Cargo.toml:19`, `tower-http` in `apps/server/Cargo.toml`; `clap` is used since the `serve` CLI landed). Verified 2026-11-19 with cargo 1.100.0.
  resolution: each framework crate has a crate doc; unused workspace dependencies, the `readme` field, and the redundant `homepage` were removed. `just verify` passes with no warnings.
  trigger: None — closed.
