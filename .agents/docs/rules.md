# Rules — detailed instructions and contracts

updated: 2026-11-20T06:05:00+07:00

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
- Transport (`apps/server/src/transport/`): Connect on `/rpc`, REST on `/api`, the SPA on every other path; no other top-level prefix without the owner. Errors under `/api` are `application/problem+json` (`http::problem`), including the unmatched-route and wrong-method fallbacks; errors under `/rpc` are Connect error JSON (connectrpc renders them; the panic handler mirrors `{"code":"internal"}`). Everywhere else an error never answers JSON: a navigation gets the SPA document with the status the page resolver in `transport/spa.rs` sets (200 by default), a missing asset a bare 404, a panic `apps/server/stub/error.html`. Each of the three trees has its own `CatchPanicLayer`.
- The SPA document is the server's (`crates/vixum`); the webapp has no `index.html`. The shell is `apps/server/stub/head.html` (head markup every page shares: charset, viewport, icons, theme colour, the loader's CSS) and `apps/server/stub/body.html` (the loader inside `#root`); each page's head (title, description, Open Graph, canonical, robots, JSON-LD) and status come from the resolver in `transport/spa.rs`; the entry's tags come from Vite's build manifest (`frontend/.vite/manifest.json`, the chunk with `isEntry`), or in dev from `transformIndexHtml` through the `vixum` Vite plugin. Page values are HTML-escaped; the shell fragments and `Page::head` are trusted markup and never carry request data.
- A navigation TanStack Router has no route for answers 404 with the SPA document (the client still renders its not-found page). The route table is built from the route tree itself: `packages/plugins/src/vixum.ts` loads `app/routes.gen.ts` through Vite's SSR graph, builds a router over it, and lists `router.routesByPath` with each route's `staticData.pageTitle` and `pageDescription` (the nearest up the parent chain, as `__root.tsx` picks the title); the build writes it to `frontend/routes.json` (`[{"path", "title"?, "description"?}]`), dev answers it at `/__vixum/routes.json` per navigation. vixum matches static segments case-insensitively, `$param`, `{$param}` and `{-$param}` with an optional static prefix and suffix, and a trailing `$` splat; static segments win, then affixed params. A match carries the percent-decoded params (`Route::param`, the splat as `_splat`) and the title and description. `null` (no table) answers 200 everywhere.
- The page title has one source: a route's `staticData.pageTitle`. `__root.tsx` renders it in the browser and `transport/spa.rs` writes it for crawlers, both as `<pageTitle> - Rusttp`; keep the two templates identical. A title that depends on data comes from the resolver (load by `route.param(...)`).
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

### UI library

`packages/uilibs` is source-sharing: consumers import `uilibs/<path>` and compile the sources with their own Vite, so nothing in it is prebuilt. The inventory is `ui-components.md`; the style rules are `stylex-authoring.md`.

