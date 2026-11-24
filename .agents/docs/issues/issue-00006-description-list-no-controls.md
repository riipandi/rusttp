---
status: open
created: 2026-11-24T12:25:00+07:00
updated: 2026-11-24T12:25:00+07:00
summary: "DescriptionList has no prop that fits the Playground controls rule, so its Playground shows no controls; found in plan-00010 phase 3 and awaiting the owner."
count: 1
---

# Playground controls that have no prop to drive

## DescriptionList has no prop for a Playground control

- status: open
  area: packages/uilibs
  summary: `extra/description-list/description-list.component.tsx:22-46` gives `DescriptionList`, `DescriptionTerm`, and `DescriptionDetails` only `render` and `style`, both of which plan-00010 D3 forbids as controls. Its Playground (`description-list.stories.tsx`) therefore sets no `controls` parameter and shows no Controls panel; it is the one stories file outside `contracts/` and the seven Data Grid topic files whose Playground has no `include` list (plan-00010 closing check).
  resolution: None yet. Options: accept it as the one Playground with no controls, or add a story-only control that is not a prop (for example the number of term and details pairs shown). The owner decides.
  trigger: A decision on whether DescriptionList's Playground carries a story-only control.
