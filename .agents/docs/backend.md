# Backend rules

updated: 2026-11-22T15:16:00+07:00

Contracts and traps for the Rust side: `apps/`, `crates/`, `modules/` (planned), `api/`. Cross-area rules are in `rules.md`; the reasoning is in `architecture.md`; commands are in `shape.md`.

## Layout

- `apps/server` (`rusttp-server`, the default member, `Cargo.toml:4`) is the composition root: CLI, module registration, lifecycle, the app's migrations (`apps/server/migrations/`).
- `apps/server/src/transport/`: `mod.rs` composes; `rpc.rs` Connect on `/rpc`; `http.rs` REST on `/api`; `spa.rs` the SPA document through `vixum`, assets through `memory-serve`; `static.rs` the HTML error page; `server.rs` the listener.
- `apps/server/stub/`: `head.html` and `body.html` are the document shell, `error.html` the panic page. `build.rs` points memory-serve at `apps/server/frontend` (gitignored) and seeds it with a stub manifest (entry `stub/default.js`) and a `null` route table when the SPA is not built. Storybook is the second named memory-serve directory, `apps/server/storybook` (gitignored; `storybook:build` writes it, `build.rs` seeds an `index.html` from `stub/storybook.html` when it is empty); `frontend` stays first because `memory_serve::load!()` takes the first directory. `STORYBOOK=false` at build time (read by `build.rs`, which reruns when it changes) skips Storybook: the directory is not embedded or seeded, the `storybook` cfg is not set, and `transport/storybook.rs` compiles `router()` to an empty router, so `/storybook` answers the SPA's 404 in every mode; anything but `false` embeds it. The cfg is declared with `cargo::rustc-check-cfg` in `build.rs`.
- `crates/<name>/`: framework libraries with no domain knowledge (`corelib`, `fetcher`, `libmailer`, `libqueue`, `libstorage`, `observer`, `scheduler`, `vixum`). `vixum` renders the SPA document (`Shell`, `Page`, `Route`) and proxies to Vite in dev.
- `modules/<name>/`: domain modules, one crate each. Not on disk yet; its location is `issue-00001` (considering).
- `api/connect/` holds the protobuf contracts; `api/specs/<area>/*.hurl` the HTTP specs.

## Dependency direction

- `apps` → `modules`, `crates`. `modules` → `crates`, and another module only through its `api`. `crates` → `crates` only; a framework crate never depends on a module.
- Never break a cycle with a re-export or a duplicated type; extract the shared contract (a `<module>-api` crate, or an event).

## Modules

- A module exposes its `Module` implementation and `pub mod api` (traits, DTOs, typed IDs, events) only; the rest is `pub(crate)` (`unreachable_pub = "deny"` makes a stray `pub` a build error). `domain` code does no IO.
- A module owns its state and returns a fully bound `Router`; no shared `AppState`. Construction is fallible (`new(&ctx, deps) -> Result<Self>`) and runs before the listener opens.
- Module-to-module dependencies are passed explicitly in `apps/<app>`: no DI container, no type map.
- Each module is an optional dependency behind a Cargo feature of the app, registered in one file under `#[cfg(feature = "...")]`; a module that needs another lists it in its feature (`billing = ["dep:mod-billing", "identity"]`). `cfg` appears only at declaration level (`mod`, registration, picking a trait implementation), never inside business logic.

## Data and migrations

- PostgreSQL through `sqlx`. A module reads and writes only its own schema; no cross-module joins, foreign keys, or transactions; other modules are referenced by typed ID. Cross-module side effects go through domain events on a transactional outbox, built when the first real one appears.
- The schema belongs to the application: domain modules ship no DDL; their tables live in `apps/<app>/migrations/` as `<timestamp>_<module>_<change>.sql`.
- A framework crate with tables embeds its migrations and exposes `fn migrations() -> MigrationSet`; the app registers framework sets before its own `app` set. A framework set never references an application table.
- One set = one schema = one version table, `<set>._migrations` (`Migrator::create_schema`, `Migrator::dangerous_set_table_name`). Never rename a set: the table name derives from it, and a rename re-runs every migration.
- Migrations are additive and forward-only unless the owner says otherwise; an applied migration is never edited.

## Errors and transport

