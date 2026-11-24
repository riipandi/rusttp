# Agents Documentation Index

updated: 2026-11-24T12:40:00+07:00

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
| `packages/uilibs/.storybook/stories/components.mdx` | The `packages/uilibs` catalog, shown in Storybook as "Components": conventions, look-alikes, every component with a link to its page. Read it before building or changing any UI. |
| `.agents/docs/stylex-authoring.md` | How to write StyleX styles and the control recipes. Read before touching any `*.stylex.ts`. |
| `.agents/docs/stylex-installation.md` | StyleX build setup. Read when changing the compiler pipeline. |

## Terms

- **Agent docs** — `.agents/docs/` (this ledger and the core documents), `AGENTS.md` (root and scoped), and the project skills in `.agents/skills/`: written for agents, English, with `file:line` evidence.
- **Human docs** — `docs/`: written for people, no paths or internals.

There is no `llms.txt`; "LLM docs" in an archived plan means agent docs.

## Docs sync

A behavior change and its documentation land in the same commit; `rules.md` ("Where a fact lives") names the file, and this map gets the matching row.

## Project skills (`.agents/skills/`)

| Skill | Use it for |
| --- | --- |
| `agent-docs` | Every ledger or docs change: plans, issues, roadmap, handovers, index, archive, `docs/`. |
| `handoff` | Writing a handover on the owner's request. |
| `deep-audit` | Evidence-based audit of a feature or the system (backend side); report in `audit/`. |
| `ui-audit` | Audit of `packages/webapp` and `packages/uilibs`: a11y, StyleX tokens, i18n, entry budget, screens per state and width; same report shape as `deep-audit`. |
| `rust-verify-harden` | Rust quality gates and the leak, deadlock, race, and boundary pass. |

The other entries in `.agents/skills/` are links to skills shipped by pnpm packages (TanStack), git-ignored and owned upstream.

## Plans (`.agents/docs/plans/`)

A plan is a contract: frontmatter `status`, decisions with rejected alternatives, phases with commits. Never start, resume, or continue one without the owner's explicit instruction. Completed plans archive flat to `.agents/docs/archive/`.

| File | Status | Subject |
| --- | --- | --- |
| _none live_ | | |

Archived: `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md` (both done, 2026-11-20), `plan-00003-admin-sidebar-followups.md` (done, 2026-11-21), and `plan-00004-ui-audit-remediation.md`, `plan-00005-ui-leftovers-remediation.md`, `plan-00006-webapp-unit-tests.md`, `plan-00007-agent-docs-restructure.md`, `plan-00008-uilibs-stories-by-prop.md` (all done, 2026-11-22) `plan-00009-uilibs-reshaped-props-docs.md` (done 2026-11-24), and `plan-00010-uilibs-playground-controls.md` (done 2026-11-24) are in `.agents/docs/archive/`.

## Issues (`.agents/docs/issues/`)

Findings that outlive a turn. The directory lists only files with `open` or `considering` items.

| File                               | Status                                  | Subject                                                                                                              |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `issue-00001-workspace-hygiene.md` | considering (6 resolved, 1 considering) | Workspace hygiene: everything resolved except the location of domain modules (`modules/` vs `apps/server/modules/`). |
| `issue-00005-data-grid-unread-layout-flags.md` | open (2 open) | Data Grid `tableLayout.rowRounded` and `rowsDraggable` are declared and documented but nothing reads them. |
| `issue-00006-description-list-no-controls.md` | open (1 open) | DescriptionList has no prop that fits the Playground controls rule; its Playground shows no controls. |

## Roadmap (`.agents/docs/roadmap/`)

Parked improvements with a named unlock.

| File | Status | Subject |
| --- | --- | --- |
| `roadmap-00001-parked-verifications.md` | living | Manual checks no code can replace (real screen reader, forced-colors OS mode, physical device) and the community/enterprise edition idea. |

## Handovers (`.agents/docs/handover/`)

Session compactions, `handover-<nnnnn>-<topic>.md`, titled `# Handover: <summary>`. The directory keeps `partial` handovers and the newest one; a `done` handover moves to the archive.

| File | Status | Subject |
| --- | --- | --- |
| `handover-00013-uilibs-playground-controls.md` | done | Plan 00010 closed: controls only in each Playground and every Playground wired, new Data Grid and Kanban Playgrounds, gate 952 to 956, issue-00005 and issue-00006 filed. |

## Audits (`.agents/docs/audit/`)

Point-in-time reviews written by the `deep-audit` or `ui-audit` skill. Live: `audit-00002-ui-uilibs.md` (in_review, 2026-11-22: 15 findings, 5 fixed, 9 open, 1 deferred, awaiting the owner's fix decision). `audit-00001-uilibs.md` (completed, 2026-11-20: 25 findings fixed, F-26 deferred) is in `.agents/docs/archive/`.

## Archive (`.agents/docs/archive/`)

Completed ledger files, moved unchanged (handover titles were rewritten to `# Handover: <summary>` on 2026-11-22): `plan-00001-uilibs-improvement.md`, `plan-00002-webapp-forms-formisch.md`, `plan-00003-admin-sidebar-followups.md`, `plan-00004-ui-audit-remediation.md`, `plan-00005-ui-leftovers-remediation.md`, `plan-00006-webapp-unit-tests.md`, `plan-00007-agent-docs-restructure.md`, `plan-00008-uilibs-stories-by-prop.md`, `plan-00009-uilibs-reshaped-props-docs.md`, `audit-00001-uilibs.md`, `handover-00001-cli-transport-vixum.md`, `handover-00002-uilibs-audit-plan.md`, `handover-00003-uilibs-improvement.md`, `handover-00004-webapp-forms-formisch.md`, `handover-00005-webapp-nav-container-demo.md`, `handover-00006-admin-sidebar-followups.md`, `handover-00007-ui-audit-remediation.md`, `handover-00008-ui-leftovers-remediation.md`, `handover-00009-webapp-unit-tests.md`, `handover-00010-agent-docs-restructure.md`, `handover-00011-uilibs-stories-by-prop.md`, `handover-00012-uilibs-reshaped-props-docs.md`, `plan-00010-uilibs-playground-controls.md`, `issue-00002-stale-e2e-specs.md` (resolved 2026-11-21), `issue-00003-ui-audit-leftovers.md` (resolved 2026-11-22), `issue-00004-data-grid-unread-props.md` (resolved 2026-11-24).
