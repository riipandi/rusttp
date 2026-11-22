# Shape

updated: 2026-11-22T15:16:00+07:00

The repository's shape: the layout, the toolchain, and the commands. Read once; return when a path or a command is needed.

## Layout

| Path | Role |
| --- | --- |
| `apps/<app>/` | Deployable binaries and the composition root; `apps/server` (`rusttp-server`) is the default member. Detail: `backend.md` ("Layout"). |
| `crates/<name>/` | Framework libraries, no domain knowledge. Detail: `backend.md`. |
| `modules/<name>/` | Domain modules, one crate each (planned; location in `issue-00001`). |
| `api/connect/`, `api/specs/<area>/` | Protobuf contracts; Hurl HTTP specs per area. |
| `packages/` | pnpm workspace: `webapp`, `uilibs`, `e2e`, `emails`, `plugins`. Detail: `frontend.md` ("Layout"). |
| `scripts/*.just` | Recipes imported by `justfile` (`task-development`, `task-quality`, `task-e2e`, `task-container`, `task-utilities`). |
| `container/` | Compose stacks (below). |
| `deploy/` | `Dockerfile` and deployment templates (`rules.md`, "Build and dev loop"). |
| `.agents/docs/`, `.agents/skills/` | Agent docs and project skills (`.claude/skills` links here). |
| `docs/` | Human docs. |

`container/compose.yaml` defines `nginx` (`nginx-proxy.conf`, the only published route: Silo S3 API :9100, console :9101, CDN :9180/:9143, TLS fronts for the host app :3443, the mock OAuth2 :3220, and the OpenID conformance suite :8443 through a variable upstream so nginx starts without it) and includes:

- `compose-dev.yaml`: pgsql, redis, Silo S3, mailpit. Silo's console signs in through the `silo` issuer at `https://mock-oauth2.localhost:3220` (an nginx alias shared by browser and container; Silo trusts the mkcert CA via `storage/config/rootCA.pem`).
- `compose-mock.yaml`: `mock-oauth2` (`mock-oauth2.json`, issuers `google`, `github`); `conformance-server` and `conformance-mongodb` under profile `conformance` (UI `https://localhost.emobix.co.uk:8443`).
- `compose-demo.yaml` (profile `demo`): `pocketbase` :9090, `pocket-id` on :1411.
- `compose-sre.yaml` (profile `sre`): ClickStack, cadvisor, redis-exporter; `container/clickstack/` holds collector config, provisioning, dashboards, searches, and alerts (emailed to Mailpit through a webhook).

