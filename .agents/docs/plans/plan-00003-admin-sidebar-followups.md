---
status: in-progress
created: 2026-11-21T21:10:48+07:00
updated: 2026-11-21T21:10:48+07:00
phases:
    - id: 1
      title: Run the uilibs a11y gate over the tooltip
      status: committed
      note: "7932717. `pnpm --filter uilibs test` green before the change (92 files, 433 tests) with the gate in `error` mode (`STORYBOOK_A11Y_GATE` unset, `.storybook/preview.tsx:6`), but no story left the tooltip open: Playground's `play` unhovers before axe runs, Sides and Disabled button never open. The new `Open` story (`defaultOpen`) passes; with an `<img>` without `alt` planted in its `TooltipContent` it failed on `image-alt`, so axe reaches the portalled popup. No violation found in the tooltip, so no fix landed. Format and lint clean."
    - id: 2
      title: Persist the sidebar collapse and keep the logo a link in the rail
      status: committed
      note: "See the phase 2 commit. `readCollapsed()` in the lazy initializer and `toggle()` writing `admin-sidebar`; `TooltipProvider` now wraps the header so the rail's `Expand sidebar` entry gets the zero-delay tooltip. The collapsed header is a column (`headerCollapsed`: `flexDirection: column`, `height: auto`), the rail logo a 40px `brandCollapsed` box named `Rusttp`. Chromium on the dev stack: collapse → reload stays collapsed (stored `collapsed`); logo `href=/admin` and clicking it lands on `/admin`; expand → reload stays expanded (stored `expanded`); `garbage` opens expanded; Tab order from the page top is `Rusttp`, `Expand sidebar`, `Overview`; the logo shows the browser's default focus outline (as the expanded brand link does). Typecheck, oxlint, oxfmt clean."
    - id: 3
      title: Pin the sidebar behavior with E2E
      status: committed
      note: "See the phase 3 commit. Four tests in `admin.spec.ts` (`admin sidebar`, skipped when `isMobile`); `admin.screen.ts` gains `collapseButton`, `expandButton`, `logo`, `storeCollapse` (an init script). Against the pre-phase-2 sidebar, three fail (reload collapsed, rail logo, expand and reload); the unknown-value test passes there too, since the old sidebar was always expanded: it guards a read like `!== 'expanded'`. Deviation: the existing `shows the sidebar` test failed on Chromium before this plan (title `Admin - Rusttp`, heading `Admin`, stale since `7e10476` renamed the page to Overview); fixed in this commit. Chromium full suite 26 passed. Firefox, Safari, Mobile Safari n/a: Playwright wants `firefox-1572` and `webkit-2388`, the cache has `firefox-1555` and `webkit-2370`."
    - id: 4
      title: Visual, contrast, and devtools-theme verification
      status: pending
      note: —
    - id: 5
      title: Docs sync (human-facing)
      status: pending
      note: —
    - id: 6
      title: LLM docs sync (.agents/docs)
      status: pending
      note: —
    - id: 7
      title: Final validation
      status: pending
      note: —
    - id: 8
      title: Ledger close and handover
      status: pending
      note: —
---

# Close handover 00005's open threads: the tooltip gate, measured contrast, the visual checks, and the admin sidebar's collapse and rail logo

## Objective

`handover-00005-webapp-nav-container-demo.md` closed as `partial`. Its gaps are: an unrun a11y gate after the tooltip change, contrast figures that were estimated rather than measured, layouts judged only from screenshots, a devtools theme never driven from the app's Theme menu, a sidebar collapse that resets on reload, and a collapsed logo that no longer links to `/admin`. After this plan, every one of those is verified and recorded, or fixed. The collapse survives a reload, and in the rail the logo is a link while a separate entry expands the sidebar. The plan does not touch notifications: the fixed `unread = 3` and the bells without an indicator wait for a notification source (out of scope below).

## Current state (verified in the tree, 2026-11-21)

