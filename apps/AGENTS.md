# apps/

The composition root (`apps/server`, `rusttp-server`): CLI, module registration, lifecycle, transport, migrations. Rules: `.agents/docs/backend.md`; decisions: `.agents/docs/architecture.md`.

- Modules are passed their dependencies here, explicitly; no DI container and no shared `AppState`. A module is an optional dependency behind a Cargo feature, registered under `#[cfg(feature = "...")]` only.
- Transport prefixes are fixed: Connect on `/rpc`, REST on `/api`, the SPA everywhere else; errors under `/api` are `application/problem+json`, never JSON elsewhere (`backend.md`, "Errors and transport").
- A CLI command lands in `docs/commandline.md` and `src/cmd/` together; an unfinished one returns `not_implemented` (`backend.md`, "CLI").
- An applied migration is never edited; migrations are additive and forward-only.
- The release binary embeds `apps/server/frontend`: build the SPA first, and rebuild the server after an SPA build before E2E (`rules.md`, "Build and dev loop").
- Before claiming done: the `rust-verify-harden` skill, and a probe against the running binary (`just test-api` when specs exist).
