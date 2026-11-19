# Rules — detailed instructions and contracts

updated: 2026-11-19T22:06:38+07:00

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

- Versions are declared once in `[workspace.dependencies]`, with the full `"x.y.z"` version in `Cargo.lock` (never `"x"` or `"x.y"`, and no `=` prefix); members use `dep.workspace = true`. An upgrade bumps the declared version with the lockfile. Every crate sets `[lints] workspace = true`.
- Dependencies enable only the features the code uses (`Cargo.toml` `[workspace.dependencies]`): never an umbrella feature such as tokio `full`, and `default-features = false` with an explicit list wherever the defaults pull in unused parts (axum, tracing, tracing-subscriber). A member that needs one more feature adds it locally (`tokio = { workspace = true, features = ["fs"] }`; Cargo unions the lists), so the workspace entry stays the common minimum. The list is pruned when the last use of a feature goes; `cargo clippy --workspace --all-targets` is the check that the list still covers the code.
- No `.unwrap()` / `.expect()` outside tests unless the panic is a true invariant, marked `// INVARIANT: ...`.
- `unsafe` needs a `// SAFETY: ...` comment and is flagged for review; under edition 2024 every unsafe operation sits in an explicit `unsafe {}` block.
- Never hold a lock guard across `.await`; blocking work goes to `spawn_blocking`.
- Every background task is tracked (`TaskTracker` / `JoinSet`) and stops on the shared `CancellationToken`.
- Time and ID generation are injected (`Clock`, ID generator) so tests are deterministic.

### Tests

- Unit tests sit beside the code; `domain` is tested without a database.
- Database tests use `#[sqlx::test]` against the app's migrations (`#[sqlx::test(migrations = "../../apps/server/migrations")]` from a module crate — path relative to the crate, unverified).
- App tests build the router with `apps/server`'s `build_app()` and drive it with `tower::ServiceExt::oneshot`.

### Sample data

Every made-up value — test fixtures, seed rows, email `previewProps`, stories, mock responses, placeholder copy and labels — names people, places, and things from Dan Brown's novels (Robert Langdon, Sophie Neveu, Leigh Teabing, Katherine Solomon, Vittoria Vetra, the Louvre, CERN) or Harry Potter (Hermione Granger, Harry Potter, Albus Dumbledore, Minerva McGonagall, Hogwarts, Gringotts, Diagon Alley). Never `John Doe`, `Jane`, `Alice`/`Bob`, `foo`/`bar`, `test@`, `dummy`, or lorem ipsum.

- Addresses and hosts keep reserved names: `<first>.<last>@example.com`, `smtp.example.com`, `*.test`; the domain never becomes a real one (`hogwarts.edu`).
- IPs come from the documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32`).
- Codes and tokens may borrow spells and passwords from the books (`EXPECTO-PATRONUM`, `SANGREAL`), never something resembling a real secret.
- Infrastructure credentials in `container/` and `.env.example` are configuration, not sample data, and keep their neutral names.

## How to change it

- **Add a domain module:** create `modules/<name>/` with the anatomy in `architecture.md`; add it to `[workspace] members` and `[workspace.dependencies]`; add an optional dependency and a feature to `apps/server/Cargo.toml`; register it in the app's registration file under `#[cfg(feature = "<name>")]`; add its schema and tables as a new migration in `apps/server/migrations/`; add Hurl specs under `api/specs/<name>/`.
- **Add a framework crate with tables:** create `crates/<name>/migrations/`, expose `migrations() -> MigrationSet` with a set name you will never change, and register it in each app that uses it, before the app set.
- **Change a module's public `api`:** this is a contract change for every consumer — ask first (see `AGENTS.md`, "Ambiguous decisions").

## Traps

- `-D warnings` turns the workspace's `missing_docs = "warn"` into an error under clippy: document public items instead of silencing the lint.
- `sqlx::migrate::Migrator`'s fields are `#[doc(hidden)]` and semver-exempt; use its methods only.
- `Migrator::dangerous_set_table_name` on an existing production database re-runs migrations; it is safe here only because a set's table name is fixed from its first run.
- Cargo resolves every optional dependency into `Cargo.lock` even when its feature is off; an optional dependency must always be resolvable.
- `cargo test --workspace` unifies features across members, so it never proves a module can be unplugged; only `cargo hack --each-feature` does.
