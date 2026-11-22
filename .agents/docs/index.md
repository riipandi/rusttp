# Agents Documentation Index

updated: 2026-11-22T07:05:00+07:00

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

## Terms

- **Agent docs** — `.agents/docs/` (this ledger and the core documents) and `AGENTS.md`: written for agents, English, with `file:line` evidence.
- **Human docs** — `docs/`: written for people, no paths or internals.

There is no `llms.txt`; "LLM docs" in an archived plan means agent docs.

## Docs sync

`AGENTS.md` carries the rule: a behavior change and its documentation land in the same turn and the same commit. This file is the map the rule dispatches on — when a diff touches what a document claims, update that document and the matching row here.

## Plans (`.agents/docs/plans/`)

A plan is a contract: frontmatter `status`, decisions with rejected alternatives, phases with commits. Never start, resume, or continue one without the owner's explicit instruction. Completed plans archive flat to `.agents/docs/archive/`.

Live: `plan-00005-ui-leftovers-remediation.md` (in-progress, 11 phases: the entry budget and the root `TooltipProvider`, one admin chrome per viewport, series and `borderControl` contrast, the on-demand language catalog, the data grid split; issue-00003 items 1-4). Archived: `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md` (both done, 2026-11-20), `plan-00003-admin-sidebar-followups.md` (done, 2026-11-21), and `plan-00004-ui-audit-remediation.md` (done, 2026-11-22) are in `.agents/docs/archive/`.

## Issues (`.agents/docs/issues/`)

Findings that outlive a turn. The directory lists only files with `open` or `considering` items.

| File                               | Status                                  | Subject                                                                                                              |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `issue-00001-workspace-hygiene.md` | considering (6 resolved, 1 considering) | Workspace hygiene: everything resolved except the location of domain modules (`modules/` vs `apps/server/modules/`). |
| `issue-00003-ui-audit-leftovers.md` | considering (1 open, 4 considering, 1 resolved) | What plan 00004 left out: entry load growth (mostly the root `TooltipProvider`), palette contrast gaps, data grid size, double-mounted admin chrome, no webapp unit runner; the `AGENTS.md` line is resolved. |

## Roadmap (`.agents/docs/roadmap/`)

Parked improvements with a named unlock. None yet; the dual-edition idea is parked inside `architecture.md` ("Parked").

## Handovers (`.agents/docs/handover/`)

Session compactions, `handover-<nnnnn>-<topic>.md`; the directory keeps the five newest.

| File                                     | Status | Subject                                                                                       |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `handover-00003-uilibs-improvement.md`   | done   | Plan 00001 closed: what landed in `packages/uilibs`, the commits, what stayed open, the trap. |
| `handover-00004-webapp-forms-formisch.md` | done  | Plan 00002 closed: the auth forms moved from TanStack Form and zod to Formisch and Valibot.   |
| `handover-00005-webapp-nav-container-demo.md` | done | No plan: container demo stack, responsive navigation, collapsible admin sidebar, tooltip, devtools theme; every open thread closed (re-checked 2026-11-22). |
| `handover-00006-admin-sidebar-followups.md` | done | Plan 00003 closed: tooltip gate, measured contrast, persisted sidebar collapse; issue 00002 resolved, the rail logo is no longer a link (since `fe1415a`). |
| `handover-00007-ui-audit-remediation.md` | partial | Plan 00004 closed: the UI audit's fixes, the commits, issue 00003 (re-measured: the entry growth is mostly the root `TooltipProvider`), the traps. |

## Audits (`.agents/docs/audit/`)

Point-in-time reviews written by the `deep-audit` skill. None live; `audit-00001-uilibs.md` (completed, 2026-11-20: 25 findings fixed, F-26 deferred) is in `.agents/docs/archive/`.

## Archive (`.agents/docs/archive/`)

Completed ledger files, moved unchanged: `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md`, `plan-00003-admin-sidebar-followups.md`, `audit-00001-uilibs.md`, `handover-00002-uilibs-audit-plan.md`, `handover-00001-cli-transport-vixum.md`, `issue-00002-stale-e2e-specs.md` (resolved 2026-11-21).
