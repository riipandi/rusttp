# Rules — detailed instructions and contracts

updated: 2026-11-19T16:18:00+07:00

The general instructions live in the root `AGENTS.md`; this file carries the detail behind them. Read the section a change touches before touching it. The reasoning behind each contract is in `architecture.md`.

## Contracts

### Dependency direction

- `apps` → `modules`, `crates`. `modules` → `crates`, and another module only through its `api`. `crates` → other `crates` only; a framework crate never depends on a module.
- Cargo rejects cycles; never break one with a re-export or a duplicated type. Extract the shared contract instead (a `<module>-api` crate, or an event).

### Modules

- A module exposes exactly its `Module` implementation and `pub mod api` (traits, DTOs, typed IDs, events). Everything else is `pub(crate)`; `unreachable_pub = "deny"` makes a stray `pub` a build error.
- `domain` code performs no IO.
- A module owns its state and returns a fully bound `Router`. No shared global `AppState`.
- Construction is fallible (`new(&ctx, deps) -> Result<Self>`) and happens before the listener opens.
- Module-to-module dependencies are passed explicitly in `apps/<app>`. No runtime DI container, no type map.
- Plugging: each module is an optional dependency behind a Cargo feature on the app crate, registered in one file with `#[cfg(feature = "...")]`. A module that needs another lists it in its feature (`billing = ["dep:mod-billing", "identity"]`).
- `cfg` appears only at declaration level — `mod`, registration, choosing a trait implementation — never inside business logic.

### Data

- PostgreSQL through `sqlx`. Each module reads and writes only its own Postgres schema.
- No cross-module JOINs or foreign keys; other modules are referenced by typed ID.
- No transaction spans two modules. Cross-module side effects go through domain events on a transactional outbox (not built yet — build it when the first real cross-module side effect appears, not before).

### Migrations

- The schema belongs to the application. Domain modules ship no DDL; their tables live in `apps/<app>/migrations/`, named `<timestamp>_<module>_<change>.sql`.
- A framework crate that needs tables embeds its migrations and exposes `fn migrations() -> MigrationSet`. The app registers the sets it uses, framework sets before its own `app` set.
- One set = one Postgres schema = one version table, `<set>._migrations`, created through `Migrator::create_schema` and `Migrator::dangerous_set_table_name`.
- Never rename a set. The version table derives from the name; a rename makes sqlx re-run every migration of that set.
- A framework set never references an application table.
- Migrations are additive and forward-only unless the owner says otherwise. An applied migration is never edited; write a new one.

### Errors and HTTP

- Each module defines its errors with `thiserror` and maps them to the kernel's `AppError`, rendered as `application/problem+json`. Internal details go to the log with the trace id, never to the client.
- Every router runs behind a timeout, a body limit, `CatchPanicLayer`, a request id, and a trace span carrying the module name.
- Health: `/livez` reports the process; `/readyz` aggregates the database and each module's `readiness()`.

### Rust code

- Versions are declared once in `[workspace.dependencies]`; members use `dep.workspace = true`. Every crate sets `[lints] workspace = true`.
- No `.unwrap()` / `.expect()` outside tests unless the panic is a true invariant, marked `// INVARIANT: ...`.
- `unsafe` needs a `// SAFETY: ...` comment and is flagged for review; under edition 2024 every unsafe operation sits in an explicit `unsafe {}` block.
- Never hold a lock guard across `.await`; blocking work goes to `spawn_blocking`.
- Every background task is tracked (`TaskTracker` / `JoinSet`) and stops on the shared `CancellationToken`.
- Time and ID generation are injected (`Clock`, ID generator) so tests are deterministic.

### Tests

- Unit tests sit beside the code; `domain` is tested without a database.
- Database tests use `#[sqlx::test]` against the app's migrations (`#[sqlx::test(migrations = "../../apps/server/migrations")]` from a module crate — path relative to the crate, unverified).
- App tests build the router with `apps/server`'s `build_app()` and drive it with `tower::ServiceExt::oneshot`.

## How to change it

- **Add a domain module:** create `modules/<name>/` with the anatomy in `architecture.md`; add it to `[workspace] members` and `[workspace.dependencies]`; add an optional dependency and a feature to `apps/server/Cargo.toml`; register it in the app's registration file under `#[cfg(feature = "<name>")]`; add its schema and tables as a new migration in `apps/server/migrations/`; add Hurl specs under `api/specs/<name>/`.
- **Add a framework crate with tables:** create `crates/<name>/migrations/`, expose `migrations() -> MigrationSet` with a set name you will never change, and register it in each app that uses it, before the app set.
- **Change a module's public `api`:** this is a contract change for every consumer — ask first (see `AGENTS.md`, "Ambiguous decisions").

## Traps

- `-D warnings` turns the workspace's `missing_docs = "warn"` into an error under clippy: document public items instead of silencing the lint.
- `Cargo.toml:3` lists `members = ["apps/*", "crates/corelib"]`, so `crates/libmailer` and `crates/observer` are outside the workspace and no gate touches them until the list changes.
- `sqlx::migrate::Migrator`'s fields are `#[doc(hidden)]` and semver-exempt; use its methods only.
- `Migrator::dangerous_set_table_name` on an existing production database re-runs migrations; it is safe here only because a set's table name is fixed from its first run.
- Cargo resolves every optional dependency into `Cargo.lock` even when its feature is off; an optional dependency must always be resolvable.
- `cargo test --workspace` unifies features across members, so it never proves a module can be unplugged; only `cargo hack --each-feature` does.