- Each module defines errors with `thiserror` and maps them to the kernel's `AppError`, rendered as `application/problem+json`. Internal details go to the log with the trace id, never to the client.
- Every router runs behind a timeout, a body limit, `CatchPanicLayer`, a request id, and a trace span naming the module.
- Prefixes: Connect on `/rpc`, REST on `/api`, the SPA on every other path; no new top-level prefix without the owner. REST is for external callers (OAuth/OIDC, webhooks); a feature the SPA calls goes through Connect.
- Errors under `/api` are `application/problem+json` (`http::problem`), including the unmatched-route and wrong-method fallbacks; under `/rpc` they are Connect error JSON (the panic handler mirrors `{"code":"internal"}`). Elsewhere an error never answers JSON: a navigation gets the SPA document with the status `transport/spa.rs` sets (200 by default), a missing asset a bare 404, a panic `stub/error.html`. Each of the three trees has its own `CatchPanicLayer`.
- Health: `/livez` reports the process; `/readyz` aggregates the database and each module's `readiness()`.

## The SPA document (vixum)

- The server owns the document; the webapp has no `index.html`. The shell is `stub/head.html` (charset, viewport, icons, theme colour, the loader's CSS) and `stub/body.html` (the loader inside `#root`). Each page's head (title, description, Open Graph, canonical, robots, JSON-LD) and status come from the resolver in `transport/spa.rs`. The entry's tags come from Vite's manifest (`frontend/.vite/manifest.json`, the chunk with `isEntry`), or in dev from `transformIndexHtml` through the `vixum` Vite plugin.
- Page values are HTML-escaped; the shell fragments and `Page::head` are trusted markup and never carry request data.
- The route table comes from the route tree: `packages/plugins/src/vixum.ts` loads `app/routes.gen.ts` through Vite's SSR graph and lists `router.routesByPath` with each route's `staticData.pageTitle` and `pageDescription` (nearest up the parent chain). The build writes `frontend/routes.json` (`[{"path", "title"?, "description"?}]`); dev answers `/__vixum/routes.json` per navigation. `null` (no table) answers 200 everywhere.
- Matching: static segments case-insensitive, `$param`, `{$param}`, `{-$param}` with optional static affixes, and a trailing `$` splat; static segments win, then affixed params. A match carries the percent-decoded params (`Route::param`, the splat as `_splat`) and the title and description. An unmatched navigation answers 404 with the document; the client still renders its not-found page.
- The page title has one source, the route's `staticData.pageTitle` (`() => m.page_…()`, called once in English at build for `routes.json`). `__root.tsx` and `transport/spa.rs` both render `<pageTitle> - Rusttp`; keep the two templates identical. A title that depends on data comes from the resolver (`route.param(...)`).

## Rust code

- Versions are declared once in `[workspace.dependencies]` with the full `"x.y.z"` (no `=` prefix); members use `dep.workspace = true`; every crate sets `[lints] workspace = true`.
- Enable only the features the code uses: never an umbrella such as tokio `full`; `default-features = false` with an explicit list where defaults pull in unused parts (axum, tracing, tracing-subscriber). A member that needs one more feature adds it locally (Cargo unions the lists), so the workspace entry stays the common minimum; prune a feature when its last use goes.
- No `.unwrap()` / `.expect()` outside tests unless the panic is a true invariant, marked `// INVARIANT: ...`.
- `unsafe` needs `// SAFETY: ...` and a review flag; under edition 2024 every unsafe operation sits in an explicit `unsafe {}` block.
- Never hold a lock guard across `.await`; blocking work goes to `spawn_blocking`. Every background task is tracked (`TaskTracker` / `JoinSet`) and stops on the shared `CancellationToken`.
- Time and IDs are injected (`Clock`, an ID generator) so tests are deterministic.

## CLI

- clap derive in `apps/server/src/cmd/`: `mod.rs` holds `Cli`, `Command`, and the dispatch in `Cli::run`; one file per command group owns its `Args` and `run`. `main.rs` only parses, sets up tracing, and turns an `Err` into `error: <msg>` with exit 1.
- `docs/commandline.md` is the spec for names, flags, and descriptions; a command or flag lands in the spec and the code together.
- Names are `group:action` (`migrate:up`) through `#[command(name = "...")]`, or one kebab-case word (`serve`, `setup-admin`). Doc comments are the help text: one line, no trailing period.
- Global flags (`--env-file`, `--config-file`) live once on `Cli` with `global = true`; a subcommand never redeclares their names.
- Development-only commands (`migrate:create|validate|reset|seed`) are `#[cfg(debug_assertions)]` on the variant, its `Args`, its `run`, and its arm.
- A command whose behavior has not landed returns `not_implemented("<name>")` (exit 1); never `todo!()` or a silent success. Today every command but `serve` is a placeholder.
- `help` subcommand disabled (`-h`/`--help` only); a bare invocation prints the help. Submodule items are `pub(super)`; `cmd::tests::cli_definition_is_valid` runs clap's `debug_assert`.

## Tests

- Unit tests sit beside the code; `domain` is tested without a database.
- Database tests use `#[sqlx::test]` against the app's migrations (`#[sqlx::test(migrations = "../../apps/server/migrations")]` from a module crate; the relative path is unverified).
- App tests build the router with `build_app()` and drive it with `tower::ServiceExt::oneshot`.
- `cargo test --workspace` unifies features across members, so it never proves a module can be unplugged; `cargo hack check --each-feature -p rusttp-server` does.

## How to change it

- **Add a domain module:** `modules/<name>/` with the anatomy in `architecture.md`; add it to `[workspace] members` and `[workspace.dependencies]`; an optional dependency and a feature in `apps/server/Cargo.toml`; register it under `#[cfg(feature = "<name>")]`; its tables as a new migration in `apps/server/migrations/`; Hurl specs in `api/specs/<name>/`.
- **Add a framework crate with tables:** `crates/<name>/migrations/`, `migrations() -> MigrationSet` with a set name that never changes, registered in each app before the app set.
- **Add a CLI command:** write it into `docs/commandline.md` first; add `Args` and `run` to the group's file (a new file only for a new group); add the variant and its arm; run `cargo test -p rusttp-server` and check `--help`.
- **Change a module's public `api`:** a contract change for every consumer; ask first (`AGENTS.md`, "Ambiguous decisions").

## Traps

- `-D warnings` turns `missing_docs = "warn"` into an error under clippy: document public items instead of silencing the lint.
- `sqlx::migrate::Migrator`'s fields are `#[doc(hidden)]` and semver-exempt; use its methods only. `dangerous_set_table_name` on an existing production database re-runs migrations; it is safe here only because a set's table name is fixed from its first run.
- Cargo resolves every optional dependency into `Cargo.lock` even when its feature is off; an optional dependency must always resolve.
- A bare `"x.y.z"` is a caret requirement: `Cargo.lock` pins the build, and `cargo update` may move past the declaration; bump the declaration to match.
- Feature unification hides a missing feature: check one crate alone with `cargo clippy -p <crate>` when its feature list changes.
- clap panics (debug and the `debug_assert` test) on a subcommand flag that repeats a global flag's long name; `generate:keys` therefore writes to the global `--env-file`.
- `arg_required_else_help` prints help to stderr and exits 2, so `just run` without arguments reports a failure.
- `build.rs` seeds `apps/server/frontend` because `spa.rs` embeds it and memory-serve panics on a missing directory; a release build embeds whatever the folder holds at compile time. memory-serve's per-asset cargo warnings are silenced by `MEMORY_SERVE_QUIET` in `.cargo/config.toml`.
- `APP_MODE` (`apps/server/src/config/mod.rs`, `AppMode`) is `development`, `production`, or `test`; unset or empty means `production`, and any other value stops the server at startup (a typo must not count as "not production"). `transport::router(mode)` mounts `/storybook` (`transport/storybook.rs`) only when the mode is not `production`; unmounted, the path falls through to the SPA fallback, so production answers the SPA's 404 page. memory-serve's `nest` mounts the index on the bare `/storybook` and leaves `/storybook/` unmatched, and Storybook's links are relative, so the index is turned off and `/storybook` redirects to `/storybook/`, which serves `index.html` through the same asset router. Tests call `router(AppMode::Production)` unless they exercise the mode.
- Logging reads `LOG_LEVEL` (not `RUST_LOG`): a level or `EnvFilter` directives, `info` when unset or invalid (`apps/server/src/main.rs`). memory-serve's per-asset lines stay at `warn` unless a directive names `memory_serve`.
- A navigation is a `GET`/`HEAD` that asks for HTML or whose last segment has no extension; paths under `/@` and `/__` never are. A dotted path without `Accept: text/html` is an asset. `/.vite/*` and `/routes.json` are build metadata and answer 404.
- `/assets/*` answers `cache-control: immutable` (Vite content-hashes it); other public files keep memory-serve's revalidating default.
- An axum `nest` with its own fallback owns every path under its prefix; that keeps `/api/*` and `/rpc/*` misses away from the SPA fallback, so a nested router never drops its fallback.
