---
status: resolved
created: 2026-11-21T21:28:29+07:00
updated: 2026-11-21T21:37:46+07:00
summary: "Resolved 2026-11-21 (both items). Two Chromium E2E tests failed against today's copy (MFA subtitle, redesigned 404 page), and the Firefox and WebKit projects could not run locally because their Playwright builds were missing."
count: 2
---

# E2E specs out of step with the webapp

## Two specs assert copy the webapp no longer renders

- status: resolved (2026-11-21)
  area: packages/e2e
  summary: `screens/auth/auth.spec.ts:118` expects `getByText('Enter the 6-digit code.')`, which now also matches the MFA subtitle (`app/routes/(auth)/mfa.tsx:28`, "Open your authenticator app and enter the 6-digit code.", since `f076be8`), so the strict-mode locator resolves two elements. `screens/not-found/not-found.screen.ts:10` looks for a heading named `404`; the redesigned page (`app/routes/-boundaries.tsx:55`, since `9407fed`) titles it `Page not found`. Both fail on Chromium against the dev stack (2026-11-21); neither file changed in plan 00003.
  plan: plan-00003-admin-sidebar-followups (found in its phase 7, out of its scope)
  trigger: None — closed.
  resolution: `2e29352` scopes the code message to the field's `alert` (`getByRole('alert').filter({ hasText })`) and names the not-found heading `Page not found` and its link `Back to home`. Chromium 28/28.

## Firefox and WebKit projects cannot run locally

- status: resolved (2026-11-21)
  area: packages/e2e (local toolchain)
  summary: Playwright 1.65.1 wants `firefox-1572` and `webkit-2388`; `~/Library/Caches/ms-playwright` holds `firefox-1555` and `webkit-2370`, so the Firefox, Safari, and Mobile Safari projects fail at `browserType.launch` before any test runs.
  plan: none yet
  trigger: None — closed.
  resolution: `playwright install firefox webkit` (owner's go-ahead, 2026-11-21) fetched `firefox-1572` and `webkit-2388`. The first full run surfaced one more stale spec: at phone width the `Admin` navigation is in the top bar's drawer, so `0f6a99b` opens the drawer when `isMobile`. All four projects: 108 passed, 4 skipped (the rail tests on Mobile Safari), 0 failed.