Start a profile with `docker compose -f container/compose.yaml --profile <name> up -d`. Certificates: `just cert-generate` (into `storage/config`), `just cert-trust` (mkcert CA), `just cert-conformance` (the suite's PKCS12 truststore). The credentials are development-only (`rules.md`, "Secrets and development credentials").

## Toolchain

- Rust `1.100.0` (`rust-toolchain.toml:13`), edition 2024 (`Cargo.toml:14`), workspace resolver 2.
- Formatting: `rustfmt.toml` (edition 2024, `max_width = 120`). A Claude Code `PostToolUse` hook (`.claude/hooks/format.sh`) formats every edited file inside the repository: `.rs` with `rustfmt`, `.md` with `rumdl fmt` (default rules, no line wrapping), and `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/`.css` under `packages/` with the workspace-root `oxfmt`. Frontend style lives in `.oxfmtrc.json` (2 spaces, single quotes, no semicolons, sorted imports) and lint rules in `.oxlintrc.json` (type-aware through `tsrs-lint`, which oxlint picks up from the installed `tsrs`); both are installed at the pnpm workspace root. It needs `jq`; a missing formatter is skipped silently.
- Workspace lints (`Cargo.toml:17-20`): `missing_docs = "warn"`, `unreachable_pub = "deny"`, `private_interfaces = "deny"`. Each crate opts in with `[lints] workspace = true`.
- Build flags (`.cargo/config.toml`): `target-cpu=native`; `lld` on the musl and aarch64-gnu targets.
- Frontend: pnpm `12.21.0` (`package.json`).
- Developer tools: `just`, `cargo-nextest`, `rumdl`, `hurl`; optional: `cargo-hack` (feature combinations), `cargo-deny`, `sqlx-cli`. Check that a tool is installed before relying on it; do not install one unasked.

## Commands

Run every gate through `just` (`justfile` imports `scripts/task-*.just`; `just` alone lists the recipes).

| Gate                 | Recipe                              | Runs                                                                                                             |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Format               | `just format` / `just format-check` | `cargo fmt --all` + `rumdl fmt .` + `pnpm format` (oxfmt on `packages/`; `--check` for all three; config in `.rumdl.toml`, `.oxfmtrc.json`)                                  |
| Check                | `just check`                        | `cargo check --workspace --all-targets`                                                                          |
| Typecheck            | `just typecheck`                    | `pnpm -r typecheck`: `tsrs --noEmit --fast` in every `packages/*` (`webapp` generates the route tree first); not part of `verify` |
| Lint                 | `just lint`                         | `cargo clippy --workspace --all-targets -- -D warnings` + `pnpm lint` (oxlint on `packages/`)                                                          |
| Test                 | `just test`                         | `cargo nextest run --workspace` (falls back to `cargo test --workspace`); E2E has its own `e2e-*` group (below)                                         |
| All of the above     | `just verify`                       | format-check, check, lint, test                                                                                  |
| Webapp unit tests    | `just test-web [args]` / `just test-web-ui` / `just test-web-coverage` | `pnpm --filter webapp test`, `test:ui`, `test:coverage`: Vitest 5 in Chromium over `packages/webapp/app/**/*.test.{ts,tsx}`; the coverage report (text and html) goes to `packages/webapp/.output/coverage` with no threshold; needs Chromium (`pnpm --filter e2e install-browsers` once); not part of `verify` |
| Entry budget         | `just size`                         | `pnpm --filter webapp size`: the built SPA's entry load (entry chunk plus static imports) against 480 KB raw / 152 KB gzip; run `pnpm --filter webapp build` first; not part of `verify` |
| API specs            | `just test-api [url]`               | `hurl --test` over `api/specs/**/*.hurl`, `base_url` defaults to `http://127.0.0.1:3000`; needs a running server |
| Feature combinations | —                                   | `cargo hack check --each-feature -p rusttp-server`, only when `cargo-hack` is installed                          |

Other recipes: `dev` (builds the email templates, then `pnpm --filter webapp dev`: the server on `http://127.0.0.1:3000` with Vite HMR behind it; one Ctrl-C stops both), `run <command>` (any app CLI command, e.g. `just run serve --bind 0.0.0.0:3000`), `build` (the email templates into `apps/server/emails`, the SPA into `apps/server/frontend`, then the release binary that embeds it, then prints its size) and `start` (runs `serve` from the release build), `deps`, and the `compose-*` (up, down, restart, exec, cleanup) / `docker-*` (build, images, run, shell into a `debug-nonroot` build, push) container tasks (`container/compose.yaml`, `deploy/Dockerfile`). Utility: `cleanup [--all] [--dry-run]` (removes every regenerable artifact: `target`, `apps/server/frontend` and `emails`, the route tree, Vite and email caches, Playwright reports; `--all` adds `node_modules`; prints each path and the space freed). Email (group `email` in `scripts/task-development.just`, `packages/emails`): `email-dev` (preview on `:3030`), `email-build [--verbose]` (writes `apps/server/emails/`; prints one `[emails]` summary line, each template with `--verbose`, and every failure), `email-check <name> [args]` (client compatibility of `templates/<name>.tsx`, e.g. `--use-preview-props`). Storybook (group `storybook` in `scripts/task-development.just`, `packages/uilibs`): `storybook` (dev server on `:6006`), `storybook-build` (into `packages/uilibs/.output/storybook`), `storybook-start` (`vite preview` of that build on `:6006`). E2E (`scripts/task-e2e.just`, Playwright in `packages/e2e`): `e2e-test [args]` (headless, all projects; e.g. `--project Chromium`), `e2e-chrome` / `e2e-firefox` / `e2e-safari` / `e2e-mobile` (headed, one project), `e2e-ui`, `e2e-report`, `e2e-install` (browsers, once).
