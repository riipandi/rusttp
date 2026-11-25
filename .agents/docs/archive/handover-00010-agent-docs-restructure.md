---
status: done
created: 2026-11-22T15:16:00+07:00
plan: plan-00007-agent-docs-restructure
---

# Handover: Plan 00007 closed, agent docs split by area, ui-audit skill

## What this session did

The owner asked (2026-11-22) to move the manual verifications to a roadmap, title handovers by summary, tighten every agent instruction without losing context, and add a UI audit skill. A questionnaire settled the shape (plan 00007, D1–D8): rules split by area, a slim root `AGENTS.md` with scoped ones, `# Handover: <summary>`, `done` handovers archive except the newest, parked ideas only in the roadmap, a new `ui-audit` skill reusing `deep-audit`'s report.

Where things are now:

- `AGENTS.md` (55 lines) holds the always-on rules; `apps/`, `crates/`, `packages/webapp/`, `packages/uilibs/` each have a short scoped `AGENTS.md`.
- `.agents/docs/rules.md` holds cross-area rules and the "Where a fact lives" table; `backend.md` and `frontend.md` hold the area contracts, recipes, and traps; `shape.md` keeps layout, toolchain, commands, and the compose stacks. `stylex-authoring.md` and `stylex-installation.md` were not touched.
- `roadmap-00001-parked-verifications.md`: real screen reader, real forced-colors mode, physical device, and the community/enterprise editions.
- Skills: `agent-docs`, `handoff`, `deep-audit` (hands frontend scope to `ui-audit`), `rust-verify-harden` (points at `backend.md`, adds the binary probe), and the new `ui-audit` (`SKILL.md`, `references/checklist.md`).

Ledger moves: plan 00007 archived; handovers 00007, 00008, 00009 archived; all handover titles rewritten; `index.md` lists the core documents, the project skills, and the roadmap.

## Commits (this slice)

- `docs(agents): add plan 00007 for the agent docs restructure` (`9970ee3`).
- `docs(agents): move parked verifications and the edition idea to roadmap-00001` (`10bf4ed`).
- `docs(agents): title handovers by summary and archive done handovers` (`d84d4ec`).
- `docs(agents): split rules by area and tighten the core documents` (`5ac9a67`).
- `docs(agents): slim root AGENTS.md and add scoped AGENTS.md per area` (`8f5683e`).
- `docs(skills): refine agent-docs, handoff, deep-audit, and rust-verify-harden` (`be7d903`).
- `feat(skills): add the ui-audit skill for webapp and uilibs audits` (`3d8d1c4`).
- `docs(agents): sync the index and references after the restructure` (`40ec8d6`).
- The closing commit (plan archive, this handover).

## What stayed open / the trap

- Nothing open from this plan. `issue-00001` (domain module location) stays `considering`; `roadmap-00001` holds the manual checks.
- `ui-audit` has not run yet; its first run will show whether the checklist needs trimming.

Traps:

- Line counts mislead for agent docs: the old `shape.md` held whole paragraphs in one table row. Measure with `wc -w`.
- Read the clock (`date -Iseconds`) before writing `updated`; this session first wrote times that had not happened yet.
- A section quoted from code or another doc (`file.md` ("Section")) breaks when the section moves; grep for the quotes after a split (`vitest.config.ts` quoted `rules.md`, "Traps").

## Suggested skills

- `agent-docs` for any ledger change.
- `ui-audit` for the next frontend review.
