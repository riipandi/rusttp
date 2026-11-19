# Agents Documentation Index

updated: 2026-11-20T03:20:00+07:00

Agent-only documentation. Start at the repo root `AGENTS.md` (workflow rules), then the core documents below. Everything else is reference, history, or contract — navigate from here.

## Core documents

| Path                           | Read it for                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/AGENTS.md`                   | The workflow rules: read order, ambiguous-decision protocol, skill map, workflow, git.                                                                      |
| `.agents/docs/index.md`        | The documentation map — this file.                                                                                                                          |
| `.agents/docs/shape.md`        | The repository's shape: the layout, the toolchain, the commands.                                                                                            |
| `.agents/docs/rules.md`        | The detailed rules behind `AGENTS.md`: contracts (dependency direction, modules, data, migrations, errors, Rust code, tests), how-to-change recipes, traps. |
| `.agents/docs/ui-components.md` | The `packages/uilibs` inventory: every component's import path, parts, and primitive; how to use and extend the library. |
| `.agents/docs/stylex-authoring.md` | How to write StyleX styles: `create`, `props`, variables, themes, antipatterns. Read before touching any `*.stylex.ts`. |
| `.agents/docs/stylex-installation.md` | StyleX build setup per bundler, options, TypeScript, troubleshooting. Read when changing the compiler pipeline. |
| `.agents/docs/architecture.md` | The architecture: module anatomy, lifecycle, and the decision records with their rejected alternatives.                                                     |

## Docs sync

`AGENTS.md` carries the rule: a behavior change and its documentation land in the same turn and the same commit. This file is the map the rule dispatches on — when a diff touches what a document claims, update that document and the matching row here.

## Plans (`.agents/docs/plans/`)

A plan is a contract: frontmatter `status`, decisions with rejected alternatives, phases with commits. Never start, resume, or continue one without the owner's explicit instruction. Completed plans archive flat to `.agents/docs/archive/`.

| File                                  | Status            | Subject                                                                                                                       |
| ------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `plan-00001-uilibs-improvement.md`    | awaiting-approval | `packages/uilibs`: one control size scale, `ref` and Field wiring, AA tokens, tones, a11y gate on; 13 phases (from audit-00001). |

## Issues (`.agents/docs/issues/`)

Findings that outlive a turn. The directory lists only files with `open` or `considering` items.

| File                               | Status                                  | Subject                                                                                                              |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `issue-00001-workspace-hygiene.md` | considering (6 resolved, 1 considering) | Workspace hygiene: everything resolved except the location of domain modules (`modules/` vs `apps/server/modules/`). |

## Roadmap (`.agents/docs/roadmap/`)

Parked improvements with a named unlock. None yet; the dual-edition idea is parked inside `architecture.md` ("Parked").

## Handovers (`.agents/docs/handover/`)

Session compactions, `handover-<nnnnn>-<topic>.md`; the directory keeps the five newest. None yet.

## Audits (`.agents/docs/audit/`)

Point-in-time reviews written by the `deep-audit` skill.

| File                       | Status    | Subject                                                                                                       |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `audit-00001-uilibs.md`    | in_review | `packages/uilibs`, every component: 26 findings (3 high, 15 medium, 6 low, 2 info); the plan above fixes them. |
