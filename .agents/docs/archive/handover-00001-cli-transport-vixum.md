---
status: done
created: 2026-11-20T00:01:00+07:00
---

# Handover: CLI scaffold, transport, vixum SPA document, DX and Docker

The session ran from the CLI scaffold to a Rust-owned SPA document with a Vite-driven dev loop. Every piece of work is committed on branch `development`; the working tree was clean at capture. Nothing is pushed.

## Read first

- `AGENTS.md`, then `.agents/docs/shape.md`, `.agents/docs/rules.md`, `.agents/docs/architecture.md`. The decision record "Connect as the primary protocol, REST beside it, the SPA embedded" (architecture.md) and the Transport / SPA bullets and Traps in rules.md carry every contract this session settled.
- `crates/vixum/README.md` — the SPA document crate: request handling table, API, the Vite side, the route table format.
- `docs/commandline.md` — the CLI spec the `apps/server/src/cmd/` scaffold follows.

## What landed (commits, oldest first)

`git log --oneline 8d4779e^..a0e63db` lists them; the ones that matter:

| Commit | What |
| --- | --- |
| `8d4779e` | clap CLI scaffold in `apps/server/src/cmd/` (every command but `serve` returns `not_implemented`) |
| `31ba8ef`, `79a8b16` | dependency policy: full `x.y.z`, no `=`, only used features |
| `693baed` | transport: Connect (`connectrpc`) on `/rpc`, REST on `/api`, SPA elsewhere; JSON errors under `/api` and `/rpc` |
| `f672e4f` … `2bab497` | `crates/vixum`: Rust renders the whole document (shell in `apps/server/stub/`), entry tags from the Vite manifest, dev through `transformIndexHtml`, route table from TanStack's route tree with params, titles, and descriptions from `staticData`; 404 for unknown routes; one navigation rule for dev and prod |
| `b0b5d27`, `4d3ab5c` | `deploy/Dockerfile`: base (Rust + Node/pnpm via Vite+ + tini) → builder → pruner → distroless `cc-debian13:nonroot` |
| `23721cf` | logging reads `LOG_LEVEL` (not `RUST_LOG`); module names print only at debug/trace |
| `472c10c` | emails build before `just dev`/`just build`/the image; `[emails]`/`[rust]` step logs |
| `a0e63db` | `just cleanup [--all] [--dry-run]`; `generate-key` recipe removed |

Commits `8538719` and `b0b5d27` do not build on their own (a failed `git add` split the change; `7b77103` completes it). The owner was told; squashing needs `git reset --soft f672e4f`, which the harness denied.

## How dev and prod fit together

- One port (`:3000`) in both. `just dev` runs Vite (`packages/webapp`), whose `plugins/rust-server.ts` builds and runs the debug server with `VITE_DEV_SERVER`; the server proxies modules and assets to Vite on `127.0.0.1:5173`, the HMR socket goes to Vite directly. A Rust change rebuilds, starts the new server beside the old one (`SO_REUSEPORT`, debug only, `transport/server.rs`), and retires the old one; a failed build keeps the old one.
- `plugins/vixum.ts` serves `/__vixum/transform` and `/__vixum/routes.json` in dev and writes `routes.json` in the build. There is no `packages/webapp/index.html`.
- Release: `just build` = emails → SPA (`apps/server/frontend`, gitignored) → `cargo build --release` embedding it (memory-serve + `include_str!` of manifest and route table; `apps/server/build.rs` seeds a stub when the SPA is not built).

## Open threads

- **Page titles**: one source, route `staticData.pageTitle` / `pageDescription`; `__root.tsx` and `transport/spa.rs` must keep the same `<title> - Rusttp` template. Data-driven titles go in the resolver in `spa.rs` (`route.param(...)`).
- **Placeholders**: `health`, `generate:keys`, `config:*`, `migrate:*`, `db:*`, `setup-admin`, `reset-password` are unimplemented. The README tells users to run `just run generate:keys`, which fails until it lands. No `HEALTHCHECK` in the image until `health` lands.
- **OAuth/OIDC placement**: the owner's rule is JSON errors only under `/api` and `/rpc`; OAuth token/well-known endpoints were suggested under `/api/oauth/...`, not decided.
- **Connect**: `api/connect/common.proto` is empty, no codegen, no `@connectrpc/connect-web` client in the webapp yet (a new JS dependency needs approval).
- **Emails**: `apps/server/emails/*.html|.txt` are built but no Rust code reads them yet.
- **Not verified this session**: a full `docker build` of the final Dockerfile (earlier runs were cancelled or contended), `cargo hack --each-feature`, Windows behaviour of the rebuild fallback.
- The owner may have local `.env` values using `RUST_LOG`; they must rename it to `LOG_LEVEL` themselves (never rewrite `.env`).

## Working conventions the owner enforced

- Chat in Indonesian; files, code, commits in English. Sample data from Dan Brown and Harry Potter.
- Commit only when asked; stage explicit paths; never push. `rm` and `git reset` were denied by the harness — move files to `/tmp` instead.
- New dependencies need explicit approval; the owner approved `connectrpc`, `memory-serve`, `hyper-util`, `listenfd` (later removed), `serde_json`, `tower` (dev).
- Prefers cargo-style tidy output (`    Output 7.6M (…)`), quiet logs, and short `just` recipe docs.

## Suggested skills

- `rust-verify-harden` — before claiming any Rust change (server, vixum) done.
- `agent-docs` — for ledger work: the closing sweep, and filing the open threads above as issues in `.agents/docs/issues/` if they outlive the next session.
- `security-review` — before implementing `generate:keys`, `setup-admin`, `reset-password`, or the OAuth/OIDC endpoints.
- `clarity` — before rewriting `README.md` or `docs/`.
- `emil-design-eng` / `impeccable` — for any `packages/webapp` UI work.
