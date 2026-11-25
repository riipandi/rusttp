---
status: open
created: 2026-11-25T12:38:00+07:00
updated: 2026-11-25T17:05:00+07:00
summary: "StyleX compiles the `':dir(rtl)'` pseudo-class to a `:lang()` list, so the four uilibs rules that flip a transform for right-to-left text ignore `dir=\"rtl\"` unless a matching `lang` is set; one item, found in plan-00011 phase 44."
count: 1
---

# StyleX `:dir(rtl)` matches `lang`, not `dir`

## Direction flips in uilibs follow `lang`, not the `dir` attribute

- status: open
  area: frontend/uilibs
  summary: StyleX compiles `':dir(rtl)'` into `:is(:lang(ae), :lang(ar), :lang(arc), :lang(bcc), :lang(bqi), :lang(ckb), :lang(dv), :lang(fa), …)`; the built Storybook CSS (`.output/storybook/assets/iframe-*.css`) holds the `:lang()` list and no `:dir(rtl)` selector. Four rules use it: `packages/uilibs/src/extra/calendar/calendar.stylex.ts:33` (`scaleX(-1)` on the month arrows), and `packages/uilibs/src/data-grid/data-grid-table.stylex.ts:432` and `:441` (expand chevron `rotate(0deg)` and `rotate(90deg)`) and `:863` (`rotate(180deg)`). A subtree with `dir="rtl"` and no Arabic, Hebrew, Persian, or similar `lang` (the Storybook direction toggle, an app that sets `dir` alone) draws the left-to-right transform. Found while building `BadgeAnchor`, whose first version used a `:dir(rtl)` variant and measured the badge on the wrong corner in an RTL wrapper; `BadgeAnchor` now uses logical insets (`badge-anchor.stylex.ts:14` says why).
  plan: none yet (plan-00011 phase 51 documents it on the theming page; phase 44 only worked around it)
  trigger: the owner decides how to flip these four transforms (logical properties where one exists, or a `[dir="rtl"]` attribute selector through StyleX's `stylex.when.ancestor`), or an RTL story that draws a Calendar or a data grid fails on one of them.
  note: plan-00011 phase 51 re-checked it in the Calendar (2026-11-25, Chromium, `dir="rtl"` on a wrapper): the month arrows kept `transform: none`, and so did they with `lang="ar"` on the wrapper, because `react-day-picker` renders its root with `lang` set to the locale (`en-US`), which shadows the wrapper's `lang` (`svg.matches(':lang(ar)')` was false); the phase 51 RTL story (Field, Input, Select, Slider) does not draw a Calendar or a data grid, so it passes, and `theming.mdx` states the gap. Verified 2026-11-25 against the built CSS (zero `:dir(rtl)` occurrences, the `:lang()` list present). Not fixed in plan-00011 phase 44, on the owner's instruction.
