# Architecture

updated: 2026-11-19T23:10:46+07:00

The architecture and the reasoning behind it. The layout lives in `shape.md`; the binding rules derived from these decisions live in `rules.md`; this file keeps the why, so a settled decision is not re-litigated.

## Module anatomy

```text
modules/<name>/
  src/lib.rs      # pub use module::<Name>Module; pub mod api;
  src/api.rs      # public contract: traits, DTOs, typed IDs, events
  src/domain/     # pure logic, no IO
  src/store.rs    # sqlx queries against the module's own Postgres schema
  src/http.rs     # thin axum handlers
  src/module.rs   # impl kernel::Module
```

Kernel contract:

```rust
pub trait Module: Send + Sync + 'static {
    fn name(&self) -> &'static str;
    fn routes(&self) -> Router { Router::new() }
    fn readiness(&self) -> Option<Arc<dyn HealthCheck>> { None }
    fn spawn(&self, _rt: &Runtime) {}
}
```

Lifecycle: build every module (fallible) → run migration sets → `spawn` background work on a shared `TaskTracker` + `CancellationToken` → serve → on signal stop accepting, cancel, and wait for tasks within a timeout. `spawn` is synchronous because an `async fn` in a trait is not object-safe.

## Decision records

### Modules are crates, plugged in and out with Cargo features

Context: the owner wants to add or remove modules easily, by flag or annotation (2026-11-19).

Decision: one crate per module under `modules/`; the app crate declares each module as an optional dependency behind a feature and registers it in one file with `#[cfg(feature = "...")]`. A module that depends on another expresses it in the feature list (`billing = ["dep:mod-billing", "identity"]`).

Consequences:

- (positive) Cargo enforces boundaries and rejects dependency cycles at compile time; an unplugged module drops its routes, code, and dependencies from the binary; crates compile in parallel and cache independently.
- (negative) one registration line per module; every feature combination must compile, so CI needs `cargo hack --each-feature`; `cfg` sprawl is a risk, contained by allowing it only at declaration level.

Alternatives considered:

- `mod` per module inside the app crate — rejected: `pub(crate)` spans the whole app so boundaries are discipline only, cycles go undetected, one module change recompiles everything.
- Self-registration with `linkme` / `inventory` — rejected: an unreferenced crate is not linked, so each module still needs a `use mod_x as _;` line; ordering is undefined; adds linker-level magic for no saved line.
- Runtime toggle only (`MODULES=...`) — rejected as the primary mechanism: code and dependencies stay in the binary and dependency errors surface at startup instead of compile time. Still allowed later as an addition.
- Dynamic plugins (dylib/WASM) — rejected: Rust has no stable ABI.

### No shared AppState and no DI container

Context: a shared state struct couples every module to every other, and a runtime DI container turns wiring mistakes into startup errors.

Decision: each module owns its state and returns a fully bound `Router`; module-to-module dependencies are passed explicitly in `apps/<app>` (`billing::new(&ctx, identity.api())`).

Consequences:

- (positive) wiring is compile-checked and works with `#[cfg]`; a module can be read and tested alone.
- (negative) the composition root grows a line per dependency edge.

Alternatives considered:

- One global `AppState` — rejected: every module sees every dependency, which recreates the coupling the crate split removes.
- Runtime DI container or type map — rejected: missing registrations become runtime errors; the compiler already does this job.

### One Postgres schema per module, no cross-module joins or foreign keys

Context: modules must be removable and, eventually, extractable without untangling the database.

Decision: each module's tables live in its own Postgres schema; other modules are referenced by typed ID only; no transaction spans two modules; cross-module side effects travel as domain events through a transactional outbox (built when the first real cross-module side effect appears).

Consequences:

- (positive) ownership is visible in SQL; unplugging or extracting a module does not break another module's queries.
- (negative) no referential integrity across modules; consistency across modules is eventual and handlers must be idempotent.

Alternatives considered:

- In-memory event bus — rejected: events are lost when the process dies.
- Shared tables with foreign keys — rejected: couples modules at the storage layer, which Cargo cannot police.

### The schema belongs to the application; framework crates register migration sets

Context: the owner wants migrations owned per application, with `crates/` as pure reusable libraries; framework crates such as audit, queue, and scheduler still need tables (2026-11-19).

Decision: domain modules ship no DDL; their tables live in `apps/<app>/migrations/`, file names prefixed with the module. A framework crate that needs tables embeds its own migrations and exposes a `MigrationSet`; the app registers the sets it uses, framework sets first. Each set gets its own Postgres schema and version table (`<set>._migrations`).

Consequences:

- (positive) one place decides what a deployment's schema is; framework DDL travels with the code that queries it, so a crate upgrade brings its migrations automatically; sets never share a history.
- (negative) an unplugged domain module still leaves its tables (harmless, unused); module tests run against the app's migrations path; a set can never be renamed.

Alternatives considered:

- Migrations per domain module — rejected by the owner: the schema is an application decision.
- Copying ("publishing") framework SQL into the app — rejected: the app could edit DDL the framework's queries depend on, and a forgotten republish leaves code and schema out of step.

