# Rules

updated: 2026-11-22T15:16:00+07:00

The cross-area rules behind `AGENTS.md`. Area rules: `backend.md` (Rust: `apps/`, `crates/`, `modules/`, `api/`) and `frontend.md` (`packages/`). Reasoning: `architecture.md`. Read the section a change touches before touching it.

## Where a fact lives

| A change that lands… | updates |
| --- | --- |
| A contract or trap of one area | `backend.md` or `frontend.md` |
| A contract or trap across areas | this file |
| A decision and its rejected alternatives | `architecture.md` |
| A path, tool, or command | `shape.md` |
| A `uilibs` component added, removed, renamed | `packages/uilibs/.storybook/stories/components.mdx` (the catalog) and its own `<name>.mdx` |
| A shipped endpoint | `api/specs/<area>/*.hurl` (and `api/connect/*.proto` for RPC) and `docs/` |
| A user-visible behavior | `docs/` |
| A new or moved agent document | `index.md` |

## Dependencies

- A new dependency needs the owner's approval. Rust: declared once in `[workspace.dependencies]` (`backend.md`, "Rust code"). JavaScript: a version used by more than one package is a `catalog:` entry in `pnpm-workspace.yaml`.
- No backward compatibility (early-stage project): a replaced name, shape, or stored value is removed, not aliased or migrated.

## Sample data

Every made-up value (test fixtures, seed rows, email `previewProps`, stories, mock responses, placeholder copy and labels) names people, places, and things from Dan Brown's novels (Robert Langdon, Sophie Neveu, Leigh Teabing, Katherine Solomon, Vittoria Vetra, the Louvre, CERN) or Harry Potter (Hermione Granger, Harry Potter, Albus Dumbledore, Minerva McGonagall, Hogwarts, Gringotts, Diagon Alley). Never `John Doe`, `Jane`, `Alice`/`Bob`, `foo`/`bar`, `test@`, `dummy`, or lorem ipsum. New copy follows this in every language.

- Addresses and hosts keep reserved names: `<first>.<last>@example.com`, `smtp.example.com`, `*.test`; never a real domain (`hogwarts.edu`).
- IPs come from the documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32`).
- Codes and tokens may borrow spells (`EXPECTO-PATRONUM`, `SANGREAL`), never something resembling a real secret.
- In `packages/webapp`, sample values live in `app/fixtures/*.ts`, one file per kind (`profile`, `loans`, `notifications`). Components, routes, and stores import the fixture and never write a sample value inline. A fixture's type is the `<Name>Response` of its schema (`UserResponse`, `LoanResponse`, `SummaryItemResponse`, `NotificationResponse`), so a real source replaces the fixture import and the types stay. Navigation items are structure and stay beside their layout.

## Secrets and development credentials

- Never print a secret; never rewrite a `.env` file without consent.
- The credentials in `container/` and `.env.example` (`PB_SUPERUSER_PASSWORD`, `PB_ENCRYPTION_KEY`, `ENCRYPTION_KEY`, the Postgres and MinIO passwords) are development-only defaults, deliberately committed by the owner. They are configuration, not sample data, and keep neutral names. An audit does not report them, nothing moves them into a secret store, and nothing outside local dev reuses them.

## Build and dev loop

- The release binary embeds `apps/server/frontend` at compile time: `just build` runs the SPA build before `cargo build --release`; `vite build` never builds Rust.
- After `pnpm --filter webapp build`, rebuild the server (`cargo build -p rusttp-server`) before pointing E2E at it with `E2E_BASE_URL`: an older binary names asset hashes no longer on disk, and every spec times out.
- `just dev` opens the server's port (`:3000`), not Vite's: `plugins/rust-server` starts the debug server with `VITE_DEV_SERVER`, and vixum proxies everything but navigations and the HMR socket (which connects to `127.0.0.1:5173` directly) to Vite. A Rust change (`.rs`, `.toml`, `.sql`, the `stub/` shell) rebuilds, starts the new server beside the old one (debug builds bind with `SO_REUSEPORT`, `transport/server.rs`), and retires the old one with SIGINT once the new one logs `listening` (the plugin forces that target to `info`). A failed build or start leaves the old server running. Without `SO_REUSEPORT` (Windows) the plugin stops the old one first, accepting a short gap.
- `deploy/Dockerfile` stages: `base` (Rust, Node.js and pnpm through Vite+ at the `ARG` versions, tini), `builder` (frozen install, SPA build, stripped release build), `pruner` (`/srv` and `/srv/storage`), and the runner `gcr.io/distroless/cc-debian13:nonroot` with tini as PID 1 (no shell, uid `nonroot`). `.dockerignore` keeps host `node_modules` and `apps/server/frontend` out. No `HEALTHCHECK` until `rusttp-server health` lands; `just docker-shell` builds the `debug-nonroot` variant with busybox at `/busybox/sh`.
