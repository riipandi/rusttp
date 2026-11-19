# Shape

updated: 2026-11-19T17:15:00+07:00

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
| `scripts/*.just`        | Task recipes imported by `justfile` (`task-development`, `task-quality`, `task-container`).                                                                                                                     |
| `container/`, `deploy/` | Compose and deployment templates.                                                                                                                                                                               |
| `.agents/docs/`         | Agent ledger.                                                                                                                                                                                                   |
| `docs/`                 | Human-facing documentation.                                                                                                                                                                                     |

## Toolchain

- Rust `1.100.0` (`rust-toolchain.toml:13`), edition 2024 (`Cargo.toml:14`), workspace resolver 2.
- Formatting: `rustfmt.toml` (edition 2024, `max_width = 120`). A Claude Code `PostToolUse` hook (`.claude/hooks/format.sh`) formats every edited file inside the repository: `.rs` with `rustfmt`, `.md` with `rumdl fmt` (default rules, no line wrapping). It needs `jq`; a missing formatter is skipped silently.
- Workspace lints (`Cargo.toml:17-20`): `missing_docs = "warn"`, `unreachable_pub = "deny"`, `private_interfaces = "deny"`. Each crate opts in with `[lints] workspace = true`.
- Build flags (`.cargo/config.toml`): `target-cpu=native`; `lld` on the musl and aarch64-gnu targets.
- Frontend: pnpm `12.21.0` (`package.json`).
- Developer tools: `just`, `cargo-nextest`, `rumdl`, `hurl`, `watchexec`; optional: `cargo-hack` (feature combinations), `cargo-deny`, `sqlx-cli`. Check that a tool is installed before relying on it; do not install one unasked.

## Commands

Run every gate through `just` (`justfile` imports `scripts/task-*.just`; `just` alone lists the recipes).

| Gate                 | Recipe                              | Runs                                                                                                             |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Format               | `just format` / `just format-check` | `cargo fmt --all` + `rumdl fmt .` (`--check` for both; config in `.rumdl.toml`)                                  |
| Check                | `just check`                        | `cargo check --workspace --all-targets`                                                                          |
| Lint                 | `just lint`                         | `cargo clippy --workspace --all-targets -- -D warnings`                                                          |
| Test                 | `just test`                         | `cargo nextest run --workspace` (falls back to `cargo test --workspace`)                                         |
| All of the above     | `just verify`                       | format-check, check, lint, test                                                                                  |
| API specs            | `just test-api [url]`               | `hurl --test` over `api/specs/**/*.hurl`, `base_url` defaults to `http://127.0.0.1:3000`; needs a running server |
| Feature combinations | —                                   | `cargo hack check --each-feature -p rusttp-server`, only when `cargo-hack` is installed                          |

Other recipes: `dev` (runs `serve` in a watchexec restart loop), `run <command>` (any app CLI command, e.g. `just run serve --bind 0.0.0.0:3000`), `build` (release, then prints the binary size) and `start` (runs `serve` from the release build), `deps`, and the `compose-*` (up, down, restart, exec, cleanup) / `docker-*` (build, images, run, shell, push) container tasks (`container/compose.yaml`, `deploy/Dockerfile`). Utility: `generate-key`, `cleanup`.