### sqlx's built-in migrator

Context: candidates compared on 2026-11-19 from source and README: sqlx-core 0.9.1, refinery 0.10.0, geni 1.3.3.

Decision: use `sqlx::migrate!` with `Migrator::create_schema` and `Migrator::dangerous_set_table_name` (both present in sqlx-core 0.9.1 `src/migrate/migrator.rs`) to give each set its own schema and version table.

Consequences:

- (positive) no extra dependency or second Postgres driver; migrations are embedded in the binary; checksums, advisory locking, `.down.sql` reversal, and `#[sqlx::test]` integration come with it.
- (negative) the table-name setter is labelled `dangerous_` (safe only because set names never change); `Migrator` fields are semver-exempt, so only its methods are used; migrations are SQL only.

Alternatives considered:

- refinery — rejected: needs `postgres`/`tokio-postgres` beside sqlx (its sqlx support was removed, issue #311), so two drivers and two TLS paths; no down migrations; timestamp versions need `int8-versions` from day one.
- geni — rejected: CLI-first; the library API reads migrations from a folder at runtime (no embedding); pulls its own sqlx 0.8 plus libsql and turso unconditionally.

Unverified: the behaviour of `create_schema` + `dangerous_set_table_name` against a live Postgres, and sqlx's advisory-lock scope across sets. Both are the first tests to write in the database crate.

### Connect as the primary protocol, REST beside it, the SPA embedded

Context: the SPA needs typed calls with one contract shared by server and client, while OAuth/OIDC providers, webhooks, and other external callers expect plain REST. In development the SPA runs on Vite's dev server; in production the server must ship as one binary.

Decision (2026-11-19, owner): one axum router in `apps/server/src/transport/` serves Connect RPC (`connectrpc`) on `/rpc/<package.Service>/<Method>`, REST on `/api` (versioned under `/api/v1`), and the SPA on every other path. The server owns the SPA document for SEO (2026-11-19, owner): `crates/vixum` renders the whole document: the app's shell (`apps/server/stub/head.html`, `body.html`), each page's head and status, and the entry's tags, which come from Vite's build manifest (the build's input is `app/main.tsx`; there is no `index.html`); `memory-serve` embeds `apps/server/frontend` (the gitignored `vite build` output) and serves the assets. A route table taken from TanStack Router's generated tree makes an unknown path answer 404 while the SPA still renders its not-found page. The browser opens the server's port in development as in production: a Vite plugin (`packages/webapp/plugins/rust-server.ts`) builds and runs the debug server, which runs each document through Vite's `transformIndexHtml` (the `vixum` plugin's `/__vixum/transform`, so the HMR client, the React preamble, and other plugins' tags stay Vite's) and proxies modules and assets to Vite, while the HMR socket connects to Vite directly; on a Rust change the plugin rebuilds first and starts the new server beside the old one (`SO_REUSEPORT`, debug builds only) before retiring it. Errors under `/api` and `/rpc` are JSON (`application/problem+json` for REST, the Connect error body for RPC); every other path answers the document (status from the page resolver) or a static HTML page.

Consequences:

- (positive) one origin in development and production, so session cookies stay first-party and no CORS is needed; one binary to deploy; Connect speaks JSON as well as protobuf, so a browser or `curl` can call it.
- (negative) a release build embeds whatever `apps/server/frontend` holds at compile time: build the SPA first, or the binary ships the stub page `build.rs` writes; connectrpc is pre-1.0, so a minor bump may change its API.

Alternatives considered:

- `axum-connect` — rejected: thinner protocol coverage and less active than `connectrpc`, which passes the Connect conformance suite.
- Connect at the root (`/<package.Service>/<Method>`) — rejected: it shares the namespace with SPA routes and needs a proxy entry per package.
- Porting vite-rs — rejected: it serves `index.html` as built (one head for every page; templating is out of its scope, its README says), and it runs Vite as a child of the Rust process, so every Rust restart restarts Vite. Its dev proxy is the one part kept, in vixum.
- Keeping Vite's `index.html` and writing the page head into it — replaced (2026-11-19, owner): the document's static parts belonged to the frontend package while the server owned the rest; the shell now lives with the server, and dev keeps Vite's tags through `transformIndexHtml` instead of hand-written HMR and preamble tags (the Saka/olivere-vite shape writes them by hand).
- Vite in front with a proxy to the server — rejected: two ports between dev and production, and the head stays static.
- `rust-embed` — rejected: cache headers, precompression, and the SPA fallback would be hand-written; `tower-http` `ServeDir` — rejected: the binary would need `dist/` beside it at runtime.
- watchexec restarting `cargo run` (with `systemfd`/`listenfd` holding the socket) — rejected: the server is down for the whole compile and stays down when the build fails; the plugin keeps the old server answering in both cases, with one process to run.
- vite-rs (Vite managed from Rust) — rejected after research: the Vite-first proxy gives the same single origin with less machinery.

## Parked

- Community and enterprise editions (an `enterprise` Cargo feature, port overrides in the kernel, a license gate) — set aside by the owner on 2026-11-19. Revisit only when the owner raises it.
