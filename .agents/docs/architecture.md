# Architecture

updated: 2026-11-26T00:44:56+07:00

The architecture and the reasoning behind it. The layout lives in `shape.md`; the binding rules derived from these decisions live in `rules.md`, `backend.md`, and `frontend.md`; this file keeps the why, so a settled decision is not re-litigated.

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

Decision (2026-11-19, owner): one axum router in `apps/server/src/transport/` serves Connect RPC (`connectrpc`) on `/rpc/<package.Service>/<Method>`, REST on `/api` (versioned under `/api/v1`), and the SPA on every other path. The server owns the SPA document for SEO (2026-11-19, owner): `crates/vixum` renders the whole document: the app's shell (`apps/server/stub/head.html`, `body.html`), each page's head and status, and the entry's tags, which come from Vite's build manifest (the build's input is `app/main.tsx`; there is no `index.html`); `memory-serve` embeds `apps/server/frontend` (the gitignored `vite build` output) and serves the assets. A route table taken from TanStack Router's generated tree makes an unknown path answer 404 while the SPA still renders its not-found page. The browser opens the server's port in development as in production: a Vite plugin (`packages/plugins/src/rust-server.ts`) builds and runs the debug server, which runs each document through Vite's `transformIndexHtml` (the `vixum` plugin's `/__vixum/transform`, so the HMR client, the React preamble, and other plugins' tags stay Vite's) and proxies modules and assets to Vite, while the HMR socket connects to Vite directly; on a Rust change the plugin rebuilds first and starts the new server beside the old one (`SO_REUSEPORT`, debug builds only) before retiring it. Errors under `/api` and `/rpc` are JSON (`application/problem+json` for REST, the Connect error body for RPC); every other path answers the document (status from the page resolver) or a static HTML page.

Consequences:

- (positive) one origin in development and production, so session cookies stay first-party and no CORS is needed; one binary to deploy; Connect speaks JSON as well as protobuf, so a browser or `curl` can call it.
- (negative) a release build embeds whatever `apps/server/frontend` holds at compile time: build the SPA first, or the binary ships the stub page `build.rs` writes; connectrpc is pre-1.0, so a minor bump may change its API.

Alternatives considered:

- `axum-connect` — rejected: thinner protocol coverage and less active than `connectrpc`, which passes the Connect conformance suite.
- Connect at the root (`/<package.Service>/<Method>`) — rejected: it shares the namespace with SPA routes and needs a proxy entry per package.
- Porting vite-rs — rejected: it serves `index.html` as built (one head for every page; templating is out of its scope, its README says), and it runs Vite as a child of the Rust process, so every Rust restart restarts Vite. Its dev proxy is the one part kept, in vixum.
- Keeping Vite's `index.html` and writing the page head into it — replaced (2026-11-19, owner): the document's static parts belonged to the frontend package while the server owned the rest; the shell now lives with the server, and dev keeps Vite's tags through `transformIndexHtml` instead of hand-written HMR and preamble tags.
- Vite in front with a proxy to the server — rejected: two ports between dev and production, and the head stays static.
- `rust-embed` — rejected: cache headers, precompression, and the SPA fallback would be hand-written; `tower-http` `ServeDir` — rejected: the binary would need `dist/` beside it at runtime.
- watchexec restarting `cargo run` (with `systemfd`/`listenfd` holding the socket) — rejected: the server is down for the whole compile and stays down when the build fails; the plugin keeps the old server answering in both cases, with one process to run.
- vite-rs (Vite managed from Rust) — rejected after research: the Vite-first proxy gives the same single origin with less machinery.

### The UI library composes through one control scale, shared recipes, and a failing a11y gate

Context: `audit-00001-uilibs` found controls that did not compose (a `large` Button above a 36 px Input), wrappers that rejected `ref`, controls that were not Field controls, token-level contrast failures, and 81 stories with real axe violations that a `todo` gate never failed.

Decision (2026-11-20, `plan-00001-uilibs-improvement`):

- One `ControlSize` scale, `small` 32 / `medium` 36 / `large` 40, default `medium`, on Button, every text control, Toggle, ToggleGroup, Tabs, and Menubar; `xsmall` 28 exists only on Button, Toggle, and Tabs (`DenseControlSize`). The recipes are StyleX in `styles/control.stylex.ts`: `controlSizes`, `controlBase` (text entry, with `within` for wrappers that hold the real input), and `controlPress` (press targets). Components compose them before their own style, as `popupFx` is composed.
- Two focus languages by kind: text entry takes the primary border and a 2px inset outline, press targets a 2px outside ring (an inset ring clips a short label, an outside ring collides with a field's neighbours). Disabled is one recipe, the disabled color tokens and the not-allowed cursor (plan-00011 Q15 replaced `opacity: 0.5`, which stacked).
- `borderControl`, a token at 3:1 or more on the page, on `backgroundNeutral` (including its hover surface), and on elevation surfaces in both themes (light L 0.58, dark L 0.64 since plan 00005), is the edge of text controls, Checkbox, Radio, and the off Switch; dividers and cards keep `borderNeutralFaded`. Contrast is measured with browser-style sRGB blending.
- Wrappers are typed `React.ComponentProps<…>` (React 19 `ref` as a prop); no `forwardRef`. Built-in strings are per-component `labels` props with English defaults; no locale context.
- Alert, Badge, and Toast take `color` (`neutral | primary | positive | warning | critical`); `destructive` variants became `color='critical'`. Alert has no role unless `announce` opts into `role='status'` (plan-00011 Q29).
- Color and fill are separate props (plan-00008 D7, 2026-11-22): `tone` was renamed `color` (Reshaped's word for the role) and `variant` became the fill only, `solid | faded | outline | ghost` on Button and Badge (`primary` is `solid` with `color='primary'`, `secondary` is `faded` with `color='neutral'`). Defaults keep today's look: a bare Button or Badge is the solid primary one. Button became a full fill × color matrix (`primary | neutral | critical`, then `positive | warning` too, D10), which added looks (solid neutral, faded primary, faded critical, outline primary, ghost primary, and the two new colors) built from existing color tokens. The first draft folded `tone` into one `variant` axis and was rejected because it dropped critical `outline` and `ghost` and the colored faded and outlined Badge. Reshaped's neutral default and its size names (`small | medium | large | xlarge`) were not adopted.
- The Reshaped props the library adopted (plan-00008 D10 to D15, 2026-11-22), each default reproducing the look it had before: Button `rounded`, `fullWidth`, `icon`, `endIcon`, `raised`; Badge `size`, `rounded` (default `true`, the reverse of Reshaped's, since a Badge was already a pill), `icon`, `onDismiss` with `labels.dismiss`; text-entry `variant` `outline | faded | ghost | headless` (default `outline`, so the 3:1 `borderControl` edge rule applies to `outline` only); Checkbox, Radio, Switch `size`; Tabs `pills | bordered | borderless` (the old `default` and `line`) and Toggle `ghost | outline | solid` with `selectedColor`; Avatar `color`, `variant`, `squared`; Progress, Meter, Spinner `color` and `size`; Tooltip `color` `neutral | inverted`; Separator `color` and `inset`; Breadcrumb `color`; Card `selected` and `raised`; Popover `elevation`; Item `variant` `ghost | outline | faded`; Icon `color` `neutral-faded`. Not adopted: Reshaped's neutral default and size names, `pills-raised`, `selectedVariant`, Tooltip `dark`, `media` and `inherit` Button colors. Kept because they name a shape or a content kind, not a fill or role: `ItemMedia` and `EmptyMedia` `variant`, the Resizable handle `variant`, `FieldLegend` `variant`, Kanban's overlay `variant`, Card and AlertDialog `size`, the data grid's `tableLayout` flags.
- Stories are grouped by prop axis and the canvas is fluid (plan-00008 D1, D2, D5, D6, D9): one story per axis drawn with `Axis`, one `States` story per component, `Sizes` replacing the per-component `ControlSizes` (the cross-component contract story stays), and no per-file `minWidth`, so a 390 px layout is visible. Rejected: one story per value, one matrix story crossing every prop, per-file decorators.
- Links take `render` (`<a href>` or a router `<Link to>`), so the library does not depend on the router: `Link` (`extra/link`) is the text link and `Button render={<a />}` is the link that looks like a button, both through `useRender` so the rendered anchor keeps its `link` role (plan-00011 D3 and Q38; `LinkButton` is removed and its role override with it). A loading Button is disabled but focusable and reports `aria-busy`.
- Glyphs are `@keyline-icons/react` components used directly (`size`, `strokeWidth`); the `Icon` wrapper stays in `extra`, so `base` parts do not import it. `ContextMenu` items are the DropdownMenu's: Base UI 1.9 exports the same Menu parts under both names.
- The a11y gate fails by default (`.storybook/preview.tsx`); `STORYBOOK_A11Y_GATE=todo|off` relaxes it locally. The one allowlist entry is Base UI's focus guard (`[data-base-ui-focus-guard]`).

Consequences:

- (positive) one place changes every control's height, focus, invalid, and disabled behavior; a mixed row is correct by construction and the composition story asserts equal heights; every story passes axe in light and dark; no dependency was added.
- (negative) the defaults grew where the scale moved them (Toggle `medium` 32 to 36, Menubar 32 to 36, OTP slot 32 to 36, the `large` text controls take 16 px type); there is no backward compatibility, so a renamed prop was renamed in the webapp too; Base UI behavior the library works around (OTP's first-slot label, the Toast close button's `aria-hidden`, no accordion arrow keys) is pinned by stories, not by types.

Alternatives considered:

- Drop Button `xsmall` and `large` instead of scaling the controls — rejected: breaks toolbars and the webapp's `large` buttons.
- `xsmall` on every control — rejected: a 28 px text field is a cramped target.
- A `--control-height` variable or a `<Control>` wrapper component — rejected: the first hides the size from the type system, the second cannot wrap Base UI parts that each render their own element.
- Raising `borderNeutral` globally — rejected: heavier cards, tables, and separators everywhere.
- `forwardRef` wrappers — rejected: deprecated in React 19 and a second code path.
- A locale context — rejected: one English consumer, and it breaks the one-folder-per-component anatomy.
- Positive and warning Button variants — rejected: nothing in the repo needs them.
- Committing the axe sweep script — rejected: it needs `axe-core` as a declared dependency.

### Webapp forms are Formisch and Valibot

Context: the webapp's forms ran on TanStack Form with zod through a `createFormHook` layer (`useAppForm`, a context module, `messageOf`, a `submitWith` wrapper, and a `querySelector` focus hack). None of it made Base UI's `Field` fit better, since neither library has a Base UI adapter, and the owner wanted a form library with a tighter fit.

Decision (2026-11-20, owner, `plan-00002-webapp-forms-formisch`):

- Formisch with Valibot replaces both. The schema is the single source of the form's types, rules, and shape; `field.errors` arrives as strings and `handleSubmit` validates and focuses.
- The forms keep the `uilibs` `Form` and `Field`; field components take the Formisch field store and are rendered by Formisch's `Field` (`frontend.md`, "Webapp forms").
- zod and TanStack Form are removed outright, with no compatibility layer. zod remains in the lockfile only as a build-time dependency of `@tanstack/router-generator`; it does not reach the shipped SPA.

Consequences:

- (positive) the glue modules and the issue-to-string mapping are gone; cross-field rules need no wiring; Formisch reads signals per property, so a field re-renders alone.
- (negative) the form layer depends on Valibot alone (no Standard Schema choice) and on a library that reached v1 on 2026-08-20 with one core maintainer; composite controls (Checkbox, OTP) are wired by hand; Formisch has no `canSubmit` flag, no debounce option, and no `createFormHook` equivalent (the field components fill that role).

Alternatives considered:

- TanStack Form with Valibot — rejected: keeps every piece of glue and gains nothing toward Base UI.
- Base UI `Form` alone with `safeParse` in `onFormSubmit` — rejected: submitted values are untyped and every rule runs by hand.
- Formisch's own `Form` component — rejected: a plain `<form>` with no StyleX `style` and no Base UI Form context.

### Webapp i18n is Paraglide, in localStorage, with no locale in the URL

Context: every string in `packages/webapp` was English and written in the component. The app is a client-rendered SPA behind a Rust server, the account menus already persist preferences in `localStorage`, and the owner wanted two languages (English, Indonesian) without a locale in the paths.

Decision (2026-11-21, owner):

- Paraglide JS v3 (`@inlang/paraglide-js`, with `@inlang/plugin-message-format`), compiled to typed `m.*` functions in `app/paraglide/`; catalogs are `app/locales/{locale}.json`, one flat file per locale, with semantic area-prefixed keys.
- Strategy `localStorage` then `preferredLanguage` then `baseLocale`; no `url` strategy, so no routes are localized and the server's document stays English.
- A change re-renders through TanStack Store: `libraries/locale.store.ts` holds the locale and `setLocale(locale, { reload: false })` only persists. Amended 2026-11-22 (owner): the first design keyed the `<Outlet>` on the locale (a remount). It now re-renders in place: `libraries/messages.ts` `useMessages()` subscribes to the store and returns one object per locale, `getMessages()` serves `staticData`, and `libraries/format.ts` `useFormat()` does the same for `Intl`.
- Page titles are functions (`staticData.pageTitle: m.page_…`); `plugins/vixum` calls them once, in English, for the server's `<title>`.
- `uilibs` imports no i18n: the webapp feeds its `labels` props (`ThemeSwitcher` gained one, English by default). Account menus carry a "Language" submenu beside Theme; the landing and auth pages have a preferences menu (theme and language) instead of the theme button.

Consequences:

- (positive) typed keys and parameters, unused messages tree-shaken, one catalog edit adds a language, and (since the 2026-11-22 amendment) a language change keeps typed input, an open popover, and focus.
- (negative) every component that shows a message calls `useMessages()`, and a message is passed as a function of it, never read at module load; the server renders no localized HTML or titles (SEO and first paint are English); every locale file must carry every key; an error already in a form is written again by validating it (`useRevalidateOnLocale`).

Alternatives considered:

- Paraglide's default `setLocale()` (full reload) — rejected by the owner for the flash and lost state.
- Routes with a locale prefix or TanStack Router `rewrite` — rejected by the owner: the language is a per-browser setting.
- A `useLocale()` hook in every consumer, with nothing to enforce it — rejected: easy to miss, and a memoized component would keep its old text. Reopened 2026-11-22 (owner), because the remount lost typed input and moved focus to `body`: it now stands as `useMessages()`, which returns a different object for each language (so the React Compiler re-renders the caller) and is enforced by an oxlint `no-restricted-imports` rule that bans `#/paraglide/messages` outside `libraries/messages.ts` and `schemas/`, so a missed consumer is a lint error, not a stale label.
- Keeping the remount and moving focus to `main` with a live-region announcement — rejected 2026-11-22 (owner): typed input is still lost.
- Random human-readable keys (Paraglide's recommendation) — rejected for readable review; semantic keys are stable once used.
- Namespaced catalog files per area — rejected: the editor integration writes the merge into every file.

### Webapp accessibility is held by an axe sweep, not by component stories

Context (2026-11-22): the UI audit found defects every existing gate passed: a six-slot code wider than a 390px column, a table a keyboard could not scroll, controls whose name left out their visible text, a 404 with no `h1`. Storybook's axe gate checks one component in isolation; the E2E suite checks flows. Neither looks at a whole page at a phone width.

Decision (2026-11-22, owner): `packages/e2e/screens/a11y/a11y.spec.ts` visits every route at 390px and 1440px, light and dark, runs axe, and asserts the page is no wider than its window. It injects `axe-core` through `utils/axe.ts` (a catalog entry and an e2e devDependency, already locked as a transitive package); it runs on Chromium only, about 30 seconds for 124 runs.

Consequences:

- (positive) the class of defect is caught where it appears, and a new route joins `allRoutes` to be covered. With the audited OTP column and 404 title put back, the sweep failed on `/two-factor`, `/device`, and the 404 page.
- (negative) a longer E2E run, and axe's rules decide: a control's name must contain its visible text (the sidebar search trigger carries its shortcut in the name); the sweep says nothing about screen-reader speech or forced colors.

Alternatives considered:

- `@axe-core/playwright` — rejected: a second dependency for one script injection and one call.
- A test per defect only — rejected: it would pin the three audited bugs and miss the next one of the same kind.
- Extending the Storybook gate to full pages — rejected: stories render components, and the defects live in the composition of layout and components.

### The webapp's entry load has a budget, and the admin layout mounts one chrome

Context (2026-11-22): plan 00004 left `issue-00003-ui-audit-leftovers`: the entry chunk grew from 303 to 363 KB and the cause was blamed on `useMessages`. Building the commits in between and summing the entry with its static imports showed 422 KB, then 457 KB (`useMessages`, about 35 KB), then 547 KB: the larger step (89 KB, 31 KB gzip) was `TooltipProvider` moved to the root, which pulled Base UI's tooltip into every page. The same audit parked a double-mounted admin chrome, two contrast gaps, and a 2.4k-line data grid.

Decision (2026-11-22, owner, `plan-00005-ui-leftovers-remediation`):

- The entry load is budgeted: `pnpm --filter webapp size` fails over 480 KB raw or 152 KB gzip (the measured 458 KB / 146 KB plus about 5%). `TooltipProvider` moves into the admin and customer layouts.
- The admin layout renders the sidebar or the top bar by `useCompact()`, not both with a CSS hide. This reverses plan 00004 D12 (both stayed mounted for a clean tab order and two cheap subscriptions).
- Chart series take the `foreground*` tokens and `borderControl` changes value (light L 0.58, dark L 0.64). This lifts plan 00004 D1 (tokens frozen) for those two cases; no token was added.
- The data grid splits by responsibility, code moved unchanged: the cell controller into ops, editor, and controller; the table into head, body, and utils, with one-way dependencies and an identical public surface. This reverses plan 00004 D11 (structure kept, F-26 deferred).
- A lazy per-language message catalog was built and measured, then dropped: Paraglide's `locale-modules` output still imports every language from its index, so the split had to live in `libraries/messages.ts` (an async language change, a top-level await in `main.tsx`); one language is 19.2 KB raw and 6.0 KB gzip, the entry went from 458.1 KB / 145.9 KB gzip to 442.8 KB / 146.6 KB, and the build gained chunks.

Consequences:

- (positive) a size regression fails a command instead of waiting for someone to look; the landing and auth pages no longer load Base UI's tooltip; one bell and one account menu are live per viewport; control edges and chart series pass 3:1 on neutral surfaces; no data-grid source file passes about 1250 lines.
- (negative) a route outside the two layouts that shows a tooltip adds its own provider or gets Base UI's 600 ms delay; crossing 767px closes an open popover; control edges look stronger on the page (4.28 and 5.77 against 3.36 and 3.84); `git blame` on the grid goes through the move commits.

Alternatives considered:

- A lazy per-locale catalog — built and rejected on the numbers above; the route-group partition (a key partition by area, shared keys loaded twice, a loader per route) would save more but costs the most, and is reopened only if messages breach the budget.
- Keeping the root provider and lazy-loading Base UI inside it — rejected: the provider is the import.
- A size-limit dependency — rejected: 50 lines of Node read the manifest.
- Keeping both chromes mounted — rejected: two live subscriptions are the reason the item existed; a shared popover host would add a layer for a swap this small.
- New `chart*` tokens, labeling the weak series only, or lifting `backgroundNeutral` — rejected: more surface for the same effect, the status quo, and a change to every neutral surface.
- Splitting `DataGridCellSelection` into hooks — rejected: a behavior refactor with no defect behind it.

### The webapp's unit tests run in a real browser, with one Vitest version

Context (2026-11-22): `packages/webapp` had no unit test runner (`issue-00003` item 5); a store change (the same array when nothing changes) had been checked with a scratch script and deleted. `uilibs` already ran Vitest 5 in Chromium with its versions written inline.

Decision (2026-11-22, owner, `plan-00006-webapp-unit-tests`):

- Vitest 5 in browser mode on Chromium, with `vitest-browser-react`, `@vitest/ui`, and `@vitest/coverage-v8`; every Vitest package is a workspace catalog entry and `uilibs` moves onto it.
- Tests sit beside their source; coverage is v8 with no threshold; `just test-web*` recipes exist and `just verify` is unchanged.
- The webapp has its own `vitest.config.ts` with Paraglide and the React Compiler on, not `vite.config.ts`.

Consequences:

- (positive) the stores, hooks, and schemas run against a real `localStorage`, `matchMedia`, and DOM; a hook test sees the compiled memoization, which is where the language-change trap lives.
- (negative) a run starts Chromium (a second or two); browser mode cannot reset modules, so tests reset singletons by hand; the webapp tests are one more command outside `verify`.

Alternatives considered:

- jsdom or happy-dom with `@testing-library/react` — rejected: an imitation DOM and two more dependencies outside the `uilibs` pattern.
- The `node` environment only — rejected: the locale store and the hooks touch `window`.
- `@vitest/coverage-istanbul` — rejected: it instruments code and fights the React Compiler and StyleX pipeline.
- A coverage threshold now — rejected: the figure would be arbitrary before a baseline exists.
- Vitest versions inline in the packages that use them — rejected: two sources of one version.

### The UI library takes the safe Reshaped props, and each component has a props page

Context (2026-11-23): after `plan-00008` the props followed Reshaped's `color` and `variant` model, but props Reshaped has were still missing. The owner had them curated against Base UI and asked for a props reference beside each component.

Decision (`plan-00009-uilibs-reshaped-props-docs`):

- D1: every prop judged safe is implemented, 29 in all; a prop is safe when it changes only the look (a StyleX style, an attribute Base UI already emits, an `aria-hidden` glyph) and touches none of Base UI's state, focus, keyboard handling, ARIA roles, portal, or positioning. The rest are left out: Button `loadingAriaLabel`, Badge `hidden` and `Badge.Container`, Switch `reversed`, Separator `contentPosition` and `blank`, `startSlot`/`endSlot`/`prefix`/`suffix` on Input and Select, menu item `selected` and `highlighted`, and the responsive `{ s, m, l }` values.
- D2: `padding` and `bleed` take Reshaped's number, counted in `unit` steps (`UnitStep`, `0` to `20`). A map of static styles on the `unit` tokens (Popover `padding`) or, for a value known only at run time or given as a CSS length, one dynamic style fed by `unitLength` (Skeleton, Table cells, Alert `bleed`). No token was added.
- D3: `media` (Button) and `dark` (Tooltip) read the constants `colors.white` and `colors.black` and `color-mix`, so they look the same in both themes. Axe checks them on a black backdrop.
- D4: a visual-only prop emits no new data attribute. `highlighted` holds the hover fill through StyleX and sets no `data-highlighted`, which Base UI menu items own.
- D5: every default renders as before, proven per phase by a computed-style comparison of the touched components before and after (96, 86, 174, and 72 elements; the only difference was a Skeleton animation frame).
- D6: value sets Reshaped does not fix: Toggle `selectedColor` adds `positive` and `warning` (not `media` or `inherit`, a pressed state must stay distinguishable); Toggle `selectedVariant` is `ghost | outline | solid`, unset follows `variant` with `outline` pressing to the `ghost` tint; Dialog `size` is `small | medium` (`large` needs a container token, left to the owner); `blurredOverlay` blurs by `unit.x1`; Button `inherit` has no cut-out `solid` (a tint instead).
- D7 and D8: each component folder has `<name>.mdx`, a docs page (import, anatomy, examples through `Canvas`, API reference with props, data attributes, and caveats; two-column tables, because the owner found wide tables hard to read), attached to the stories with `<Meta of={Stories} />`; a prop change updates it in the same commit. The shape is in `frontend.md` ("UI library"). The name is `<name>.mdx`: Storybook 10 cannot index `<name>.stories.mdx` (addon-docs excludes it, `preset.js:865`), found in Phase 5.
- Along the way the data grid's declared-but-unread props were settled (`issue-00004`): `DataGridContainer` `border` and `DataGridTableHeadRow` `rowId` (as `data-header-row-id`, because the cell logic reads `data-row-id`) were wired and covered by stories, and `sizesInfo`, `sizesLabel`, `sizesDescription`, `more`, and `pinnable` were removed.

Consequences:

- (positive) the look the owner asked for is one prop away, the Base UI behavior is untouched, and a reader finds a component's added props in Storybook without reading its source; the Storybook MCP addon serves the same pages to agents.
- (negative) 65 pages to keep in step with their components, by convention only (no script checks them); a Toggle pressed look is set through variables, which is harder to read than a flat map.

Alternatives considered:

- Implementing Reshaped's full prop set — rejected: it would break Base UI's state and ARIA model.
- Named steps (`small | medium | large`) or free pixel values for `padding` and `bleed` — rejected: the first is further from Reshaped, the second escapes the token scale.
- `<ArgTypes>`/`<Controls>` for the props page — rejected: react-docgen lists every inherited Base UI and DOM prop and buries the ones this library adds.
- A usage section on each page — rejected: it repeats the stories.
- `<name>.docs.mdx` — rejected: it needs the same glob change and gains nothing over `<name>.mdx`.
- A new token for a media or dark surface — rejected: the constants already carry it.

### The Command input draws no focus ring

Context (2026-11-25): `audit-00002` F-11 found that the Command input shows no ring, only a comment in `command.stylex.ts` said why, and the audit asked for the decision to be recorded.

Decision (owner, `plan-00011-uilibs-audit-remediation` Q35): the input keeps no ring. The field holds focus the whole time its palette is open, it is the only field in it, and its caret is the focus indicator; a ring on a control that can never lose focus kept drawing the eye (WCAG 2.4.7 accepts a visible caret for a text field). The options inside the list are different: a highlighted option must show a 3:1 indicator, which is plan-00011 phase 10 (X-01).

Consequences:

- (positive) the palette stays quiet; the decision is findable in one place, and a reader of the stylesheet is not tempted to add a ring.
- (negative) `contracts/focus-visible.stories.tsx` cannot assert a ring on this input; the story asserts that it has focus, not how it looks.

Alternatives considered:

- A 2px ring like the other text controls — rejected: it is on from the moment the palette opens, so it never marks a change.

### Names, roles, and targets: interactive means one Tab stop, one name, one 24 px target

Context (2026-11-25): `audit-00002` found a chart that took a Tab stop and showed no ring, a scroll wrapper that was always a region, drag handles every item shared one name for, and controls under 24 px.

Decision (owner, `plan-00011-uilibs-audit-remediation` Q31 to Q34, wave 3):

- Q31: a chart is a Tab stop only when it is interactive (it has a `tooltip`) and then draws the focus ring on its host; a static chart takes none.
- Q32: `ChartContainer` takes `description` (the svg `<desc>`), and the docs page recommends the same rows in a `Table` with a `TableCaption` as the data alternative.
- Q33: the Kanban board is a `role='region'` named by `labels.board` with no tab stop of its own; Sortable and Kanban handle names are functions of the item or column name (`labels.handle`, `labels.columnHandle`).
- Q34: the board's padding is kept.
- A control under 24 px reaches it through an `::after` hit area (`contracts/hit-area.ts`), not a larger box; a scroll wrapper is a focusable region only while it overflows.

Consequences:

- (positive) a keyboard user meets no stop without a ring or a name; the rules are asserted by plays, not only documented.
- (negative) `labels` shapes changed (no backward compatibility), and a caller that nests a chart in its own focus order must add the `tooltip` or a wrapper.

Alternatives considered:

- Always a Tab stop for charts, with the ring — rejected: a static chart has nothing to operate.
- Growing the stepper, tab, and dismiss boxes to 24 px — rejected: it changes the look of every dense row.

### The uilibs audit remediation: one vocabulary, a gate in CI, and the decisions behind it

Context (2026-11-24): the uilibs audit report (R-01 to R-39) found a gate that nothing ran, tokens that meant different things in different files, defects in keyboard highlight, focus, and form errors, and no docs for keyboard use. The owner asked for every recommendation, and `plan-00011-uilibs-audit-remediation` did it in 59 phases and 8 waves, answering a 69-question questionnaire (an unanswered question meant the recommendation applied, Q00).

Decision (D1 to D9 of the plan, with the answers that changed a recommendation):

- D1: every recommendation runs; a "No" answer drops the work it names. D2: no backward compatibility, so a replaced name (`breakpoints.small`, Button `icon-*` sizes, Popover `elevation` values, Pagination `isActive`, DataGrid `i18n`, `LinkButton`, unused color tokens) disappeared in the phase that replaced it, with its webapp callers.
- D3: `Link` is a `useRender` component, not a router wrapper, and Button takes `render` for a link that looks like a button (Q38 done differently: `LinkButton` removed). `Stack`, `Container`, `Hidden`, `Image`, `BadgeAnchor`, `ThemeScope`, and an animated `ThemeSwitcher` were added; `Carousel` and `StepDots` were the two optional "Yes" answers (Q51, Q52).
- D4 to D7: waves and tracks ran in one checkout on disjoint file sets, with the tokens and shared styles changing serially first; the catalog and agent docs synced at wave close; validation was scoped per phase and full per wave.
- D9 (owner): every size name is spelled out (`xsmall` to `xxlarge`), also the breakpoints and `Text`'s responsive keys.
- Owner answers that differ from the recommendation: breakpoint names stay `small`-family (Q08); `fontLetterSpacing` stays and the typography roles read it (Q16); the unused color tokens were removed after a Reshaped check (Q14); the branch stayed `ui-polish` (Q05); Q61, Q49 to Q50, and Q53 to Q59 stayed "No" (no large Dialog, no Breadcrumb collapse, no controlled Pagination, no headless layer or responsive control props, which would reverse plan-00009 D1).
- The gate: `just test-ui` (Chromium, light and dark, plus the `unit` project), the Firefox and WebKit nightly in `.github/workflows/uilibs.yml`, the 390 px overflow gate, and `just check-ui-docs`; the Menubar stories carry `skip-webkit` (F-12, upstream).

Consequences:

- (positive) a regression in the a11y, focus, contrast, overflow, or docs contract fails a run; one scale of tokens and shared types replaces per-file restatements; every component has a docs page with keyboard behavior proved by a play.
- (negative) the library has two documented places that restate the breakpoints (`text`, `stack`, `hidden` stylesheet mirrors, each with a unit test) because a StyleX media const resolves only from its own file; the webapp's `useCompact()` restates its own 767px; the data grid has an open audit (`audit-00003`).

Alternatives considered:

- One plan per priority (P0, P1, P2) — rejected: the owner asked for all of it, and the token work gates most of the rest.
- Worktrees or orbs for the parallel tracks — rejected by the owner (limited storage); tracks shared one tree with a commit protocol.
- TanStack `createLink` for `Link` — rejected: it ties the library to one router.
- Per-phase edits to the shared docs — rejected: concurrent edits to one file in one tree overwrite each other.
- Porting Reshaped's HSLuv code for the rebrand script — rejected: a small OKLCH script needs no dependency and no licence notice.

### The data grid is named, announced, and keyboard-operable

Context (2026-11-25): `audit-00003` found 15 problems in the data grid, two of them medium (a column could be resized only with a pointer, and an `onRowClick` row could be reached only with one), plus two open questions (row labels as functions of the row, and a table name prop). Plan 00012 fixed all 15 in 19 phases on `fix/data-grid-audit`: wave 1 (styles, unit tests, stories) and wave 2 (semantics, announcements, keyboard) in order, because wave 2 shares the labels and the docs page; the owner accepted every questionnaire recommendation.

Decision:

- D1: all 15 findings ran; F-14 closed as a false positive (the 2.5.8 spacing exception covers the 19 to 20 px story links). D2: no backward compatibility (`selectRow` and its five siblings became functions, `labels.dragToReorder` was replaced, the table name became required). D5: an unverified finding was reproduced by a failing play before its fix (F-06 and F-07 reproduced, F-09 reproduced).
- Q24 to Q26 (audit question 2): the table name is a prop (`aria-label` or `aria-labelledby`) on the part that renders the `<table>`, required by type, never a `labels` entry, because a name belongs to one grid and `labels` is one set of strings per language.
- Q27 and Q28 (audit question 1): rows are named by `getRowLabel` on `DataGrid`, with `labels.rowNumber(position)` as the fallback, so the control names are always functions. Column grips follow (Q29).
- Q22 B and Q23 A: clickable rows are one roving Tab stop (the grid pattern's row-focus form), and in a `cellSelection` grid Enter on a cell opens its row, so the same prop works from the keyboard in both modes.
- Q20 A and Q21 A: column resizing is a focusable separator (the window splitter pattern); deviation from Q21: the widening arrow follows the drag's own `columnResizeDirection` rule, not the document `dir`, since the grid never derives that option from `dir`.
- Q34 A: the decorative opacities stay (no new token); the sizes and blur moved to tokens. Q32 B: only the page buttons are the `nav`.
- The WAI-ARIA grid and window splitter pages could not be re-read (web access was out of credits), so phases 15 and 16 follow the patterns from memory and are proved by plays, not checked against the pages.

Consequences:

- (positive) a grid is no longer an anonymous table, ten rows are ten names, drags and loading are spoken, and both medium gaps have a keyboard path proved in three engines.
- (negative) every resizable column adds one Tab stop; a consumer must name each grid and may supply `getRowLabel`; the keyboard direction depends on the consumer setting `columnResizeDirection` in a right-to-left grid, as the drag already did.

Alternatives considered:

- Header-menu items for resizing (Q20 B) — rejected: the menu exists only on headers with controls, so some resizable columns would stay unreachable.
- A Tab stop on every clickable row (Q22 A) — rejected: a 25-row page would add 25 stops.
- A `labels.table` default (Q24 B) — rejected: it would give every grid the same name, which is the defect.
- A library-wide `opacity` token scale (Q34 B) — rejected for this plan: a design-token change needs the owner's decision and its own plan.