- A component is `<name>/{<name>.component.tsx, <name>.stylex.ts, <name>.stories.tsx, index.ts}` under `src/base` (Base UI wrappers) or `src/extra` (compositions); `index.ts` re-exports the component and its styles.
- Style values come from `src/styles/` (`colors`, `tokens`, `popup`, `utils`); a literal color, size, or duration in a component is a defect. Dark mode is the `data-theme` attribute plus the variable overrides in `styles/themes.ts`, never a per-component media query.
- A component merges the caller's `style` (StyleX styles) last in `stylex.props(...)`; no `className`, no raw `style` object beside a `stylex.props` spread.
- Inside the package use `#/*` (→ `src/*`) or a relative path; across packages use `uilibs/<path>`. `src/*` must stay importable without the Storybook config.
- Every component carries a story; sample data in stories follows "Sample data" below. Docs pages (MDX) are wrapped by `.storybook/docs-container.tsx`, which follows the toolbar theme.
- A wrapper is typed with `React.ComponentProps<…>` so `ref` is accepted as a prop; `ComponentPropsWithoutRef` and `forwardRef` are not used.
- A form control takes `size` (`ControlSize`: `sm`, `md`, `lg`) and composes `controlSizes[size]` after `controlBase.root` (text entry; `controlBase.within` for a wrapper that holds the real input) or `controlPress.root` (press target) from `styles/control.stylex.ts`, then its own style, then the caller's `style`. A control that is a Field control renders through Base UI's `Field.Control` (or is a Base UI control), so `aria-invalid`, `data-invalid`, and the label and description wiring come from the Field. Text controls fill their container (`width: 100%`); a fixed width comes from `style`.
- Control edges use `borderControl`; `borderNeutralFaded` is for dividers and cards. A text pair clears 4.5:1 and a control edge 3:1 in both themes.
- A string a component renders or names (a close button, a stepper, an ellipsis, a slot) is a `labels` prop (or a prop of its own) with an English default; there is no locale context.
- Alert, Badge, and Toast color through `tone`, not a `destructive` variant. An icon-only control or an empty table header carries `visuallyHidden` text or an `aria-label`. A glyph is an `@keyline-icons/react` component; a `base` component does not import from `extra`, except Button's `Spinner`.
- The a11y gate: `pnpm --filter uilibs test` runs axe on every story and fails on a violation, in light and dark. axe runs after a story's `play`, so a popup is only checked by a story that leaves it open (the tooltip's `Open` story, `defaultOpen`). A new story passes it; the only allowlisted element is Base UI's focus guard (`[data-base-ui-focus-guard]`, `.storybook/preview.tsx`). `STORYBOOK_A11Y_GATE=todo` (or `off`) relaxes it for a local run only.
- `.oxlintrc.json` switches off the React-compiler and several a11y rules for `packages/uilibs/**` (the ported data grid, kanban, and chart stories trip them); new code there should still satisfy them.

### Webapp forms

Forms in `packages/webapp` use Formisch (`@formisch/react`) with Valibot; the decision record is `architecture.md` ("Webapp forms are Formisch and Valibot"). The auth pages are the reference.

