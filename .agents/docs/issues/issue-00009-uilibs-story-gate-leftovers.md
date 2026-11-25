---
status: open
created: 2026-11-26T00:45:09+07:00
updated: 2026-11-26T00:45:09+07:00
summary: "Two story-gate findings from plan-00012: the rows `Right To Left` story is timing sensitive in WebKit (data-grid-rows.stories.tsx), and every story logs Storybook 10's removed `viewport.defaultViewport` parameter (.storybook/preview.tsx). Both open, 2 items."
count: 2
---

# Story gate leftovers found while fixing the data grid

## The rows Right To Left story flakes in WebKit under load

- status: open
  area: frontend/uilibs data grid stories
  summary: `RightToLeft` in `packages/uilibs/src/data-grid/stories/data-grid-rows.stories.tsx` waits 1 s (the `waitFor` default) for the collapsed chevron's `transform` to settle (`turn(chevron).b`), but the chevron has a `duration.medium` transition (`rowExpandChevron` in `data-grid-table.stylex.ts`). It failed once in WebKit at 1123 ms during a three-engine run (2026-11-25, plan-00012 phase 16); 3 isolated runs and 2 full reruns were green, so it is load dependent and not reproduced on demand.
  plan: none yet
  trigger: it fails again in the nightly WebKit job, or someone touches the story; then give the `waitFor` calls an explicit timeout (as the Command `Keyboard` play does) or read the end state, not the transition.

## Every story logs the removed viewport.defaultViewport parameter

- status: open
  area: frontend/uilibs Storybook config
  summary: Storybook 10 prints "The `viewport.defaultViewport` parameter was removed in Storybook 10. Use `globals: { viewport: \"phone\" }` instead" for every story. The 390 px overflow gate of plan-00011 phase 53 still sets `parameters.viewport.defaultViewport` (`.storybook/preview.tsx`, and the `desktop` opt-outs in Table `FitsColumn` and Kanban `Keyboard`), and the gate passes today, so the parameter still has an effect in the test run; whether it keeps working after the next Storybook upgrade was not checked. It is a console warning, so the story gate (`console.error` only) does not fail it.
  plan: none yet
  trigger: the next Storybook upgrade, or the warning is first read as noise hiding a real one; then move to `globals: { viewport }`, check that every story still renders at 390 px (the overflow gate must still fail a deliberately wide story), and update `frontend.md` ("Overflow gate").
