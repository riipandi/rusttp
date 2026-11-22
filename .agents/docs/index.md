# Agents Documentation Index

updated: 2026-11-22T15:20:00+07:00

Agent-only documentation. Start at the repo root `AGENTS.md` (workflow rules), then the core documents below. Everything else is reference, history, or contract — navigate from here.

## Core documents

| Path | Read it for |
| --- | --- |
| `/AGENTS.md` | Always-on rules: ambiguity protocol, workflow, git, the skill map. Scoped `AGENTS.md` files in `apps/`, `crates/`, `packages/webapp/`, `packages/uilibs/` add the area's must-knows. |
| `.agents/docs/index.md` | This map. |
| `.agents/docs/shape.md` | Layout, toolchain, commands and gates, compose stacks. |
| `.agents/docs/rules.md` | Cross-area rules: where a fact lives, dependencies, sample data, secrets and dev credentials, the build and dev loop. |
| `.agents/docs/backend.md` | Rust contracts and traps: dependency direction, modules, data and migrations, errors and transport, the SPA document, Rust code, CLI, tests. |
| `.agents/docs/frontend.md` | `packages/` contracts and traps: layout, UI library, webapp forms, state, i18n, accessibility, shortcuts, bundle, tests. |
| `.agents/docs/architecture.md` | Module anatomy, lifecycle, and the decision records with rejected alternatives. |
| `.agents/docs/ui-components.md` | The `packages/uilibs` inventory: import paths, parts, primitives, `size`, `tone`, `labels`. |
| `.agents/docs/stylex-authoring.md` | How to write StyleX styles and the control recipes. Read before touching any `*.stylex.ts`. |
| `.agents/docs/stylex-installation.md` | StyleX build setup. Read when changing the compiler pipeline. |

## Terms

- **Agent docs** — `.agents/docs/` (this ledger and the core documents) and `AGENTS.md`: written for agents, English, with `file:line` evidence.
- **Human docs** — `docs/`: written for people, no paths or internals.

There is no `llms.txt`; "LLM docs" in an archived plan means agent docs.

## Docs sync

`AGENTS.md` carries the rule: a behavior change and its documentation land in the same turn and the same commit. This file is the map the rule dispatches on — when a diff touches what a document claims, update that document and the matching row here.

## Plans (`.agents/docs/plans/`)

A plan is a contract: frontmatter `status`, decisions with rejected alternatives, phases with commits. Never start, resume, or continue one without the owner's explicit instruction. Completed plans archive flat to `.agents/docs/archive/`.

| File | Status | Subject |
| --- | --- | --- |
| `plan-00007-agent-docs-restructure.md` | awaiting-approval | Split rules into rules/backend/frontend, slim root and scoped `AGENTS.md`, handover titles by summary, roadmap for parked work, refined skills, new `ui-audit` skill. |

Archived: `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md` (both done, 2026-11-20), `plan-00003-admin-sidebar-followups.md` (done, 2026-11-21), and `plan-00004-ui-audit-remediation.md`, `plan-00005-ui-leftovers-remediation.md`, `plan-00006-webapp-unit-tests.md` (all done, 2026-11-22) are in `.agents/docs/archive/`.

## Issues (`.agents/docs/issues/`)

Findings that outlive a turn. The directory lists only files with `open` or `considering` items.

| File                               | Status                                  | Subject                                                                                                              |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `issue-00001-workspace-hygiene.md` | considering (6 resolved, 1 considering) | Workspace hygiene: everything resolved except the location of domain modules (`modules/` vs `apps/server/modules/`). |

## Roadmap (`.agents/docs/roadmap/`)

Parked improvements with a named unlock.

| File | Status | Subject |
| --- | --- | --- |
| `roadmap-00001-parked-verifications.md` | living | Manual checks no code can replace (real screen reader, forced-colors OS mode, physical device) and the community/enterprise edition idea. |

## Handovers (`.agents/docs/handover/`)

Session compactions, `handover-<nnnnn>-<topic>.md`, titled `# Handover: <summary>`. The directory keeps `partial` handovers and the newest one; a `done` handover moves to the archive.

| File                                     | Status  | Subject                                                                                                                                              |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handover-00009-webapp-unit-tests.md` | done | Plan 00006 closed: Vitest browser mode for the webapp, one catalog version, `just test-web*`, 75 tests, the traps of browser mode. |

## Audits (`.agents/docs/audit/`)

Point-in-time reviews written by the `deep-audit` skill. None live; `audit-00001-uilibs.md` (completed, 2026-11-20: 25 findings fixed, F-26 deferred) is in `.agents/docs/archive/`.

## Archive (`.agents/docs/archive/`)

Completed ledger files, moved unchanged (handover titles were rewritten to `# Handover: <summary>` on 2026-11-22): `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md`, `plan-00003-admin-sidebar-followups.md`, `plan-00004-ui-audit-remediation.md`, `plan-00005-ui-leftovers-remediation.md`, `plan-00006-webapp-unit-tests.md`, `audit-00001-uilibs.md`, `handover-00001-cli-transport-vixum.md`, `handover-00002-uilibs-audit-plan.md`, `handover-00003-uilibs-improvement.md`, `handover-00004-webapp-forms-formisch.md`, `handover-00005-webapp-nav-container-demo.md`, `handover-00006-admin-sidebar-followups.md`, `handover-00007-ui-audit-remediation.md`, `handover-00008-ui-leftovers-remediation.md`, `issue-00002-stale-e2e-specs.md` (resolved 2026-11-21), `issue-00003-ui-audit-leftovers.md` (resolved 2026-11-22).
