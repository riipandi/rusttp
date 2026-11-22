# crates/

Framework libraries with no domain knowledge. Rules: `.agents/docs/backend.md`; decisions: `.agents/docs/architecture.md`.

- A crate depends on other crates only, never on a module or an app.
- Dependencies are declared once in `[workspace.dependencies]` with the full `"x.y.z"` and only the features used; each crate sets `[lints] workspace = true` (`backend.md`, "Rust code").
- Public items are documented (`missing_docs` is an error under clippy); the rest is `pub(crate)` (`unreachable_pub = "deny"`).
- A crate with tables exposes `migrations() -> MigrationSet` under a name that never changes and never references an application table (`backend.md`, "Data and migrations").
- `vixum` owns the SPA document; its contract is `backend.md` ("The SPA document (vixum)").
- Before claiming done: the `rust-verify-harden` skill.