- **The tooltip** — the last change is `631ae84` (`fix(uilibs): give the tooltip the shared overlay surface and an outlined arrow`), touching `packages/uilibs/src/base/tooltip/{tooltip.component.tsx,tooltip.stylex.ts,tooltip.stories.tsx}`. Handover 00005 records that `pnpm --filter uilibs test` (vitest with `@storybook/addon-vitest` and `@storybook/addon-a11y` 10.6.7, `packages/uilibs/package.json:18`) was not run after it. Playwright browsers on this machine: `chromium-1255`, `firefox-1555`, `webkit-2370` (`~/Library/Caches/ms-playwright`).
- **The collapse** — `packages/webapp/app/routes/admin/-sidebar.tsx:99` `const [collapsed, setCollapsed] = React.useState(false)`; nothing reads or writes storage. The webapp is client-rendered (`PRODUCT.md`, "Capabilities and Constraints"), so a lazy `useState` initializer runs before the first paint.
- **The rail logo** — collapsed, the header renders one `Button` labelled `Expand sidebar` whose content swaps the `Logo` for `PanelLeftOpen` on hover (`-sidebar.tsx:110-127`, styles `swap`, `swapLogo`, `swapIcon` and `stylex.defaultMarker()` on the header, in `app/styles/element/sidebar.stylex.ts`). Expanded, the header is a `Link to='/admin'` with the logo and `Rusttp`, plus a `Collapse sidebar` button (`-sidebar.tsx:128-146`). So collapsed, nothing links to `/admin` except the `Overview` nav entry.
- **Storage precedent** — the theme persists through `uilibs/theme` (`localStorage` by default, `packages/uilibs/src/theme/theme.tsx:30`); the devtools theme writes `localStorage.tanstack_devtools_settings` (`app/routes/-devtools.tsx:29-31`). No other webapp state persists.
- **Unread placeholder** — `-sidebar.tsx:62` `const unread = 3`; the bells in `(app)/-header.tsx:88-96` and `admin/-topbar.tsx:34-37` carry `Placeholder: nothing opens until notifications have a source.`
- **E2E** — `packages/e2e/screens/admin/admin.spec.ts` has one test (title, heading, `Overview` is `aria-current="page"`); `admin.screen.ts` exposes `open()`, `heading()`, `sidebar()` (the `Admin` navigation). Four projects: Chromium, Firefox, Mobile Safari, Safari (`playwright.config.ts:26-30`); `E2E_BASE_URL` targets a running server, otherwise the config builds the SPA and runs `cargo run -p rusttp-server -- serve`.
- **Docs** — `docs/` (`index.md`, `commandline.md`, `deployment.md`) does not describe the admin UI (searched `admin|sidebar|dashboard`: only the CLI's `setup-admin` and `reset-password`). `.agents/docs/shape.md:16` describes the webapp layouts; `rules.md` has `UI library`, `Webapp forms`, and `Sample data` contracts and a `Traps` section (`rules.md:77,94,105,122`), none about the admin sidebar.

## Decisions

- **D1 (2026-11-21, owner): scope is handover 00005's verification threads plus the sidebar collapse and rail logo.** Gaps the verification finds are fixed in the phase that finds them. The cost: notifications stay placeholders. Rejected: verification only — leaves two known UX gaps with no owner. Rejected: adding a shared notification source and popover — builds sample code a backend source will replace.
- **D2 (2026-11-21, owner): no backward compatibility, no legacy code.** The hover-swap button and its `swap*` styles are deleted, not kept behind a flag; a stored value from an older shape is not migrated.
- **D3 (2026-11-21, owner): the collapse persists in `localStorage`, read in the lazy `useState` initializer.** Key `admin-sidebar`, values `collapsed` or `expanded`; any other value, a missing key, or a storage that throws reads as expanded, and a failed write is ignored (the toggle still works for the session). The cost: the state is per browser, not per account, and a server render could not see it. Rejected: a cookie read by `crates/vixum` — adds a server contract to fix a flash the client-rendered SPA does not have. Rejected: a hook in `packages/uilibs` — one consumer.
- **D4 (2026-11-21, owner): in the rail, the logo is a link to `/admin`, and expanding is its own entry.** The collapsed header stacks the logo `Link` (accessible name `Rusttp`) above a `ghost` `Expand sidebar` button with `PanelLeftOpen`, `aria-expanded={false}`, `aria-controls` on the nav, and a right-side tooltip like the other rail entries. The cost: the rail spends one row on the expand entry. Rejected: keeping the logo as the expand button (the current shape) — the brand behaves differently per mode and expanding hides behind hover.
- **D5 (2026-11-21): verification scripts live under `.amp/in/`, never in the repo.** Screenshots go to `.amp/in/artifacts/`. Contrast is computed from the rendered colors: each pair's computed `color` and resolved background are painted to a canvas, read back as sRGB, and run through the WCAG 2.2 relative-luminance formula, so OKLCH tokens are measured as displayed. The cost: the numbers hold for Chromium's color pipeline. Rejected: estimating from OKLCH lightness — what handover 00005 did.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| The storage key and its fallback | `rules.md`, a new `Webapp state` contract (or the nearest existing section) | `admin-sidebar` = `collapsed` \| `expanded`; anything else is expanded. |
| The rail's header shape | `shape.md:16`, the admin layout sentence | The logo links to `/admin` in both modes; the rail has an `Expand sidebar` entry. |
| The measured contrast | phase 4's note in this plan and the handover | Each pair, theme, ratio, and AA verdict. |
| The closed threads | `handover-00006` | Which threads of handover 00005 are closed and how. |

## Execution rules

- **Atomic commit per phase**, authorized by the owner on 2026-11-21 for the whole session of this plan; each phase names its message. A phase that changes nothing in the tree records its result in this file and rides the next commit.
- **Execution waits for the owner's explicit instruction**; the owner authorized phase 1 on 2026-11-21. After the last phase, the agent stops and recommends the closing commit message with its paths; it does not commit the closing state.
- **No backward compatibility or legacy code** (D2).
- **Backend policy (owner, 2026-11-21):** no `ALTER`; migrations are edited in place and the development database may be reset during this plan. Recorded for completeness: this plan touches no Rust, migration, or database (n/a).
- **Scope or design doubts are asked, not picked:** a numbered option list with one recommended and a free-input option (`AGENTS.md`, "Ambiguous decisions").
- **Per-phase validation runs before each phase's commit.**
- **E2E only where relevant:** phase 3 adds admin sidebar tests; the other phases record E2E n/a or rerun the suite.
- Stage explicit paths; no `git add -A`; no push.

## Phases

1. **Run the uilibs a11y gate over the tooltip** — run `pnpm --filter uilibs test` with Chromium. Any violation in `src/base/tooltip/` is fixed in the component or its stylex file, never by disabling the rule; violations elsewhere are listed in the note and asked about before fixing (D1 covers only the tooltip). The gate checks a story after its `play`, so a story must leave the tooltip open for the popup, its surface, and its arrow to be checked. Validation: the gate exits 0, with an open-tooltip story in its pass list, and that story fails when a violation is planted inside `TooltipContent`; `pnpm format:check` and `pnpm lint` clean if a file changed. _Commit: `test(uilibs): keep a tooltip open in a story so the a11y gate checks the popup` (plus `fix(uilibs): <the violation fixed>` when one is found)._
2. **Persist the sidebar collapse and keep the logo a link in the rail** — in `admin/-sidebar.tsx`, a lazy initializer reads `admin-sidebar` and the toggle writes it (D3); the collapsed header renders the logo `Link` and the `Expand sidebar` entry (D4); the hover swap and the `swap`, `swapLogo`, `swapIcon` styles and the header's `defaultMarker` go (D2). Styles come from tokens and follow `stylex-authoring.md` (the handover's shorthand-versus-longhand and `Separator` width traps apply). Validation: `pnpm --filter webapp typecheck`, `pnpm lint`, `pnpm format:check` clean; in Chromium against the dev stack, collapse → reload stays collapsed, the rail logo navigates to `/admin`, `Expand sidebar` expands and the reload stays expanded, keyboard Tab reaches the logo and the entry with a visible focus ring. Undo: `git revert` of this phase's commit (the stored key is harmless when unread). _Commit: `feat(webapp): persist the admin sidebar collapse and keep the logo a link in the rail`._
3. **Pin the sidebar behavior with E2E** — extend `admin.screen.ts` (collapse and expand controls, the rail logo) and `admin.spec.ts` with: the collapse survives a reload; collapsed, the logo is a link to `/admin`; `Expand sidebar` restores the labelled nav and that survives a reload; a garbage stored value opens expanded. Each test is checked to fail without phase 2's change, by a temporary local edit that drops the storage read or the rail link, then restored. Desktop projects only for the rail: the sidebar is not rendered at the mobile width, so Mobile Safari skips these tests with a stated reason. Validation: `pnpm --filter e2e test` green on every installed project. _Commit: `test(e2e): cover the admin sidebar collapse and the rail logo`._
4. **Visual, contrast, and devtools-theme verification** — Playwright Chromium scripts in `.amp/in/` against the dev stack (`127.0.0.1:3000`): screenshots, light and dark, of the customer drawer, the admin drawer, the expanded sidebar, the rail with a tooltip open, and both account menus; each is inspected. Contrast (D5) for: nav item text idle and current, group labels, the notification entry and its unread dot against the sidebar, tooltip text on its surface, the tooltip arrow outline against the page, and the focus ring. Text needs 4.5:1 (3:1 at ≥ 24px or ≥ 18.66px bold); non-text 3:1. Devtools: open with Shift+D, switch the app's Theme menu light → dark → system, and confirm the devtools panel follows each time. Defects found are fixed here, from tokens, and rerun. Validation: every pair meets AA with its ratio in this phase's note; screenshots inspected; the devtools panel follows all three switches. _Commit (only when a fix lands): `fix(webapp): <the contrast or layout defect fixed>` (or `fix(uilibs)` when the token or component lives there)._
5. **Docs sync (human-facing)** — `docs/` describes no admin UI today; check again against the landed diff and record n/a, or add the sentence a reader needs. Validation: `rg -n -i 'sidebar|collaps' docs/` agrees with the decision recorded in the note. _Commit (only when `docs/` changes): `docs: <the change>`._
6. **LLM docs sync (`.agents/docs`)** — `shape.md:16` for the rail's header and the persisted collapse; `rules.md` for the `admin-sidebar` storage contract (D3) and any trap phases 1–4 surface; `ui-components.md` only when a `uilibs` component changed; `index.md` lists this plan. Validation: each claim diff-checked against the landed code; `rumdl check .agents/docs` clean. _Commit: `docs: record the admin sidebar collapse and rail logo`._
7. **Final validation** — the matrix below over the tree as it stands. Validation: the matrix green end to end, or each red row explained and asked about. _Commit: none if green; the note rides phase 8._
8. **Ledger close and handover** — this plan's statuses and notes filled; the plan archived to `.agents/docs/archive/` with its index row; `handover-00006` written, naming which threads of handover 00005 closed and which stay open (notifications); handover 00005's status left as written (handovers are snapshots). Validation: `index.md` agrees with the tree; no dangling reference (`rg -n 'plan-00003' .agents/docs`). _Commit: none — the agent recommends `docs: close plan 00003 and hand over` with its paths._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| UI library a11y | `pnpm --filter uilibs test` (Chromium) | Exit 0; tooltip stories pass |
| Typecheck | `pnpm --filter webapp typecheck` | 0 errors |
| Lint and format | `pnpm lint`, `pnpm format:check` | Clean |
| Markdown | `rumdl check .agents/docs docs` | Clean |
| Build | `pnpm --filter webapp build` | Succeeds |
| E2E | `pnpm --filter e2e test` on every installed project | All pass; Mobile Safari's sidebar tests skipped with the stated reason |
| Visual | phase 4 screenshots, light and dark, inspected | No clipping, overflow, or misalignment |
| Contrast | phase 4 canvas measurement (D5) | Every pair at AA, ratios recorded |
| Devtools theme | Theme menu light → dark → system with the panel open | The panel follows each switch |
| Rust gates | `just verify` | n/a for the change (no Rust touched); run once in phase 7 to confirm the tree is green |
| API specs | `just test-api` | n/a: no endpoint changes |

## Explicitly out of scope

- **Notifications** — the fixed `unread = 3`, an indicator on the header and topbar bells, and a notifications popover wait for a notification source (handover 00005, item #5 and #6); D1.
- **Storybook F-26 (data grid coverage)** — deferred by audit 00001; not a handover 00005 thread.
- **Persisting the collapse per account** — needs auth and a settings endpoint; reopen when the users module lands.
- **The container demo's development credentials** — a `security-review` concern for the auth or Pocket ID work, not this plan.
