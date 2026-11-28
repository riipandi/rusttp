---
status: open
created: 2026-11-28T22:33:15+07:00
updated: 2026-11-28T22:33:15+07:00
summary: "Four leftovers of plan 00015: the SPA's unhashed public files keep memory-serve's week-long cache (backend.md calls it revalidating), the reduced-motion stylesheet walk is still copied in three stories, the CI edits are unproven on GitHub, and three position stories skip the 390 px overflow gate. 4 items, all open or considering."
count: 4
---

# uilibs Storybook polish leftovers

## The SPA's unhashed public files are cached for a week

- status: open
  area: backend/apps/server
  summary: `apps/server/src/transport/spa.rs:25-29` layers `immutable_assets` over `/assets/*` only; every other embedded file (`favicon.*`, `manifest.json`, `routes.json`) keeps memory-serve 2.4.0's default `max-age=604800, stale-while-revalidate=86400` (`options.rs:43-46`), the same default that served a stale Storybook `index.json`. `backend.md` (\"Traps\") calls it \"memory-serve's revalidating default\", which is not what the crate sends.
  plan: none yet (found while closing plan-00015, D1 fixed the Storybook half)
  trigger: the owner asks, or a changed unhashed public file reaches a user late; fix is `.cache_control(CacheControl::NoCache)` on that router plus a test like `storybook_files_revalidate_instead_of_being_cached`, and the `backend.md` sentence corrected.

## The reduced-motion stylesheet walk is copied in three stories

- status: open
  area: frontend/uilibs
  summary: `mediaRules` in `src/contracts/motion.ts` is the one reader; `toast.stories.tsx:337`, `theme/theme-switcher.stories.tsx:24`, and `data-grid/stories/data-grid-rows.stories.tsx:1177` still carry their own copy of the same walk.
  plan: none yet
  trigger: the next change to one of those three stories; swap its copy for `mediaRules`.

## The CI edits of plan 00015 are unproven on GitHub

- status: considering (trigger: the first push of the branch)
  area: ci
  summary: `uilibs.yml` now installs Chromium in the `checks` job and runs `check:docs:render` after `storybook:build` (about 35 s locally, job timeout raised from 15 to 20 minutes). `actionlint` is not installed here, so the file was only parsed as YAML.
  trigger: the pull request's first run; read the `Checks` job time and, if the required-check names in branch protection need updating, say so to the owner.

## Three position stories skip the 390 px overflow gate

- status: considering (trigger: a way to size the popup collision boundary to a stage)
  area: frontend/uilibs
  summary: Tooltip `Sides`, Popover `Placement`, and PreviewCard `Sides` set the `desktop` viewport global, because a 288 px popup flips at 390 px (Base UI measures collision against the viewport, not the stage). The phone-width overflow gate does not cover them; Sheet `Sides` still runs at 390 px.
  trigger: Base UI or the stories can bound collision to the stage, or a phone-width story of the same popups is added beside them.
