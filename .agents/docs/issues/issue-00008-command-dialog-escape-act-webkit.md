---
status: open
created: 2026-11-25T16:38:00+07:00
updated: 2026-11-25T16:38:00+07:00
summary: "Closing a `CommandDialog` with Escape while its input holds text logs eight React `act(...)` console errors in WebKit only, which fails the story gate; one item, found in plan-00011 phase 48 and reproduced in phase 51's close-out."
count: 1
---

# `CommandDialog` Escape with text in the input logs `act` errors in WebKit

## Escape on a `CommandDialog` whose input has a query fails the WebKit story gate

- status: open
  area: frontend/uilibs
  summary: In WebKit, pressing Escape in `CommandDialog` (`packages/uilibs/src/extra/command/command.component.tsx:53`, built on Base UI `Autocomplete` in `inline open` mode, `:35`) while the input still holds a query logs 8 console errors, "An update to %s inside a test was not wrapped in act(...)" plus "A component suspended inside an `act` scope, but the `act` call was not awaited". `.storybook/preview.tsx:168-170` throws on any console error, so the story fails with "The story logged 8 console error(s)". Reproduced 2026-11-25 by removing the `userEvent.clear(input)` step before Escape in the `Keyboard` play (`command.stories.tsx:456-460`): `STORYBOOK_TEST_BROWSER=webkit pnpm --filter uilibs exec vitest run --project storybook src/extra/command/command.stories.tsx` gave 1 failed, 6 passed; the same file passed 7 of 7 in Chromium, and passes in WebKit with the clear step restored. Firefox and Chromium close the dialog on one Escape and the input keeps its text (`potions`). Not the story's state: the phase 48 thread made the palette uncontrolled (`defaultOpen`) and it still warned. The cause is unproven; it looks like a Base UI `Autocomplete` or `Dialog` close path that updates state during the exit in WebKit.
  plan: none yet (plan-00011 phase 48 worked around it in the story and did not touch the component)
  trigger: the owner decides to look at the close path (does a clear-then-close inside `CommandDialog` belong to the component, or is it a Base UI defect to report upstream), or a Base UI upgrade changes it. Until then the `Keyboard` play clears the query before Escape and says why, so the story no longer proves that Escape closes a palette that holds a query.
  note: verified 2026-11-25 in WebKit and Chromium (see the summary); not tried in Firefox with the clear step removed, the phase 48 thread reported it clean. Not fixed in plan-00011, on the owner's instruction.
