# Shape

updated: 2026-11-19T16:41:00+07:00

The repository's shape: the layout, the toolchain, and the commands. Read once; return when a path or a command is needed.

## Layout

| Path                    | Role                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/<app>/`           | Deployable binaries and the composition root: CLI, module registration, lifecycle, the app's own migrations (`apps/<app>/migrations/`). `apps/server` (`rusttp-server`) is the default member (`Cargo.toml:4`). |
| `crates/<name>/`        | Reusable framework libraries: kernel, database, observer, mailer, queue, scheduler, audit. No domain knowledge.                                                                                                 |
| `modules/<name>/`       | Domain modules (bounded contexts), one crate each.                                                                                                                                                              |
| `api/connect/`          | Protobuf contracts.                                                                                                                                                                                             |
| `api/specs/<area>/`     | Hurl HTTP specs, one directory per area.                                                                                                                                                                        |
| `packages/`             | pnpm workspace: `webapp`, `emails`, `e2e`.                                                                                                                                                                      |
| `scripts/*.just`        | Task recipes imported by `justfile` (`task-build`, `task-container`, `task-dev`, `task-tests`).                                                                                                                 |
| `container/`, `deploy/` | Compose and deployment templates.                                                                                                                                                                               |
| `.agents/docs/`         | Agent ledger.                                                                                                                                                                                                   |
| `docs/`                 | Human-facing documentation.                                                                                                                                                                                     |

## Toolchain

- Rust `1.100.0` (`rust-toolchain.toml:13`), edition 2024 (`Cargo.toml:14`), workspace resolver 2.
- Formatting: `rustfmt.toml` (edition 2024, `max_width = 120`). A Claude Code `PostToolUse` hook (`.claude/hooks/format.sh`) formats every edited file inside the repository: `.rs` with `rustfmt`, `.md` with `rumdl fmt` (default rules, no line wrapping). It needs `jq`; a missing formatter is skipped silently.
- Workspace lints (`Cargo.toml:17-20`): `missing_docs = "warn"`, `unreachable_pub = "deny"`, `private_interfaces = "deny"`. Each crate opts in with `[lints] workspace = true`.
- Build flags (`.cargo/config.toml`): `target-cpu=native`; `lld` on the musl and aarch64-gnu targets.
- Frontend: pnpm `12.21.0` (`package.json`).
- Developer tools: `just`, `cargo-nextest`, `hurl`, `lefthook`, `watchexec`; optional: `cargo-hack` (feature combinations), `cargo-deny`, `sqlx-cli`. Check that a tool is installed before relying on it; do not install one unasked.

## Commands

Prefer the `just` recipe for a gate when `scripts/*.just` defines one; otherwise run the cargo command below.

| Gate                 | Command                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| Format               | `cargo fmt --all` (check only: `cargo fmt --all --check`)               |
| Check                | `cargo check --workspace --all-targets`                                 |
| Lint                 | `cargo clippy --workspace --all-targets -- -D warnings`                 |
| Test                 | `cargo nextest run --workspace` (fallback `cargo test --workspace`)     |
| Feature combinations | `cargo hack check --each-feature -p rusttp-server` — needs `cargo-hack` |
| API specs            | `hurl --test api/specs/<area>/*.hurl` against a running server          |
