---
status: resolved
created: 2026-11-26T00:45:09+07:00
updated: 2026-11-26T04:40:00+07:00
summary: "Two story-gate findings from plan-00012: the rows `Right To Left` story is timing sensitive in WebKit (data-grid-rows.stories.tsx), and every story logs Storybook 10's removed `viewport.defaultViewport` parameter (.storybook/preview.tsx). Both resolved by plan-00013, 2 items."
count: 2
---

# Story gate leftovers found while fixing the data grid

## The rows Right To Left story flakes in WebKit under load

- status: resolved (2026-11-26, plan-00013 phase 4 and two follow-up commits)
  area: frontend/uilibs data grid stories
  summary: `RightToLeft` in `packages/uilibs/src/data-grid/stories/data-grid-rows.stories.tsx` waits 1 s (the `waitFor` default) for the collapsed chevron's `transform` to settle (`turn(chevron).b`), but the chevron has a `duration.medium` transition (`rowExpandChevron` in `data-grid-table.stylex.ts`). It failed once in WebKit at 1123 ms during a three-engine run (2026-11-25, plan-00012 phase 16); 3 isolated runs and 2 full reruns were green, so it is load dependent and not reproduced on demand.
  plan: plan-00013, phase 4
  evidence: `RightToLeft` now waits 10 s on every transition read and find (`b3ababd`, `0cfc261`), and reads both matrix terms of the expanded chevron in one wait after its animations have finished (`6d18d46`). Two more WebKit failures appeared while validating (`Right To Left` at 2069 ms in one scoped run, and at 1668 ms in the full run, `expected 0.104132 to be close to 1`): neither was inside the 10 s waits, so the unwaited read of the expanded chevron after a wait on `b` is the likely cause; a slowed 1.5 s transition could not reproduce it in any engine, so that cause stays a hypothesis. Mutation: without the `:dir(rtl)` rule the story still fails, after 10.5 s. Reopen if it fails again in any engine.
  trigger (kept): it fails again in the nightly WebKit job, or someone touches the story; then give the `waitFor` calls an explicit timeout (as the Command `Keyboard` play does) or read the end state, not the transition.

## Every story logs the removed viewport.defaultViewport parameter

- status: resolved (2026-11-26, plan-00013 phase 1, `5b24b84`)
  area: frontend/uilibs Storybook config
  summary: Storybook 10 prints "The `viewport.defaultViewport` parameter was removed in Storybook 10. Use `globals: { viewport: \"phone\" }` instead" for every story. The 390 px overflow gate of plan-00011 phase 53 still sets `parameters.viewport.defaultViewport` (`.storybook/preview.tsx`, and the `desktop` opt-outs in Table `FitsColumn` and Kanban `Keyboard`), and the gate passes today, so the parameter still has an effect in the test run; whether it keeps working after the next Storybook upgrade was not checked. It is a console warning, so the story gate (`console.error` only) does not fail it.
  plan: plan-00013, phase 1
  evidence: the window is `initialGlobals.viewport = { value: 'phone', isRotated: false }` (object form, only under test), `FitsColumn` and Kanban `Keyboard` set a `desktop` object global, and the preview's `afterEach` fails a story whose `window.innerWidth` is not the width its global names or that has no global. The warning is printed by the Storybook manager, not by the test run; after the change a Storybook UI load logs 0 warnings and keeps the 1100 px canvas. Controls in Chromium, Firefox, and WebKit: a scratch 700 px story fails the gate (`310px wider than the 390px viewport`) and a scratch string global fails the guard. `frontend.md` ("Overflow gate") and `packages/uilibs/AGENTS.md` name the global.
  trigger (kept): the next Storybook upgrade, or the warning is first read as noise hiding a real one; then move to `globals: { viewport }`, check that every story still renders at 390 px (the overflow gate must still fail a deliberately wide story), and update `frontend.md` ("Overflow gate").
