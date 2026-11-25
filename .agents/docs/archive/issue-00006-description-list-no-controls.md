---
status: resolved
created: 2026-11-24T12:12:58+07:00
updated: 2026-11-24T12:26:04+07:00
summary: "DescriptionList had no prop that fits the Playground controls rule, so its Playground showed no controls; found in plan-00010 phase 3. Resolved with story-only controls on the owner's decision (2026-11-24)."
count: 1
---

# Playground controls that have no prop to drive

## DescriptionList has no prop for a Playground control

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `extra/description-list/description-list.component.tsx` gives `DescriptionList`, `DescriptionTerm`, and `DescriptionDetails` only `render` and `style`, both of which plan-00010 D3 forbids as controls, so its Playground set no `controls` parameter and showed no Controls panel.
  resolution: the owner chose story-only controls. `description-list.stories.tsx` Playground now sets `controls: { disable: false, include: ['pairs', 'term', 'details'] }`: `pairs` (range 1 to 8, default 5) slices eight Harry Potter order pairs, and `term` / `details` (text, defaults `Order number` / `ORD-0071`) set the first pair, to try long terms and wrapping details. Its `play` still asserts five terms and five definitions under the defaults. Built-Storybook probe: the Controls panel lists exactly `pairs`, `term`, `details`; driving `pairs` to 8 renders eight terms and the typed first term shows; the `Long values` story has no Controls tab; no page errors. Gate 956 of 956.
  trigger: None — closed.
