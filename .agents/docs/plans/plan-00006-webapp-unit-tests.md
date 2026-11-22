---
status: awaiting-approval
created: 2026-11-22T14:20:00+07:00
updated: 2026-11-22T14:20:00+07:00
phases:
    - id: 1
      title: Vitest versions into the catalog, test dependencies for the webapp
      status: pending
      note: —
    - id: 2
      title: Webapp Vitest browser config, scripts, and the first test
      status: pending
      note: —
    - id: 3
      title: just recipes for the webapp tests
      status: pending
      note: —
    - id: 4
      title: Store tests (sidebar, locale)
      status: pending
      note: —
    - id: 5
      title: Format, messages, and auth schema tests
      status: pending
      note: —
    - id: 6
      title: Docs sync (docs/)
      status: pending
      note: —
    - id: 7
      title: Agent docs sync (.agents/docs and AGENTS.md)
      status: pending
      note: —
    - id: 8
      title: Ledger close and handover
      status: pending
      note: —
    - id: 9
      title: Final validation
      status: pending
      note: —
---

# Give the webapp a unit test runner — Vitest in browser mode with React, UI, and coverage, and tests for its pure logic

## Objective

`issue-00003-ui-audit-leftovers.md` item 5 parked the missing webapp unit test runner behind an owner-approved dependency; the owner approved it on 2026-11-22 (Vitest, Vitest React, Vitest UI, coverage). After this plan `packages/webapp` runs `pnpm --filter webapp test` (Vitest 5 in Chromium, the same path as `uilibs`), `test:ui` and `test:coverage` exist beside it, every Vitest version comes from the workspace catalog, and the stores, formatters, message hooks, and form schemas have kept tests that fail on a plausible regression. The plan does not test components or routes, does not put the webapp tests in `just verify`, and sets no coverage threshold.

## Current state (verified in the tree, 2026-11-22)

- **No runner in the webapp** — `packages/webapp/package.json` has `dev`, `generate`, `build`, `preview`, `size`, `typecheck` and no `test`; no `*.test.*` file exists under `packages/webapp/app` (`rg --files packages/webapp/app -g '*.test.*'` is empty). Plan 00004 phase 12 verified `libraries/notifications.store.ts` returning the same array when nothing changes with a scratch script, deleted.
- **`uilibs` runs Vitest 5 in browser mode, versions inline** — `packages/uilibs/package.json:57,65` write `"@vitest/browser-playwright": "^5.1.1"` and `"vitest": "^5.1.1"`; `vite.config.ts` has one `storybook` project with `browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] }`. `pnpm-workspace.yaml` has no `vitest*` or `@vitest/*` entry (only `@storybook/addon-vitest` and `playwright: ^1.65.1`). The workspace rule is one version per dependency in the catalog.
- **Latest versions** — `pnpm view`: `vitest`, `@vitest/ui`, `@vitest/coverage-v8`, `@vitest/browser-playwright` 5.1.1; `vitest-browser-react` 2.3.0, whose peers are `vitest ^4 || ^5`, `react ^18 || ^19`, `react-dom`, and the React types.
- **The webapp's `vite.config.ts` cannot be reused** — it starts the Rust server (`rustServer`), the document renderer (`vixum`), the TanStack router and devtools plugins, and writes to `apps/server/frontend` on build; a test run needs none of them. It also carries `react({ compiler: true })`, which compiles components with the React Compiler (the trap in `rules.md`: memoization on the object `useMessages()` returns).
- **Candidates for the first tests exist and are pure or small** — `libraries/notifications.store.ts` (actions return the same array when nothing changes; `unreadCount`), `libraries/sidebar.store.ts` (`localStorage` key `admin-sidebar`, `rail` and `visit`, `reset`, `toggle`), `libraries/locale.store.ts` (`set` persists, a shown language is a no-op, rewrites `<html lang dir>`), `libraries/format.ts` (`formatDate`, `formatRelative` with hour and day thresholds, `formatNumber`, hook `useFormat`), `libraries/messages.ts` (`useMessages`, `getMessages`, one object per language), `schemas/auth.schema.ts` (Valibot rules, messages read when a rule fails).
- **Task runner** — `scripts/task-quality.just` `test` runs only Rust (`cargo nextest`), `verify` is `format-check check lint test`; `uilibs` tests are run by hand (`pnpm --filter uilibs test`).
- **Chromium is installed** locally (`~/Library/Caches/ms-playwright` holds `chromium-1248` and headless shells); a clean machine runs `pnpm --filter e2e install-browsers` once.
- **Output directory** — `.gitignore` ignores `.output`, where the webapp's and `uilibs`' reports already go.

