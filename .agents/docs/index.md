# Agents Documentation Index

updated: 2026-11-20T06:09:00+07:00

Agent-only documentation. Start at the repo root `AGENTS.md` (workflow rules), then the core documents below. Everything else is reference, history, or contract — navigate from here.

## Core documents

| Path                           | Read it for                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/AGENTS.md`                   | The workflow rules: read order, ambiguous-decision protocol, skill map, workflow, git.                                                                      |
| `.agents/docs/index.md`        | The documentation map — this file.                                                                                                                          |
| `.agents/docs/shape.md`        | The repository's shape: the layout, the toolchain, the commands.                                                                                            |
| `.agents/docs/rules.md`        | The detailed rules behind `AGENTS.md`: contracts (dependency direction, modules, data, migrations, errors, Rust code, tests), how-to-change recipes, traps. |
| `.agents/docs/ui-components.md` | The `packages/uilibs` inventory: every component's import path, parts, primitive, `size`, `tone`, and `labels`; how to use and extend the library. |
| `.agents/docs/stylex-authoring.md` | How to write StyleX styles: `create`, `props`, variables, themes, antipatterns, and the library's control recipes with the contrast table. Read before touching any `*.stylex.ts`. |
| `.agents/docs/stylex-installation.md` | StyleX build setup per bundler, options, TypeScript, troubleshooting. Read when changing the compiler pipeline. |
| `.agents/docs/architecture.md` | The architecture: module anatomy, lifecycle, and the decision records with their rejected alternatives.                                                     |

## Docs sync

`AGENTS.md` carries the rule: a behavior change and its documentation land in the same turn and the same commit. This file is the map the rule dispatches on — when a diff touches what a document claims, update that document and the matching row here.

## Plans (`.agents/docs/plans/`)

A plan is a contract: frontmatter `status`, decisions with rejected alternatives, phases with commits. Never start, resume, or continue one without the owner's explicit instruction. Completed plans archive flat to `.agents/docs/archive/`.

None live. `plan-00001-uilibs-improvement.md` (done, 2026-11-20) is in `.agents/docs/archive/`.

## Issues (`.agents/docs/issues/`)

Findings that outlive a turn. The directory lists only files with `open` or `considering` items.

| File                               | Status                                  | Subject                                                                                                              |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `issue-00001-workspace-hygiene.md` | considering (6 resolved, 1 considering) | Workspace hygiene: everything resolved except the location of domain modules (`modules/` vs `apps/server/modules/`). |

## Roadmap (`.agents/docs/roadmap/`)

Parked improvements with a named unlock. None yet; the dual-edition idea is parked inside `architecture.md` ("Parked").

## Handovers (`.agents/docs/handover/`)

Session compactions, `handover-<nnnnn>-<topic>.md`; the directory keeps the five newest.

| File                                     | Status | Subject                                                                                       |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `handover-00001-cli-transport-vixum.md`  | done   | CLI scaffold, transport, vixum (server-rendered SPA), DX and Docker.                          |
| `handover-00002-uilibs-audit-plan.md`    | done   | The `packages/uilibs` audit and the improvement plan, before any phase ran.                   |
| `handover-00003-uilibs-improvement.md`   | done   | Plan 00001 closed: what landed in `packages/uilibs`, the commits, what stayed open, the trap. |

## Audits (`.agents/docs/audit/`)

Point-in-time reviews written by the `deep-audit` skill. None live; `audit-00001-uilibs.md` (completed, 2026-11-20: 25 findings fixed, F-26 deferred) is in `.agents/docs/archive/`.

## Archive (`.agents/docs/archive/`)

Completed ledger files, moved unchanged: `plan-00001-uilibs-improvement.md`, `audit-00001-uilibs.md`.
