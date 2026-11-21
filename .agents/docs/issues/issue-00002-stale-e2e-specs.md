---
status: open
created: 2026-11-21T21:28:29+07:00
updated: 2026-11-21T21:28:29+07:00
summary: "Two Chromium E2E tests fail against today's copy (MFA subtitle, redesigned 404 page), and the Firefox and WebKit projects cannot run locally because their Playwright builds are missing."
count: 2
---

# E2E specs out of step with the webapp

## Two specs assert copy the webapp no longer renders

- status: open
  area: packages/e2e
  summary: `screens/auth/auth.spec.ts:118` expects `getByText('Enter the 6-digit code.')`, which now also matches the MFA subtitle (`app/routes/(auth)/mfa.tsx:28`, "Open your authenticator app and enter the 6-digit code.", since `f076be8`), so the strict-mode locator resolves two elements. `screens/not-found/not-found.screen.ts:10` looks for a heading named `404`; the redesigned page (`app/routes/-boundaries.tsx:55`, since `9407fed`) titles it `Page not found`. Both fail on Chromium against the dev stack (2026-11-21); neither file changed in plan 00003.
  plan: plan-00003-admin-sidebar-followups (found in its phase 7, out of its scope)
  trigger: the owner approves the fix: `exact: true` (or a `role='alert'` scope) for the code message, and the not-found screen's heading named `Page not found`.

## Firefox and WebKit projects cannot run locally

- status: open
  area: packages/e2e (local toolchain)
  summary: Playwright 1.65.1 wants `firefox-1572` and `webkit-2388`; `~/Library/Caches/ms-playwright` holds `firefox-1555` and `webkit-2370`, so the Firefox, Safari, and Mobile Safari projects fail at `browserType.launch` before any test runs.
  plan: none yet
  trigger: the owner runs `pnpm --filter e2e install-browsers` (installs system dependencies too), then the suite runs on all four projects.
