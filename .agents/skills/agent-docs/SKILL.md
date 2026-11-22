---
name: agent-docs
description: >
    The agent docs workflow: plans (.agents/docs/plans), issues (.agents/docs/issues), the roadmap
    (.agents/docs/roadmap), handovers, the index, the core documents (shape, rules, backend, frontend,
    architecture), and the human docs/ tree. Use when the user asks for a plan, an issue, a roadmap entry,
    a handover, an index update, an archive move, or any docs/ change, and when the user runs /agent-docs.
metadata:
    short-description: "The .agents/docs ledger and docs/ workflow"
---

# Agent docs

This file carries the rules; `references/` carries the shapes. Read the matching exemplar before writing that kind of document: its shape is the lesson, its content is not. `AGENTS.md` and the core documents win over this skill.

## Audiences

- **Agent docs**: `AGENTS.md` (root and scoped), `.agents/docs/`. English, technical, `file:line` evidence, no padding. `index.md` is the map; `rules.md` ("Where a fact lives") says which file a fact belongs in.
- **Human docs**: `docs/`. No paths, internals, or agent context; one idea per paragraph. Use the `clarity` skill when available, otherwise `references/docs-tone-example.md`.

## Building the docs from nothing

Read the tree first (layout, entry points, the task runner's real recipes, the test framework, existing docs); write only what you saw. Create `index.md`, `shape.md`, `rules.md`, and `architecture.md`, plus area files (`backend.md`, `frontend.md`) only when the tree has those areas. Ledger directories (`plans/`, `issues/`, `roadmap/`, `handover/`, `audit/`, `archive/`) appear with their first file. A section without verified content says so in one line. Every path `AGENTS.md` names must resolve.

## File naming

Every ledger file is `<kind>-<nnnnn>-<topic>.md` (`plan-00001-workspace-cleanup.md`).

- `<kind>`: `plan`, `issue`, `roadmap`, `handover`, or `audit`, each with its own counter.
- `<nnnnn>`: the highest number of that kind across the live directory and `archive/`, plus one; never reused.
- `<topic>`: two to five lowercase kebab-case words naming the subject (`module-kernel`).
- A file keeps its name for life; archiving moves it unchanged. Refer to it by full name or `<kind>-<nnnnn>`.
- Timestamps live in frontmatter (`created`, `updated`), read with `date -Iseconds`, never guessed. Any edit refreshes `updated`.

## Document kinds

| Kind | Frontmatter | Document `status` | Item / phase `status` |
| --- | --- | --- | --- |
| Plan | `status`, `created`, `updated`, `phases:` (`id`, `title`, `status`, `note`) | `awaiting-approval` · `in-progress` · `done` · `cancelled` (why) | `pending` · `in_progress` · `committed` (hash) · `partially-done` (what moved) · `done` |
| Issue | `status` (rollup), `created`, `updated`, `summary`, `count` | rollup of its items | `open` · `considering` (named trigger) · `resolved` (evidence) · `wontfix` (owner declined; reopen trigger) |
| Roadmap | `status`, `created`, `updated`, `references` | `living` | `parked (unlock: …)` · `taken (plan-<nnnnn>)` · `opened (issue-<nnnnn>)` · `landed (commit)` |
| Handover | `status`, `created`, `plan`, `wave` (omit a key the body cannot name) | `done` · `partial` (open threads named) | — |
| Audit | owned by `deep-audit` (`.agents/skills/deep-audit/references/report-template.md`); `ui-audit` writes the same shape | as defined there | as defined there |

An archived file keeps its last status; its note says where live content went.

## Plans

A contract, written only on request (`references/plan-example.md`): Objective, Current state (verified `file:line`), Decisions (dated, rejected alternatives, cost), Execution rules, Phases (each with a checkable validation and a commit message), Test matrix, Out of scope.

- No placeholder or `TBD` in `awaiting-approval`: every decision is made and dated, or asked.
- Validation is a command, probe, or count, never "works correctly".
- Code plans run in the safe order (`references/refactor-sequence-example.md`): contracts, implementations, callers, tests, cleanup; the riskiest phase names its undo.
- A phase runs only on the owner's go-ahead, which also authorizes its one commit with the plan's message. After the last phase, recommend the closing commit unless the owner already asked for it.
- Mandatory phases: docs sync (`docs/`), agent docs sync, ledger close with handover, final validation; the test matrix is mandatory; E2E is recorded n/a when irrelevant.
- Without an owner grant: migrations are additive and forward-only, and nothing destructive runs without consent in the turn.
- A finished plan moves to `archive/`; its index row moves too.

## Issues

A finding that outlives the turn, filed when found (`references/issue-example.md`). Each item: `status`, `area`, `summary` with `file:line`, `plan`, `trigger`.

- Verify adversarially first: check each claim against the tree and ask what would make it wrong (`references/verification-example.md`). A stale finding is worse than a missing one.
- A file whose items are all terminal archives. Live items may move to a new issue or, when parked improvements, to the roadmap; the archived copy says where.

## Roadmap

Parked work with a named unlock, not work items (`references/roadmap-example.md`): status line, verified evidence, unlock, first move. When the unlock fires, the entry becomes an issue or a plan. Parked ideas live only here, not in `architecture.md`.

## Handovers

Session compactions (`references/handover-example.md`), written at a plan's close or when a session ends mid-work; the `handoff` skill writes one on request.

- Title: `# Handover: <summary>`, what the session closed or left open in about ten words; the time lives in `created`.
- The live directory keeps `partial` handovers and the newest one; a `done` handover archives when a newer one lands. Retitling is the one edit allowed on an archived handover.

## Closing sweep

When a task or phase completes, each line is synced or recorded n/a:

1. The plan: document and phase statuses; archive when done.
2. Issues: touched items flip with date and evidence; all-terminal files archive.
3. Roadmap: taken or unlocked entries move their status.
4. `docs/`: every human page whose subject the diff touched.
5. Agent docs: the file `rules.md` ("Where a fact lives") names, scoped `AGENTS.md`, and the `index.md` rows.
6. The handover, at a plan's close.

## Mechanics

- No hard wrapping: one paragraph, list item, or table row per line.
- Edit one file at a time; never parallel edits on the same file.
- After moving files, grep for dangling references; after a ledger batch, check `count` and the index statuses against the status lines (`grep -c '^- status'`).
- Never name other projects in agent docs.
- Stage explicit paths; never `git add -A`.

## References

| File | Shape |
| --- | --- |
| `references/plan-example.md` | A plan |
| `references/issue-example.md` | An issue rollup with per-item statuses |
| `references/roadmap-example.md` | A roadmap with parked entries |
| `references/handover-example.md` | A handover |
| `references/adr-example.md` | A decision record: context, decision, consequences, rejected alternatives |
| `references/verification-example.md` | The adversarial claim check |
| `references/refactor-sequence-example.md` | The safe change order and its undo |
| `references/acceptance-criteria-example.md` | Requirements, constraints, Given-When-Then, non-goals |
| `references/docs-tone-example.md` | The human-docs tone |
