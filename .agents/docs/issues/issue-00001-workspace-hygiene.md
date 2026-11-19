---
status: open
created: 2026-11-19T16:20:00+07:00
updated: 2026-11-19T16:20:00+07:00
summary: "Workspace hygiene gaps: workspace membership, needless axum dependencies, version pinning outside the workspace, README claims without files, empty task recipes, and the undecided location of domain modules."
count: 6
---

# Workspace hygiene gaps

## Workspace members exclude two crates

- status: open
  area: workspace
  summary: `Cargo.toml:3` is `members = ["apps/*", "crates/corelib"]`; `crates/libmailer` and `crates/observer` exist on disk but are outside the workspace, so check, clippy, and tests never touch them.
  plan: none yet
  trigger: the first implementation phase (workspace cleanup).

## Framework crates depend on axum for nothing

- status: open
  area: crates
  summary: `crates/corelib/Cargo.toml:19`, `crates/libmailer/Cargo.toml:19`, and `crates/observer/Cargo.toml:19` each declare `axum.workspace = true` while their sources are empty; a mailer or observer has no reason to depend on the web framework.
  plan: none yet
  trigger: the first implementation phase (workspace cleanup).

## Server pins versions outside the workspace

- status: open
  area: apps/server
  summary: `apps/server/Cargo.toml` writes versions directly (`axum`, `clap`, `serde`, `serde_json`, `tokio`, `tower-http`, `tracing`, `tracing-subscriber`) instead of `dep.workspace = true`, breaking the single-version rule in `rules.md`.
  plan: none yet
  trigger: the first implementation phase (workspace cleanup).

## README describes files that do not exist

- status: open
  area: docs
  summary: `README.md:34`, `README.md:35`, `README.md:46`, and `README.md:55` refer to `.env.example`, `just generate-key`, a root `compose.yaml`, and a `Dockerfile`; none exists (the compose file is `container/compose.yaml`, empty).
  plan: none yet
  trigger: when the server and its container build land, or earlier if the template is published.

## Task recipes are empty

- status: open
  area: scripts
  summary: `scripts/task-build.just`, `task-container.just`, `task-dev.just`, and `task-tests.just` are empty, so `just` exposes no gate; `shape.md` documents cargo commands as the stopgap.
  plan: none yet
  trigger: the first implementation phase; update `shape.md`'s command table in the same change.

## Location of domain modules is not confirmed

- status: considering (trigger: the owner confirms before the first module crate is created)
  area: workspace layout
  summary: the docs assume top-level `modules/<name>/`; the owner asked on 2026-11-19 why not `apps/server/modules/`. Options as analysed then: top-level `modules/` (recommended — keeps `apps/` for binaries and stays neutral for a second binary) or crates under `apps/server/modules/` (equivalent technically, ties modules to one app). A plain `mod` inside the server crate was rejected (no compile-time boundaries).
  trigger: creating the first crate under either path.
