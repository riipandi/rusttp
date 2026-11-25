---
status: done
created: 2026-11-21T21:28:29+07:00
plan: plan-00003-admin-sidebar-followups
---

# Handover: Plan 00003 closed, admin sidebar follow-ups verified

## What this session did

Plan 00003 (archived, done) closed the verification threads that `handover-00005-webapp-nav-container-demo.md` left open, plus two sidebar changes the owner picked on 2026-11-21 (D1–D5 in the plan). The tooltip passes the uilibs a11y gate: no story used to leave it open when axe ran, so a new `Open` story does, and a planted `image-alt` violation proved that axe reaches the portalled popup. The admin sidebar's collapse now persists in `localStorage` `admin-sidebar` (`collapsed` | `expanded`, anything else reads as expanded). In the rail, the logo is a link to `/admin` above a separate `Expand sidebar` entry with a tooltip, and the hover swap is gone. Four E2E tests pin that behavior. Contrast was measured, not estimated: every text and control pair is at AA in light and dark (figures in the plan's phase 4 note). The tooltip's 8% outline is 1.19:1, recorded as decorative under WCAG 1.4.11. The devtools panel follows the app's Theme menu through Light → Dark → System. Ledger moves: `rules.md` gained `Webapp state` and a gate line in `UI library`; `shape.md`'s admin sentence was updated; `issue-00002-stale-e2e-specs.md` was filed; `handover-00001` moved to the archive.

## Commits (this slice)

- `docs: add plan 00003 for the admin sidebar follow-ups` (`d176a8a`) — the plan and its index row.
- `test(uilibs): keep a tooltip open in a story so the a11y gate checks the popup` (`7932717`).
- `docs: record phase 1 of plan 00003` (`0641c90`).
- `feat(webapp): persist the admin sidebar collapse and keep the logo a link in the rail` (`6be1f38`).
- `test(e2e): cover the admin sidebar collapse and the rail logo` (`753ff2a`) — also fixes the stale `Admin` title and heading in the existing admin test.
- `docs: record the admin sidebar collapse and rail logo` (`5514ab7`).
- The closing ledger commit (plan archive, issue, this handover, index) is left to the owner.

## What stayed open / the trap

Nothing stays open (checked on 2026-11-22):

- `issue-00002-stale-e2e-specs.md` is resolved and archived (2026-11-21): the two Chromium specs were fixed, and Firefox and WebKit run after `playwright install firefox webkit`.
- Notifications are no longer placeholders: `unreadCount` and the popover read `libraries/notifications.store.ts`.
- The rail logo is no longer a link: `a1ab6b8` and `fe1415a` (2026-11-22) made it the face of the one `Toggle sidebar` button, with the expand icon on hover or keyboard focus. The "logo is a link" paragraph above describes plan 00003's state, not today's; `shape.md` and `admin.spec.ts:144` carry the current behavior.
- No shared focus style for links exists; it is moot for the rail logo and was never filed.

Traps:

- **Reading only the tail of a Playwright run hides failures.** The failure list prints above the summary, and `tail` cut it off, so phase 3 first recorded a green suite. Grep the output for `failed` instead.
- **The a11y gate runs after `play`.** A popup that `play` closes again is never checked; a story must leave it open.
- **The devtools panel covers the sidebar footer.** With it open, pointer clicks on the account menu are intercepted; drive the menu with the keyboard.
- **Contrast over translucent backgrounds** must composite each layer over the opaque one beneath it. Painting over white gave wrong dark-theme figures until the script stacked the layers.

## Suggested skills

- `agent-docs` for the closing sweep and the issue-00002 follow-up.
- `emil-design-eng` / `impeccable` if the rail or the notification work continues.
