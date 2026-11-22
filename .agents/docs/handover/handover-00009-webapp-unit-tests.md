---
status: done
created: 2026-11-22T14:40:00+07:00
plan: plan-00006-webapp-unit-tests
---

# Handover: Plan 00006 closed, webapp unit tests in Vitest browser mode

## What this session did

The owner approved a unit test runner for `packages/webapp` (`issue-00003` item 5): Vitest with React, UI, and coverage. Plan 00006 (archived, done) put Vitest 5 in browser mode on Chromium into the webapp (`vitest.config.ts`, `vitest-browser-react`, `@vitest/ui`, `@vitest/coverage-v8`), moved every Vitest version into the workspace catalog (`uilibs` now uses `catalog:` too), added `just test-web`, `test-web-ui`, and `test-web-coverage` (`just test` and `verify` stay Rust-only), and wrote 75 tests beside their sources: the notifications and sidebar stores, the locale store, the formatters, the message hooks, and the auth schema. Each test file was checked against a scratch edit that breaks the code. The decisions are D1 to D8 in the plan and in `architecture.md` ("The webapp's unit tests run in a real browser, with one Vitest version"); the contract is `rules.md` "Webapp tests".

Ledger moves: plan 00006 archived; `issue-00003` has no open item left and moved to the archive; `AGENTS.md` "Validation" now names `just test-web`; handovers 00007 and 00008 stay live (open manual verifications) and are unchanged except that handover 00008's item 5 is closed here.

## Commits (this slice)

- `docs(agents): add plan 00006, the webapp unit test runner` (`b2b3aff`).
- `chore: move the Vitest versions into the catalog and add the webapp test dependencies` (`7f783ff`).
- `test(webapp): add the Vitest browser runner with UI and coverage` (`4a2d987`).
- `chore: add just recipes for the webapp tests` (`f6dc323`).
- `test(webapp): cover the sidebar and locale stores` (`77a0b97`).
- `test(webapp): cover the formatters, the message hooks, and the auth schema` (`8ec24c5`).
- `docs(agents)` records: `d1a7feb`, the sync `fa85e4f`, and the closing commit.

## What stayed open / the trap

- Nothing from the plan: the 75 tests pass, `uilibs` is still 92 files and 444 tests, and the entry load is unchanged (458.1 KB / 145.9 KB gzip).
- Not covered on purpose: components and routes (Storybook and E2E), `viewport.ts`, `hotkeys.ts`, `commandbar.store.ts`, `query-client.ts`, and a coverage threshold (total line coverage of `app` is 6.2%; the figure waits for a baseline that components would join). Firefox and WebKit run no unit tests.
- Seen, not changed: the comment at the top of `libraries/locale.store.ts` still says `__root.tsx` keys the route tree on the locale and remounts it (true before plan 00004); and `formatRelative` rounds a half step up, so 90 minutes ago reads "1 hour ago" while 90 minutes ahead reads "in 2 hours". The tests do not pin the half step.

Traps:

- Browser mode cannot reset modules: `vi.resetModules()` does nothing, a store keeps its state across tests, and `vi` is not a global. Put a store back with `setState` in `beforeEach`; import a module that reads storage at load under a query string (`./x.ts?visit=n`).
- A new test must be seen red once against a broken copy of the code; the first notifications test passed for the wrong reason until the reset was fixed.
- `vitest --ui` without a terminal runs once and exits; the dashboard answers only with its token URL (403 without it).
- Chromium's `Intl.RelativeTimeFormat` reads two days ago as "kemarin dulu" in Indonesian, so an expectation of "2 hari yang lalu" fails; use three days.
- Do not run Storybook and a Vitest run together (handover 00008).

## Suggested skills

- `agent-docs` for any ledger change; `rust-verify-harden` only if Rust is touched.