- The Valibot schema in `app/schemas/<domain>.schema.ts` is the only place a rule lives: types, messages, and cross-field checks (`v.forward(v.partialCheck(…), ['confirm'])`). A field component and a route never validate; the Base UI `Field` `validate` prop and `validationMode` stay unused.
- Naming in `app/schemas/`: one file per domain (`auth`, `identity`, `loans`, `notifications`), never one per form. A Valibot schema is `<name>Schema`; the type a form sends is `<Name>Request` and the type of a body read from the API is `<Name>Response`, both `v.InferOutput` of the schema, so a type is never written by hand beside a schema it duplicates. A rule used by several forms is exported from the file that owns the domain (`auth.schema.ts`: `emailSchema`, `newPasswordSchema`, `captchaSchema`, `tokenSchema`). A route does not declare its own types file.
- A route builds the form with `useForm({ schema, initialInput })` (validate on submit, revalidate on input, Formisch's defaults) and submits with `handleSubmit(form, onValid)` on a `uilibs` `<Form noValidate>`: `onSubmit={(event) => { event.preventDefault(); void submit() }}`, because the one-argument overload returns a function without an event parameter.
- A field component in `app/components/form-fields.tsx` takes the Formisch field store (`field: FieldLike<T>`: `input`, `errors`, `onChange`, `props`) beside its own props, and wraps the control in the `uilibs` `Field` with `invalid={field.errors !== null}`. It shows `field.errors[0]` only, through `FieldError errors`. `input` is `T | undefined`, so a control reads `field.input ?? ''` or `?? false`.
- A native input spreads `field.props` (`name`, `ref`, `autoFocus`, `onFocus`, `onChange`, `onBlur`). A composite control passes them by hand: Checkbox `inputRef={field.props.ref}`, `checked`, `onCheckedChange={field.onChange}`; the OTP field `value`, `onValueChange={field.onChange}`, and `field.props.ref` on its first slot. `CodeField` accepts digits only unless given `characters='alphanumeric'` (Base UI's `validationType`, which drops other characters as they are typed); `uppercase` capitalizes letters through Base UI's `normalizeValue`; `focusFirst` autofocuses the first slot (the one justified `jsx-a11y/no-autofocus` exception, opt-in for pages whose only task is the code: two-factor and device). The device code uses all three, and the schema still decides what is valid.
- A link that must carry a token (`/reset-password?token=`, `/device?token=`) validates it with `validateSearch` and a Valibot search schema; without it the route's `errorComponent` renders an invalid-link page, and the token travels in the form's submitted values.
- `field.props.name` is the JSON of the path (`["password"]`), not an identifier: never use it as an `id` or `htmlFor` (use `React.useId()`), and a test finds a field by its label, not by `#id`.
- Base UI's `Form` also moves focus to the first invalid control on a failed submit, so the E2E focus tests pass without a registered ref; the refs are kept because Formisch's own `focus()` and `shouldFocus` need them.

### Webapp state

Shared UI state lives in TanStack Store (`@tanstack/store`, `@tanstack/react-store`; both in the `catalog:`), one `libraries/<name>.store.ts` per concern: `sidebar.store.ts` (the collapse), `commandbar.store.ts` (open and panel), `notifications.store.ts` (the list and the unread count). State that one component owns (a popover's `open`, a field's caps-lock flag, the mobile drawer) stays in `useState`; a store is for state that two or more distant components read or write, or that persists.

- The core is framework-agnostic: a `*.store.ts` imports from `@tanstack/store` only, never React. State is immutable (`setState` returns a new object, and the same reference when nothing changed, so nothing notifies); writes are actions declared with `createStore(initial, ({ setState, get }) => ({ … }))` as arrow properties (a method shorthand trips `unbound-method` when it is passed as a callback), and a component calls `store.actions.x` without subscribing.
- A value computed from a store is a derived store, `createStore(() => …)` (`sidebarCollapsed`, `unreadCount`); it tracks the stores it reads and notifies only when its own value changes.
- A component reads with `useSelector(store, selector)` from `@tanstack/react-store` and selects the smallest slice it renders (`useSelector(unreadCount, (count) => count > 0)`); it never subscribes to a whole store to read one field. A selector that returns a new object or array each call needs `{ compare: shallow }`. Writes to more than one store go inside `batch()` (`resetAdminUi` in `routes/admin/route.tsx`), so subscribers see one consistent state.
- A module-level store outlives the route that uses it: the layout that owns it resets what only lasts for a visit when it unmounts (`reset()`).
- Persisted preferences use `localStorage`, read once when the store is created: the SPA renders on the client only, so the stored value is there before the first paint and no cookie or server contract is needed.
- One key per preference, named for what it holds (`theme` from `uilibs/theme`, `admin-sidebar` from `libraries/sidebar.store.ts`). `admin-sidebar` is `collapsed` or `expanded`; any other value, a missing key, or a storage that throws reads as expanded. Under `/admin/settings` the sidebar shows as the rail whatever is stored (the admin layout feeds the route into the store with `useFoldSidebarOnSettings`), and a toggle there lasts for that visit only: neither writes the key, so leaving settings restores the stored state.
- A read or write that throws (storage disabled, quota) is caught: the preference falls back to its default and a toggle still works for the session.
- No stored shape is migrated (the project keeps no backward compatibility): a value the code no longer knows reads as the default.
- An E2E test seeds a preference with `page.addInitScript` before the app reads it (`admin.screen.ts` `storeCollapse`), never by reloading after `localStorage.setItem`.
- Notifications come from `notificationsStore` and `unreadCount` (`libraries/notifications.store.ts`) only: a component never holds its own list or unread count, so every bell agrees. Today it is an in-memory store seeded from `fixtures/notifications.ts` (a reload restores it); when an endpoint lands, swap the store's source and keep the actions (`setRead`, `markAllRead`, `dismiss`, `dismissAll`) and `unreadCount`.

### Keyboard shortcuts

The webapp uses `@tanstack/react-hotkeys` (beta: read the docs of the version in `pnpm-workspace.yaml` before changing a call). The admin's shortcuts are the pattern.

- Declare a shortcut in `libraries/hotkeys.ts` with `defineAppHotkeys`, with `meta: { name, group }`, and register it where the work happens with `useHotkey(useAppHotkeys()['id'], callback)`; never write a key string at a call site, so the cheat sheet, the hints, and a user's rebinding all see it. Ids are a stable contract: saved custom hotkeys key on them, so rename one only when losing the saved binding is fine. The `Register` augmentation in that file types the ids.
- Bind with `Mod` (Command on macOS, Control on Windows and Linux), never `Meta` or `Control` directly. A physical `[Code]` binding (`Mod+[KeyW]`) only where the key's position is the point, such as movement; letters that mean a command (`Mod+K`) follow the character. A sequence is an array (`['G', 'O']`), and a single-key or sequence shortcut needs the rebinding screen so a user can turn it off.
- An overlay (dialog, palette, menu) is wrapped in `<HotkeysProvider scope='<name>' exclusive>` and mounted only while open, so the page's hotkeys are suspended while it is; its own hotkeys go in a child of that provider, and a shortcut that opens it is registered there too (it is suspended with the rest), so it closes the overlay as well.
- A label is `formatForDisplay` (through `components/shortcut.tsx`), never a string written by hand: it is `⌘ K` on macOS and `Ctrl K` elsewhere. A shortcut shown beside a control also sets `aria-keyshortcuts` (`ariaKeyShortcuts()`, `Meta+K` or `Control+K`, since `Mod` is not a key name) and hides the keycaps from assistive technology. `useHotkeyHint` dims a trigger's keycaps until the user holds the modifier.
- Rebinding uses `useCustomHotkeys` and `useHotkeyRecorder` with `maxSteps: Infinity`, `detectConflicts: true`, a `validate` that asks `findConflicts` (which also covers shortcuts on pages that have not rendered), and an `onReject` that maps each `reason` to the app's wording (the library sends no text). The provider's `onCustomHotkeysChange` saves the result.
- An E2E test waits for the layout before pressing a key (`AdminScreen.openReady()`): `goto` returns on `load` and the hotkeys register a moment later. It presses `ControlOrMeta+<key>`, which Playwright resolves like `Mod`, and checks the page behind an open overlay only after the overlay closes (the dialog hides it from the accessibility tree).

### Sample data

In `packages/webapp` the made-up values live in `app/fixtures/*.ts` (`profile`, `loans`, `notifications`), one file per kind: a component, route, or store imports the fixture and never writes a sample value inline, and a fixture's type is the `<Name>Response` of its schema file (`UserResponse` in `identity.schema.ts`, `LoanResponse` and `SummaryItemResponse` in `loans.schema.ts`, `NotificationResponse` in `notifications.schema.ts`), never a type declared beside the data or a route, so wiring a real source means replacing the fixture import (and deleting the file) while the types stay. Navigation items are structure and stay beside their layout. The rules below apply to the fixtures.

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
- **Add a UI component:** check `ui-components.md` for an existing one first; create `src/base/<name>/` (a Base UI part) or `src/extra/<name>/` with the four files above; add its row to the index in the same turn; run `just typecheck`, `just lint`, and `pnpm --filter uilibs test` (the stories run as Vitest browser tests; Chromium via `pnpm --filter e2e install-browsers`).

## Traps

- `-D warnings` turns the workspace's `missing_docs = "warn"` into an error under clippy: document public items instead of silencing the lint.
- `sqlx::migrate::Migrator`'s fields are `#[doc(hidden)]` and semver-exempt; use its methods only.
- `Migrator::dangerous_set_table_name` on an existing production database re-runs migrations; it is safe here only because a set's table name is fixed from its first run.
- Cargo resolves every optional dependency into `Cargo.lock` even when its feature is off; an optional dependency must always be resolvable.
- A bare `"x.y.z"` in `Cargo.toml` is a caret requirement (`^x.y.z`): `Cargo.lock` is what pins the build, and `cargo update` may move a dependency past the declared version; bump the declaration to match when it does.
- Feature unification hides a missing feature: a member that uses a feature another member enables still builds in the workspace. Check one crate alone with `cargo clippy -p <crate>` when its feature list changes.
- clap panics (in debug, and in the `debug_assert` test) on a subcommand flag that repeats a global flag's long name; `generate:keys` therefore writes to the global `--env-file` instead of declaring its own.
- `arg_required_else_help` prints the help to stderr and exits 2, so `just run` without arguments reports a failure.
- `apps/server/build.rs` seeds `apps/server/frontend` when the SPA is not built (a manifest whose entry is `stub/default.js`, which says so in the page, and a `null` route table), because `spa.rs` embeds both files and memory-serve panics on a missing directory; a release build embeds whatever the folder holds at compile time, so run `pnpm --filter webapp build` before `cargo build --release`. memory-serve's per-asset cargo warnings are silenced by `MEMORY_SERVE_QUIET` in `.cargo/config.toml`.
- Logging reads `LOG_LEVEL` (not `RUST_LOG`): a level or `EnvFilter` directives, `info` when unset or invalid (`apps/server/src/main.rs`). memory-serve's per-asset lines stay at `warn` unless a directive names `memory_serve`; module names print only when a directive enables `debug` or `trace`.
- `just dev` opens the server's port, not Vite's: the `rust-server` plugin starts the debug server with `VITE_DEV_SERVER`, and vixum then proxies everything but navigations and the HMR socket (which connects to `127.0.0.1:5173` directly) to Vite. A rebuild starts the new server beside the old one (debug builds bind with `SO_REUSEPORT`, `transport/server.rs`) and retires the old one with SIGINT once the new one logs `listening` (the plugin forces that target, `readyTarget`, to `info` over any `LOG_LEVEL`), so the port never goes dark; the watch covers `.rs`, `.toml`, `.sql`, and the `.html`/`.js` shell files the binary embeds, outside `apps/server/frontend` and `target`; a failed build or a failed start leaves the old server running.
- A navigation (the document) is a `GET`/`HEAD` that asks for HTML or whose last segment has no extension, in dev and production alike; paths under `/@` and `/__` (Vite's modules, the dev endpoints) never are. A path with a dot requested without `Accept: text/html` (`curl /report.pdf`) is an asset. `/.vite/*` and `/routes.json` are build metadata the server reads at compile time and answers 404.
- `/assets/*` answers `cache-control: immutable` (Vite content-hashes everything there, `spa.rs`); other public files keep memory-serve's revalidating default.
- `deploy/Dockerfile` is multi-stage: `base` (Rust, plus Node.js and pnpm installed through Vite+ at the versions its `ARG`s pin, which follow `packageManager`, and tini), `builder` (a frozen pnpm install, the SPA build, then the stripped release build that embeds it), `pruner` (the binary in `/srv` and the `/srv/storage` data directories), and the runner, `gcr.io/distroless/cc-debian13:nonroot` with tini as PID 1: no shell, no package manager, uid `nonroot`. `.dockerignore` keeps the host's `node_modules` and `apps/server/frontend` out so the image never embeds a stale build. There is no `HEALTHCHECK` until `rusttp-server health` lands (the image has no curl); `just docker-shell` builds the `debug-nonroot` variant, which adds busybox at `/busybox/sh`.
- On a platform without `SO_REUSEPORT` (Windows) the new dev server cannot bind beside the old one; the plugin then stops the old one first and restarts, accepting a short gap.
- `vite build` never builds Rust; `just build` runs the SPA build before `cargo build --release` because the release binary embeds `apps/server/frontend` at compile time.
- An axum `nest` with its own fallback owns every path under its prefix; that is what keeps `/api/*` and `/rpc/*` misses away from the SPA fallback, so a nested router never drops its fallback.
- `cargo test --workspace` unifies features across members, so it never proves a module can be unplugged; only `cargo hack --each-feature` does.
- Base UI's `OTPField.Input` ignores `aria-label` on the first slot and names it from the root's label; `OTPField` turns a root `aria-label` into a hidden label for that reason. The Toast close button is `aria-hidden` until the stack is focused, so a test finds it by attribute, not by role.
- `packages/webapp` builds with the React Compiler (`react({ compiler: true })` in `vite.config.ts`, backed by `oxc-transform-react`, which also compiles the `uilibs` sources the app imports). Formisch field components stop updating when compiled (validation messages never show, the captcha never toggles) and the compiler reports nothing, so `app/components/form-fields.tsx` opens with `'use no memo'`; a new component that renders a Formisch `field` needs the same directive, and only `e2e` `auth.spec.ts` catches a missing one. Rolldown warns `MODULE_LEVEL_DIRECTIVE` for that line because it drops module-level directives; the compiler has already read it, so `build.rolldownOptions.onwarn` in `vite.config.ts` silences that warning for `'use no memo'` only. `oxc-transform-react` stays inside `@vitejs/plugin-react`'s peer range (`<0.157.0` for 6.3.0); bump both together.
- Base UI's `Button` gives a non-native render `role="button"`: render links through `LinkButton`, not `Button render={<a />}`.
- Storybook's canvas overlay (`.storybook/decorator.tsx`) sits inside the story root, so a story query for a role must scope to its own element (`within(...)`) or it finds the overlay's direction button.
