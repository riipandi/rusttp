# Shape

updated: 2026-11-19T17:15:00+07:00

The repository's shape: the layout, the toolchain, and the commands. Read once; return when a path or a command is needed.

## Layout

| Path                    | Role                                                                                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/<app>/`           | Deployable binaries and the composition root: CLI, module registration, lifecycle, the app's own migrations (`apps/<app>/migrations/`). `apps/server` (`rusttp-server`) is the default member (`Cargo.toml:4`).                                                                     |
| `crates/<name>/`        | Reusable framework libraries: kernel, database, observer, mailer, queue, scheduler, audit. No domain knowledge.                                                                                                                                                                     |
| `modules/<name>/`       | Domain modules (bounded contexts), one crate each.                                                                                                                                                                                                                                  |
| `api/connect/`          | Protobuf contracts.                                                                                                                                                                                                                                                                 |
| `api/specs/<area>/`     | Hurl HTTP specs, one directory per area.                                                                                                                                                                                                                                            |
| `packages/`             | pnpm workspace (`pnpm-workspace.yaml`): `webapp`, `emails`, `e2e`. `webapp` is a React SPA (Vite, TanStack Router file routes in `app/routes/` with the generated `app/routes.gen.ts` committed, TanStack Query); `pnpm --filter webapp dev` serves `:5173` and proxies `/api` and `/healthz` to the Rust server (`BACKEND_URL`, default `http://127.0.0.1:3000`); `build` type-checks then writes `dist/`.                                                                                                                                                                                                                                          |
| `scripts/*.just`        | Task recipes imported by `justfile` (`task-development`, `task-quality`, `task-container`).                                                                                                                                                                                         |
| `container/`, `deploy/` | Compose and deployment templates. `container/compose.yaml` includes `compose-dev.yaml` (pgsql, redis, silo S3, mailpit) and `compose-sre.yaml` (ClickStack, cadvisor, redis-exporter; `container/clickstack/` holds its collector config, provisioning script, dashboards, saved searches, alerts; provisioning favorites every shipped dashboard and search, and alerts email the Mailpit inbox through a webhook). |
| `.agents/docs/`         | Agent ledger.                                                                                                                                                                                                                                                                       |
| `docs/`                 | Human-facing documentation.                                                                                                                                                                                                                                                         |

## Toolchain

- Rust `1.100.0` (`rust-toolchain.toml:13`), edition 2024 (`Cargo.toml:14`), workspace resolver 2.
- Formatting: `rustfmt.toml` (edition 2024, `max_width = 120`). A Claude Code `PostToolUse` hook (`.claude/hooks/format.sh`) formats every edited file inside the repository: `.rs` with `rustfmt`, `.md` with `rumdl fmt` (default rules, no line wrapping), and `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/`.css` under `packages/` with the workspace-root `oxfmt`. Frontend style lives in `.oxfmtrc.json` (2 spaces, single quotes, no semicolons, sorted imports) and lint rules in `.oxlintrc.json` (type-aware through `oxlint-tsgolint`); both are installed at the pnpm workspace root. It needs `jq`; a missing formatter is skipped silently.
- Workspace lints (`Cargo.toml:17-20`): `missing_docs = "warn"`, `unreachable_pub = "deny"`, `private_interfaces = "deny"`. Each crate opts in with `[lints] workspace = true`.
- Build flags (`.cargo/config.toml`): `target-cpu=native`; `lld` on the musl and aarch64-gnu targets.
- Frontend: pnpm `12.21.0` (`package.json`).
- Developer tools: `just`, `cargo-nextest`, `rumdl`, `hurl`, `watchexec`; optional: `cargo-hack` (feature combinations), `cargo-deny`, `sqlx-cli`. Check that a tool is installed before relying on it; do not install one unasked.

## Commands

Run every gate through `just` (`justfile` imports `scripts/task-*.just`; `just` alone lists the recipes).

| Gate                 | Recipe                              | Runs                                                                                                             |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Format               | `just format` / `just format-check` | `cargo fmt --all` + `rumdl fmt .` + `pnpm format` (oxfmt on `packages/`; `--check` for all three; config in `.rumdl.toml`, `.oxfmtrc.json`)                                  |
| Check                | `just check`                        | `cargo check --workspace --all-targets`                                                                          |
| Lint                 | `just lint`                         | `cargo clippy --workspace --all-targets -- -D warnings` + `pnpm lint` (oxlint on `packages/`)                                                          |
| Test                 | `just test`                         | `cargo nextest run --workspace` (falls back to `cargo test --workspace`)                                         |
| All of the above     | `just verify`                       | format-check, check, lint, test                                                                                  |
| API specs            | `just test-api [url]`               | `hurl --test` over `api/specs/**/*.hurl`, `base_url` defaults to `http://127.0.0.1:3000`; needs a running server |
| Feature combinations | —                                   | `cargo hack check --each-feature -p rusttp-server`, only when `cargo-hack` is installed                          |

Other recipes: `dev` (runs `serve` in a watchexec restart loop), `run <command>` (any app CLI command, e.g. `just run serve --bind 0.0.0.0:3000`), `build` (release, then prints the binary size) and `start` (runs `serve` from the release build), `deps`, and the `compose-*` (up, down, restart, exec, cleanup) / `docker-*` (build, images, run, shell, push) container tasks (`container/compose.yaml`, `deploy/Dockerfile`). Utility: `generate-key`, `cleanup`.