## Decisions

- **D1 (2026-11-22, owner): tests run in Vitest browser mode on Chromium (`@vitest/browser-playwright`, `vitest-browser-react`).** Same path as `uilibs`, a real DOM, `localStorage`, and `matchMedia`, so the stores and hooks run as in production. The cost: a Chromium start (a few seconds) for every run, and Chromium must be installed. Rejected: jsdom or happy-dom with `@testing-library/react` (an imitation DOM, and two dependencies outside the `uilibs` pattern); the `node` environment only (hooks and the locale store, which touch `window`, would stay untested).
- **D2 (2026-11-22, owner): every Vitest dependency is a catalog entry, and `uilibs` moves onto it.** `vitest`, `@vitest/browser-playwright`, `@vitest/ui`, `@vitest/coverage-v8`, `vitest-browser-react` join `pnpm-workspace.yaml`; `uilibs` replaces its two inline versions with `catalog:`; `playwright` (already in the catalog) becomes a webapp devDependency because the browser provider peers on it. The cost: `uilibs` changes by two lines and the lockfile moves. Rejected: catalog only for the new packages (two sources of the Vitest version).
- **D3 (2026-11-22, owner): coverage is `@vitest/coverage-v8`, reported as text and HTML under `packages/webapp/.output/coverage`, with no threshold.** The number is chosen once there is a baseline from real tests; a threshold set now gates nothing meaningful. The report covers `app/**/*.{ts,tsx}` and excludes `app/paraglide`, `app/routes.gen.ts`, the test files, and `app/fixtures`. Rejected: a threshold from the start (an arbitrary figure); `@vitest/coverage-istanbul` (instruments code and fights the React Compiler and StyleX pipeline).
- **D4 (2026-11-22, owner): test files sit beside their source, `app/libraries/notifications.store.test.ts`.** Tests are never imported, so Vite's build and the router's file scan (`app/routes` holds no test) ignore them; they are type-checked and linted with the app. Rejected: a `tests/` mirror (longer paths, forgotten on a move).
- **D5 (2026-11-22, owner): `just test-web`, `just test-web-ui`, and `just test-web-coverage` exist; `just test` and `just verify` do not change.** `verify` stays free of a browser, as `uilibs` is. The cost: the webapp tests are one more command to remember, so `shape.md` and the final validation list them. Rejected: putting them into `verify` (it would need Chromium); package scripts only.
- **D6 (2026-11-22, owner): the first tests cover `notifications.store`, `sidebar.store`, `locale.store`, `format`, `messages`, and the auth schema.** Pure logic with a defined behavior. Components and routes stay with Storybook (`uilibs`) and E2E; `libraries/viewport.ts` is a one-line hook over `useMediaQuery` and is not tested.
- **D7 (2026-11-22): the webapp gets its own `vitest.config.ts`, with the React Compiler on.** It carries `paraglideVitePlugin` (so the generated messages exist without a `generate` step), `react({ compiler: true })` (so a hook test sees the memoization the app ships with), `resolve.tsconfigPaths`, and the browser project; no `vixum`, `rustServer`, router, devtools, or StyleX plugin, since no initial test imports a StyleX module. The cost: a second config to keep in step with `vite.config.ts` for the plugins they share. Rejected: reusing `vite.config.ts` (it starts the Rust server); mocking the compiler away (a test would pass where the app fails).
- **D8 (2026-11-22): a kept test must fail on a plausible regression, and each phase proves it.** For every file the phase breaks the code under test in a scratch edit (the identity check in `notifications.store`, the hour boundary in `formatRelative`, the unknown-value branch in `sidebar.store`, the per-language object in `messages`), sees the test fail, and restores the code. The scratch edits are not committed.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| The webapp test commands and the runner | `shape.md` (commands table, the webapp sentence) | `test-web`, `test-web-ui`, `test-web-coverage`, and the Chromium prerequisite |
| How a webapp test is written | `rules.md`, new "Webapp tests" | Beside the source, browser mode, the compiler on, isolate module singletons, what is out of scope, the coverage report and no threshold |
| Why browser mode and one catalog version | `architecture.md` | D1 and D2 with the rejected alternatives |
| The closed finding | `issue-00003` item 5 resolved, the file archived | Dated, with this plan |
| The map | `index.md` | The plan row, then the archive and handover rows |

## Execution rules

