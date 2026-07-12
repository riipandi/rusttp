# Agent Instructions

## Commands

All commands go through `make`. Run `make help` for the full list.

| Task              | Command         | Notes                                                                                 |
| ----------------- | --------------- | ------------------------------------------------------------------------------------- |
| Type-check (fast) | `make check`    | No codegen, workspace-wide                                                            |
| Build release     | `make build`    | Builds frontend first (`pnpm build`), then `cargo build --release`                    |
| Run dev server    | `make run`      | Auto-loads `.env.local` if present; pass args: `make run -- --port 9090`              |
| Test (Rust)       | `make test`     | Uses **cargo-nextest**, not `cargo test`. Pass filter: `make test -- -E 'test(root)'` |
| Lint              | `make lint`     | `clippy --workspace --all-targets -- -D warnings` (warnings = errors)                 |
| Format            | `make fmt`      | `cargo fmt --all`                                                                     |
| Coverage          | `make coverage` | Requires `cargo-llvm-cov`                                                             |
| Frontend dev      | `make web-dev`  | Vite dev server with proxy to `localhost:3080`                                        |
| Frontend test     | `make web-test` | `vitest run`                                                                          |
| Install tools     | `make prepare`  | Installs nextest, llvm-cov, sccache, watchexec, etc. via cargo-binstall               |

**Toolchain**: Rust edition 2024, MSRV 1.97. Frontend uses pnpm (not npm/yarn).

## Architecture

Cargo workspace with a single binary crate and four library crates:

```
src-app/          Binary crate ("rusttp") — CLI, Axum server, embedded SPA
crates/
  identity/       Domain models, repositories, services (users, sessions)
  lib-mailer/     Email sending abstraction
  lib-queue/      Background job queue abstraction
  lib-observer/   Observability: structured logging (logforth), tracing (fastrace), metrics
```

### Request flow

`main.rs` → parse CLI (`cmd::Cli`) → init observer → dispatch to subcommand.

The `serve` subcommand starts an Axum server. Router is built in `server/router.rs`:

- `/api/*` — JSON API routes (`server/routes/api.rs`), with dedicated fallback returning JSON 404
- `/rpc/*` — RPC routes (`server/routes/rpc.rs`), same JSON error pattern
- `/` — serves embedded SPA index
- `/*` (fallback) — SPA fallback: tries static asset from embedded files, falls back to `index.html`

Middleware stack (applied in `router::build()`): trailing-slash redirect → request logger → panic catcher → optional fastrace layer.

### Embedded frontend

Vite builds into `src-app/web/`. The Rust binary embeds this directory at compile time via `rust-embed` (`server/web_assets.rs`). **You must run `pnpm build` (or `make web-build`) before `cargo build` or the embedded assets will be stale/missing.** `make build` handles this automatically.

### CLI structure

Uses clap derive. Subcommands: `serve` (alias `s`), `health` (alias `hc`). Global flag: `--env-file <path>`. Version string includes git hash, build OS/arch, and build timestamp injected by `build.rs`.

## Conventions

- **Logging**: Use the `log` crate macros (`log::info!`, etc.), not `println!`. Structured key=value format. Log level controlled by `LOG_LEVEL` or `RUST_LOG` env var.
- **Error responses**: All API/RPC errors return JSON via `server::error::ErrorResponse`. Use `AppError` enum for handler-level errors. Never return plain text from API routes.
- **Tracing**: fastrace, not opentelemetry SDK directly. Gated by `TRACING_ENABLE=true` env var at runtime. Sampling rate via `TRACING_SAMPLING` (0.0–1.0). Reporter modes: console, file, otel.
- **Env vars**: Documented in `.env.example`. The app reads config exclusively from env vars (no config files). `--env-file` overrides system env.
- **Tests**: Keep tests small and focused. Inline `#[cfg(test)] mod tests` in every module. Integration tests in `src-app/tests/`. Tests use `tower::ServiceExt::oneshot` against `server::build()` — no HTTP client needed. Server smoke tests bind port 0 and abort the handle.
- **UUIDs**: v7 only (time-sortable). Configured via workspace dependency features.
- **Panic handling**: Release profile uses `panic = "abort"`. CatchPanicLayer wraps all routes to return JSON 500 instead of dropping the connection.

## Gotchas

- **`make test` uses cargo-nextest**, not `cargo test`. Nextest runs each test in its own process. Filter syntax differs: `-E 'test(name)'` not `-- name`.
- **`make run` auto-injects `--env-file .env.local`** if the file exists. This happens in the Makefile, not in the binary itself. The binary's own `--env-file` flag works independently.
- **Frontend build output goes to `src-app/web/`**, not `dist/`. This is configured in `vite.config.ts` (`build.outDir`). The `rust-embed` macro in `web_assets.rs` points at `web/` relative to `src-app/`.
- **`unsafe { std::env::set_var() }`** is used in tests and startup. This is intentional — env vars are set before any concurrent access. Don't "fix" these to safe alternatives.
- **LSP diagnostics in `lib-observer`** may show false positives for chrono/logforth trait methods. These resolve at compile time with the correct feature flags. Trust `make check` over IDE diagnostics for that crate.
- **sccache** is auto-enabled if installed (Makefile sets `RUSTC_WRAPPER`). Speeds up rebuilds significantly.

## Dependencies

- **Single source of truth**: Root `Cargo.toml` `[workspace.dependencies]` is the single source of truth for all dependency versions and features.
- **Explicit versions**: Every dependency must use explicit `major.minor.patch` version (no `"0.7"` or `"^0.7"`).
- **Explicit features**: Every used feature must be declared in root's entry, not scattered across member crates.
- **Member crates**: Use `foo.workspace = true` — never repeat version or features in member `Cargo.toml`.
- **Exceptions**:
    - Conditional per-target deps (e.g. `[target.'cfg(not(target_env = "msvc"))'.dependencies]` for `mimalloc`).
    - Features that only apply to the binary crate (e.g. `fastrace = { workspace = true, features = ["enable"] }` in `src-app`, where the library crates must NOT enable the collector).
- **Verify**: `cd src-app && cargo tree -e features --depth 0` to inspect resolved features per crate.
