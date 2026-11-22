---
status: done
created: 2026-11-20T19:42:04+07:00
---

# Handover: Container demo stack and webapp navigation rebuilt

## What this session did

No plan drove this session; the owner steered it with small requests and screenshots. It added the container demo stack, then rebuilt the webapp navigation. Container: a distroless PocketBase service (healthcheck through busybox `wget`, superuser created by a `post_start` script held in a compose `configs:` block), a Pocket ID service on SQLite behind the shared nginx TLS front on `:1411`, the OpenID conformance suite in `compose-mock.yaml`, and the profiles `demo`, `sre`, and `conformance` so heavy services stay off by default (layout and commands in `shape.md`). Customer dashboard (`packages/webapp/app/routes/(app)/`): the `/settings` redirect and settings pages, a skeleton and empty state, a derived active nav item, a two-column summary on mobile, a notification placeholder. Admin (`packages/webapp/app/routes/admin/`): a mobile top bar, a collapsible icon-rail sidebar, a notification entry with an unread indicator, and per-layout account menus. Shared: the `NavSheet` drawer (`app/components/nav-sheet.tsx`, styles in `app/styles/element/nav-sheet.stylex.ts`), a tooltip with the shared overlay surface and an SVG outlined arrow (`packages/uilibs/src/base/tooltip/`), and TanStack devtools following the app theme (`packages/webapp/app/routes/-devtools.tsx`). `shape.md` was updated alongside each layout change; `rules.md` and `architecture.md` were not touched.

## Commits (this slice)

`git log --oneline f076be8..HEAD` lists all 22. The groups:

- `feat(container)` / `refactor(container)`: PocketBase, Pocket ID, conformance suite, profiles (`c8d3ae3`, `74dcc39`, `2a5c575`, `c0bf704`).
- `feat(webapp)` customer dashboard: settings pages, skeleton and empty state, mobile navigation, notification placeholder (`7ef708e` to `aef812a`).
- `feat(webapp)` admin: top bar and drawer, collapsible sidebar, notification entry (`8edaaf9`, `6db69f0`, `714a022`), then visual refinements (`38750b2`, `687814d`, `9d73f77`, `ff5b1a5`, `d56c778`).
- `fix(uilibs)` tooltip (`631ae84`) and `fix(webapp)` devtools theme (`209c7dd`).

## What stayed open / the trap

Every thread this handover left open is closed (checked against the tree and a run on 2026-11-22):

- The Storybook a11y gate after the tooltip change: closed by plan 00003 (the `Open` story in `packages/uilibs/src/base/tooltip/tooltip.stories.tsx`); `pnpm --filter uilibs test` is 92 files, 444 tests green.
- Contrast: measured, not estimated, in plan 00003 phase 4 (all text and control pairs at AA; the tooltip outline is decorative).
- Drawers, the rail, and the devtools theme: checked in Chromium by plan 00003; the axe sweep (`packages/e2e/screens/a11y/a11y.spec.ts`) covers every route at 390 and 1440px; the mobile drawer is opened by the admin navigation test (`isMobile`). Chromium E2E: 183 passed.
- Notifications: `unread` comes from `libraries/notifications.store.ts` (`unreadCount`), the bells show a dot and a count in their name, and the popover exists. Sidebar collapse persists in `localStorage` `admin-sidebar`. The collapsed logo is part of the one toggle button (since `fe1415a`); it is not a link.
- Compose files carry development-only default credentials by the owner's choice (`AGENTS.md`, "Secrets"; `rules.md`, "Sample data"): not a finding.

Traps that cost time:

- **StyleX shorthand versus longhand.** A `paddingInline` shorthand in one style object loses to `paddingInlineStart` or `paddingInlineEnd` longhands in another, whatever the order. The collapsed sidebar header sat 6px off-center until both longhands were overridden.
- **`Separator` is `width: 100%`.** With a side margin it overflows its container; use `width: 'auto'` (`nav-sheet.stylex.ts`, `sidebar.stylex.ts`).
- **Tooltips default to a 600ms delay** in Base UI; `TooltipProvider` (delay 0) makes them instant, and the collapsed sidebar wraps its nav in one.
- **The tooltip arrow is a 12x6 SVG rotated per `data-side`.** Left and right need `-(8+1)px` because the rotated box swaps axes; the first attempt was 3px off and only a Chromium measurement showed it.
- **The devtools shell reads `config` once**, and `localStorage.tanstack_devtools_settings` outranks it, so a theme in `config` never follows the app. The theme is written to storage in a lazy initializer and the child remounts with `key={theme}`; the router panel has no theme prop.
- **StyleX cannot branch on the picked theme** without OS media queries. Use tokens that flip per theme (`foregroundPrimary`, `borderPrimary`); an OKLCH color mix toward the page went dusty in light mode.
- **`oxfmt` reflows code**, so scripted string replacements written against pre-format text can miss silently. Re-read the file after formatting. The shell cwd also resets between calls and earlier `cd` can leave it in the wrong directory; use absolute paths.

## Suggested skills

- `agent-docs` for the closing sweep and any ledger or `docs/` change.
- `emil-design-eng`, `apple-design`, `impeccable` for further navigation, drawer, and sidebar polish.
- `rust-verify-harden` only if Rust or the compose-and-server probes are touched.
- `security-review` before any auth, session, or Pocket ID and superuser-credential work.
- `clarity` before rewriting tree documents.

How the owner works, for the next agent: short replies that lead with the result and say what was and was not verified; commits only on request, with explicit paths and `type(scope): message`; no pushes. Visual checks run in Chromium through Playwright from `packages/e2e/node_modules/@playwright/test`, with scripts kept outside the repo, against Storybook (`pnpm --filter uilibs storybook`, port 6006) or the dev stack on `127.0.0.1:3000`, which the owner usually has running.
