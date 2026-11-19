# Rules — detailed instructions and contracts

updated: 2026-11-19T22:18:41+07:00

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
- Transport (`apps/server/src/transport/`): Connect on `/rpc`, REST on `/api`, the SPA on every other path; no other top-level prefix without the owner. Errors under `/api` are `application/problem+json` (`http::problem`), including the unmatched-route and wrong-method fallbacks; errors under `/rpc` are Connect error JSON (connectrpc renders them; the panic handler mirrors `{"code":"internal"}`). Everywhere else an error never answers JSON: an unknown path serves the SPA's `index.html` with 200, a panic serves `transport/internal-error.html`. Each of the three trees has its own `CatchPanicLayer`.
- REST is for external callers (OAuth/OIDC, webhooks); a feature the SPA calls goes through Connect.
- Health: `/livez` reports the process; `/readyz` aggregates the database and each module's `readiness()`.

### Rust code

- Versions are declared once in `[workspace.dependencies]`, with the full `"x.y.z"` version in `Cargo.lock` (never `"x"` or `"x.y"`, and no `=` prefix); members use `dep.workspace = true`. An upgrade bumps the declared version with the lockfile. Every crate sets `[lints] workspace = true`.
- Dependencies enable only the features the code uses (`Cargo.toml` `[workspace.dependencies]`): never an umbrella feature such as tokio `full`, and `default-features = false` with an explicit list wherever the defaults pull in unused parts (axum, tracing, tracing-subscriber). A member that needs one more feature adds it locally (`tokio = { workspace = true, features = ["fs"] }`; Cargo unions the lists), so the workspace entry stays the common minimum. The list is pruned when the last use of a feature goes; `cargo clippy --workspace --all-targets` is the check that the list still covers the code.
- No `.unwrap()` / `.expect()` outside tests unless the panic is a true invariant, marked `// INVARIANT: ...`.
- `unsafe` needs a `// SAFETY: ...` comment and is flagged for review; under edition 2024 every unsafe operation sits in an explicit `unsafe {}` block.
- Never hold a lock guard across `.await`; blocking work goes to `spawn_blocking`.
- Every background task is tracked (`TaskTracker` / `JoinSet`) and stops on the shared `CancellationToken`.
- Time and ID generation are injected (`Clock`, ID generator) so tests are deterministic.

### CLI

- The command line is clap derive in `apps/server/src/cmd/`: `mod.rs` holds `Cli`, the `Command` enum, and the dispatch in `Cli::run`; each command group has one file owning its `Args` and its `run` (`serve.rs`, `migrate.rs`, …). `main.rs` only parses, sets up tracing, and turns an `Err` into `error: <msg>` with exit 1.
- `docs/commandline.md` is the spec for names, flags, and descriptions; output and help formatting are clap's own. A command or flag lands in the spec and the code together.
- Names are `group:action` (`migrate:up`, `config:print`) through `#[command(name = "...")]`, or a plain kebab-case word for a standalone command (`serve`, `setup-admin`). Doc comments are the help text, one line, no trailing period.
- Global flags (`--env-file`, `--config-file`) are declared once on `Cli` with `global = true` under the "Global Options" heading; a subcommand never redeclares one of their names.
- Development-only commands (`migrate:create`, `migrate:validate`, `migrate:reset`, `migrate:seed`) are `#[cfg(debug_assertions)]` on the variant, its `Args`, its `run`, and its dispatch arm, so a release binary does not carry them.
- A command whose behavior has not landed returns `not_implemented("<name>")` (exit 1); never a `todo!()` or a silent success.
- The `help` subcommand is disabled (`-h`/`--help` only), and a bare invocation prints the help (`arg_required_else_help`).
- Submodule items are `pub(super)` (`unreachable_pub` denies `pub`); `cmd::tests::cli_definition_is_valid` runs clap's `debug_assert` over the whole tree.

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
- **Add a CLI command:** write it into `docs/commandline.md` first; add its `Args` and `run` to the group's file under `apps/server/src/cmd/` (a new file only for a new group); add the variant with its doc comment and `#[command(name = "...")]` to `Command` and its arm to `Cli::run`; check `cargo test -p rusttp-server` (the clap `debug_assert`) and `--help`.
- **Change a module's public `api`:** this is a contract change for every consumer — ask first (see `AGENTS.md`, "Ambiguous decisions").

## Traps

- `-D warnings` turns the workspace's `missing_docs = "warn"` into an error under clippy: document public items instead of silencing the lint.
- `sqlx::migrate::Migrator`'s fields are `#[doc(hidden)]` and semver-exempt; use its methods only.
- `Migrator::dangerous_set_table_name` on an existing production database re-runs migrations; it is safe here only because a set's table name is fixed from its first run.
- Cargo resolves every optional dependency into `Cargo.lock` even when its feature is off; an optional dependency must always be resolvable.
- A bare `"x.y.z"` in `Cargo.toml` is a caret requirement (`^x.y.z`): `Cargo.lock` is what pins the build, and `cargo update` may move a dependency past the declared version; bump the declaration to match when it does.
- Feature unification hides a missing feature: a member that uses a feature another member enables still builds in the workspace. Check one crate alone with `cargo clippy -p <crate>` when its feature list changes.
- clap panics (in debug, and in the `debug_assert` test) on a subcommand flag that repeats a global flag's long name; `generate:keys` therefore writes to the global `--env-file` instead of declaring its own.
- `arg_required_else_help` prints the help to stderr and exits 2, so `just run` without arguments reports a failure.
- `apps/server/build.rs` writes a stub `index.html` into `apps/server/frontend` when the SPA is not built, because memory-serve panics on a missing or empty directory; a release build embeds whatever the folder holds at compile time, so run `pnpm --filter webapp build` before `cargo build --release`. memory-serve's per-asset cargo warnings are silenced by `MEMORY_SERVE_QUIET` in `.cargo/config.toml`.
- An axum `nest` with its own fallback owns every path under its prefix; that is what keeps `/api/*` and `/rpc/*` misses away from the SPA fallback, so a nested router never drops its fallback.
- `cargo test --workspace` unifies features across members, so it never proves a module can be unplugged; only `cargo hack --each-feature` does.