- **Atomic commit per phase** is authorized; each phase names its suggested message; the owner's per-phase go-ahead and the standing grant of 2026-11-22 cover that phase's commit and nothing else.
- **Execution waits for the owner's explicit "continue with phase N".** After the last phase the agent stops and recommends the closing commit message with its paths; it does not commit the closing state on its own.
- **No backward compatibility and no legacy code**: the project is early stage.
- **Dependencies:** the owner approved Vitest, `vitest-browser-react`, `@vitest/ui`, and `@vitest/coverage-v8` on 2026-11-22; each is declared once in the catalog with its caret range as the workspace does; nothing else is added. The install needs the network.
- **Per-phase validation runs before each phase's commit.** E2E is relevant only if a phase touches the app; none does, so it is recorded n/a.
- **Test hygiene:** a test asserts observable results through the module's public interface, derives its expected values independently of the code, uses asymmetric inputs and both sides of a boundary, and resets module singletons between cases (`vi.resetModules()` with a dynamic import for a store read at import time; `localStorage.clear()`).
- **Do not run Storybook and a Vitest run at the same time** (handover 00008: a shared StyleX plugin reported a false error).

## Phases

1. **Vitest versions into the catalog** — add `vitest`, `@vitest/browser-playwright`, `@vitest/ui`, `@vitest/coverage-v8`, and `vitest-browser-react` to `pnpm-workspace.yaml` (the versions of "Current state"); `uilibs` uses `catalog:` for `vitest` and `@vitest/browser-playwright`; the webapp gains the five and `playwright` as devDependencies; `pnpm install` updates the lockfile. Validation: `pnpm install --frozen-lockfile` passes afterwards; `git diff --stat -- '**/package.json' pnpm-lock.yaml pnpm-workspace.yaml` shows only these files; `pnpm --filter uilibs test` is 92 files, 444 tests. E2E: n/a. _Commit: `chore: move the Vitest versions into the catalog and add the webapp test dependencies`._
2. **Webapp Vitest config, scripts, and the first test** — `packages/webapp/vitest.config.ts` (D7, D3, browser project with `headless: true`, `include: ['app/**/*.test.{ts,tsx}']`, coverage settings); scripts `test` (`vitest run`), `test:ui` (`vitest --ui`), `test:coverage` (`vitest run --coverage`); `app/libraries/notifications.store.test.ts` (each action, the same array returned when nothing changes, `unreadCount` after each action). Validation: `pnpm --filter webapp test` passes; the scratch edit of D8 (return a new array on a no-op) turns it red; `pnpm --filter webapp test:coverage` writes `.output/coverage/index.html` and prints a text table; `pnpm --filter webapp test:ui` starts the UI (checked with a request to its port, then stopped); `pnpm lint`, `format:check`, `pnpm --filter webapp typecheck` clean; `pnpm --filter webapp build && pnpm --filter webapp size` unchanged (458.1 KB / 145.9 KB gzip). E2E: n/a. _Commit: `test(webapp): add the Vitest browser runner with UI and coverage`._
3. **just recipes** — `test-web *args`, `test-web-ui`, `test-web-coverage` in `scripts/task-quality.just` (group `quality`), `verify` untouched. Validation: `just --list` shows the three; `just test-web` and `just test-web-coverage` run; `git diff` shows `verify` unchanged. E2E: n/a. _Commit: `chore: add just recipes for the webapp tests`._
4. **Store tests** — `sidebar.store.test.ts` (default expanded; `collapsed` stored reads collapsed; an unknown value and a throwing `localStorage` read expanded; `setCollapsed` writes; on a rail page a toggle lasts the visit and is never written; `setRail` starts a new visit; `reset` keeps the stored choice and drops the visit; `sidebarCollapsed`), `locale.store.test.ts` (`set` persists to `localStorage` `locale` and updates `<html lang dir>`; setting the shown language is a no-op that leaves the state object alone). Validation: the D8 scratch edits (the unknown-value branch, the visit reset) turn them red; the suite and coverage pass; lint, format, typecheck clean. E2E: n/a. _Commit: `test(webapp): cover the sidebar and locale stores`._
5. **Format, messages, and auth schema tests** — `format.test.ts` (`formatRelative` at 59 and 60 minutes, 23 and 24 hours, one day ago reading `yesterday`, the future side, English and Indonesian wording; `formatNumber` grouping; `formatDate` with a fixed midday UTC timestamp; `useFormat` follows a locale change), `messages.test.tsx` with `vitest-browser-react` (`useMessages` renders in the language shown and again, in place, after `localeStore.actions.set`; the two languages return different objects; `getMessages` follows the store), `auth.schema.test.ts` (email trimmed, empty and malformed; password 11 and 12 characters; the reset password mismatch error lands on `confirm`; the two-factor code accepts six digits only and rejects five, seven, and letters; the error text is in the language shown when the rule fails). Validation: the D8 scratch edits (the hour boundary, a single shared messages object) turn them red; the suite passes; coverage of `libraries/` and `schemas/auth.schema.ts` is read from the report and recorded in the phase note; lint, format, typecheck clean. E2E: n/a. _Commit: `test(webapp): cover the formatters, the message hooks, and the auth schema`._
6. **Docs sync (`docs/`)** — re-search `docs/` for tests, the webapp, and the task runner; update a page whose subject the diff touched. Expected result: n/a, as in plans 00004 and 00005. Validation: the search commands and their output in the phase note; `rumdl check` on any touched page. _Commit: none if n/a, else `docs: <message>`._
7. **Agent docs sync (`.agents/docs` and `AGENTS.md`)** — `shape.md` (the three recipes in the gates table, the Vitest sentence in the webapp entry, the Chromium prerequisite), `rules.md` ("Webapp tests": D4, D7, D8's hygiene rules, the report location and no threshold, the one-version catalog rule for Vitest), `architecture.md` (D1 and D2 as a short record), `index.md`; `AGENTS.md` "Validation" names the webapp command only if a gate line there lists test commands (it does not: it points to `shape.md`, so no change is expected). Validation: every claim diff-checked against the landed files (`rg` for the recipe names, scripts, config path, and the report directory); `rumdl check .` clean. _Commit: `docs(agents): record the webapp unit test runner`._
8. **Ledger close and handover** — `issue-00003` item 5 resolved with the commits, and the file, now all terminal, moves to `.agents/docs/archive/`; the plan's statuses flip and it moves to the archive; `handover-00009-webapp-unit-tests.md` is written; `handover-00007` and `handover-00008` stay (partial: open manual verifications) unless a thread closed; the index rows move. Validation: `grep -c '^- status'` agrees with `count` and the index before the move; `rg` for the moved file names finds no dangling reference. _Commit: made on the owner's grant of 2026-11-22 after the last phase, or recommended if the grant has lapsed._
9. **Final validation** — the matrix below, over the tree as it stands. Validation: every row green. _Commit: none._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Webapp unit tests | `pnpm --filter webapp test`, also `just test-web` | All new tests pass in Chromium |
| Tests can fail | The D8 scratch edits, each restored | Red with the edit, green after; `git status` shows no code change |
| Coverage | `pnpm --filter webapp test:coverage` | Text table printed, `.output/coverage/index.html` exists, no threshold fails |
| Vitest UI | `pnpm --filter webapp test:ui`, a request to its port | Answers 200, then stopped |
| uilibs suite and a11y gate | `pnpm --filter uilibs test` (not alongside Storybook) | 92 files, 444 tests, unchanged by the catalog move |
| Lint, format, typecheck | `pnpm lint`, `pnpm format:check`, `pnpm -r --workspace-concurrency=1 typecheck`, `rumdl check .` | 0 findings |
| Dependency policy | `pnpm install --frozen-lockfile`; `git diff --stat -- '**/package.json' pnpm-lock.yaml pnpm-workspace.yaml` | Catalog entries, two `uilibs` lines, the webapp devDependencies and scripts, the lockfile; nothing else |
| Bundle | `pnpm --filter webapp build && just size` | 458.1 KB / 145.9 KB gzip, under the limits (test files are never imported) |
| Quality gates unchanged | `just --list` | `test` and `verify` recipes identical to before |
| E2E | n/a: no app code or UI changes | — |
| Rust, API specs, composition root | n/a: no Rust or server behavior changes | — |

## Explicitly out of scope

- **Component and route tests in the webapp** — Storybook (`uilibs`) and the E2E suite cover them; a component test with StyleX would need the StyleX plugin in `vitest.config.ts`, and none is needed yet.
- **A coverage threshold** — set once the baseline from these tests exists (D3).
- **Webapp tests in `just verify` or CI** — they need Chromium (D5); reopen if a CI workflow is added.
- **Tests for `libraries/viewport.ts`, `hotkeys.ts`, `commandbar.store.ts`, and `query-client.ts`** — outside the six areas the owner chose (D6); each can follow when it grows logic.
- **Firefox and WebKit** for the unit tests — Chromium only, as `uilibs`.
