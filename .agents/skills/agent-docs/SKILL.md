---
name: agent-docs
description: >
    The documentation-ledger workflow: drafting plans (.agents/docs/plans), filing and reconciling issues
    (.agents/docs/issues), curating the roadmap (.agents/docs/roadmap), writing handovers, keeping
    .agents/docs/index.md and the core documents (shape, rules, architecture) in sync, and maintaining the
    human-facing docs/ tree. Use when the user asks for a plan, an issue, a roadmap entry, a handover, an index
    update, or any docs/ change — and when the user runs /agent-docs.
metadata:
    short-description: "The .agents/docs ledger and docs/ workflow"
---

# Agent docs — the documentation ledger workflow

This file carries the rules; the exemplars in `references/` carry the shapes — read the matching one before writing that kind of document. The root `AGENTS.md` and the core documents win over anything here. The exemplars' shape is the lesson; their content is not prescriptive.

## The two audiences

- **`.agents/docs/` is for agents** — English, technical, `file:line` evidence, no padding. `index.md` is the map; `shape.md` holds layout, toolchain, and commands; `rules.md` holds contracts and traps; `architecture.md` holds reasoning and decision records.
- **`docs/` is for humans** — no paths, internals, or agent context. Concise GFM, one idea per paragraph. When the `clarity` skill is available it is mandatory before writing or rewriting any tree document; otherwise follow `references/docs-tone-example.md`.

## Building the ledger from nothing

When `.agents/docs/` is missing or incomplete, build it from facts, not invention:

1. Read the tree first — layout, entry points, the commands the task runner actually defines, the test framework, existing docs. A command not seen in a script and a package not seen on disk are not written down as fact.
2. Create only `index.md`, `shape.md`, `rules.md`, and `architecture.md`. Directories (`plans/`, `issues/`, `roadmap/`, `handover/`, `audit/`, `archive/`) appear when their first file does.
3. A section without verified content says so in one line; it never invents contracts, commands, or decisions.
4. Never contradict `AGENTS.md`; every path it names must resolve once the ledger lands.

## File naming

Every ledger file is `<kind>-<nnnnn>-<topic>.md` — e.g. `plan-00001-workspace-cleanup.md`, `issue-00003-session-leak.md`.

- `<kind>` is `plan`, `issue`, `roadmap`, `handover`, or `audit`; each kind has its own counter.
- `<nnnnn>` is five digits, zero-padded: the highest existing number of that kind across the live directory and `.agents/docs/archive/`, plus one. Never reused.
- `<topic>` is two to five words, lowercase kebab-case ASCII, naming the subject (`module-kernel`, not `implement-the-new-module-kernel`).
- A file keeps its name for life; archiving moves it unchanged.
- Reference other ledger files by full name, or `<kind>-<nnnnn>` when the kind is obvious.
- Timestamps live in the frontmatter (`created`, `updated`), read with `date -Iseconds`, never guessed or derived from the name. `updated` is the last time the file's claims were true; any edit refreshes it.

## Document kinds

| Kind | Required frontmatter | Document `status` | Item / phase `status` |
| --- | --- | --- | --- |
| Plan (`plans/`) | `status`, `created`, `updated`, `phases:` (each `id`, `title`, `status`, `note`) | `awaiting-approval` · `in-progress` · `done` · `cancelled` (note names why) | `pending` · `in_progress` · `committed` (hash in note) · `partially-done` (note names what moved) · `done` |
| Issue (`issues/`) | `status` (rollup), `created`, `updated`, `summary`, `count` (items listed) | rollup of its items | `open` · `considering` (parked with a named trigger) · `resolved` (evidence named) · `wontfix` (owner declined; trigger to reopen) |
| Roadmap (`roadmap/`) | `status`, `created`, `updated`, `references` | `living` | per entry: `parked (unlock: …)` · `taken (plan-<nnnnn>)` · `opened (issue-<nnnnn>)` · `landed (commit)` |
| Handover (`handover/`) | `status`, `created`, `plan`, `wave` — omit a key the body cannot name | `done` · `partial` (open threads named) | — |
| Audit (`audit/`) | owned by the `deep-audit` skill (`.agents/skills/deep-audit/references/report-template.md`) | as defined there | as defined there |

An archived file keeps its last status; the archive note says where live content went.

## Plans

A plan is a contract, written only on the owner's request. Shape (`references/plan-example.md`): Objective, Current state (verified `file:line` facts), Decisions (dated, with rejected alternatives and the cost of the pick), Execution rules, Phases (each with an objective validation line and a commit message), Test matrix, Explicitly out of scope.

- `awaiting-approval` carries no placeholder: every decision is made and dated, or explicitly asked. No `TBD`.
- Validation is checkable — a command, a probe, a count — never "works correctly".
- Code plans run in the safe order: contracts and types, implementations, callers, tests, cleanup (`references/refactor-sequence-example.md`). The riskiest phase names its undo.
- Execution rules: a phase runs only on the owner's explicit go-ahead ("continue with phase N"). That go-ahead also authorises the phase's one atomic commit with the plan-named message; nothing else is committed unasked. After the last phase, recommend the closing commit message instead of committing it. The final-validation phase and the test matrix are mandatory; E2E is recorded n/a when irrelevant.
- Project policy (migration style, resets, deprecation windows) comes from the owner's standing rules, not from this skill. Without a grant: migrations are additive and forward-only, and no destructive operation runs without consent in the turn.
- A completed plan moves unchanged to `.agents/docs/archive/`; the index row moves with it.

## Issues

A finding that outlives the turn lands here when found (`references/issue-example.md`). Each item carries `status`, `area`, `summary` with `file:line` evidence, `plan`, and `trigger`.

- Verify adversarially before writing: check every claim against the tree and ask what would make it wrong (`references/verification-example.md`). A stale finding is worse than a missing one.
- A file whose items are all terminal moves to the archive. Live items may be re-homed into a new issue file, or moved to the roadmap when they are parked improvements; the archived copy names where they went.

## Roadmap

Parked improvements, not work items (`references/roadmap-example.md`). Each entry carries its status line, verified evidence, the unlock that fires it, and a first move. When the unlock fires, the entry becomes an issue or a plan.

## Handovers

Session compactions (`references/handover-example.md`). Write one directly at a plan's close or when a session ends mid-work; the `handoff` skill does the same when the owner invokes it. The live directory keeps the five newest; older ones move to the archive.

## Docs sync and the closing sweep

A change that lands a behavior lands its documentation in the same change: contract or trap → `rules.md`; layout, toolchain, or command → `shape.md`; decision or reasoning → `architecture.md`; a shipped endpoint → `api/specs/<area>/*.hurl` (and `api/connect/*.proto` for RPC) and `docs/`; the map → `index.md`.

When a task or plan phase completes, walk this checklist; each line is either synced or recorded n/a:

1. The plan — document and phase statuses; archive when done.
2. Issues — every touched item flips with date and evidence; all-terminal files archive.
3. Roadmap — entries taken or unlocked move their status line.
4. `docs/` — every human-facing page whose subject the diff touched.
5. Core documents — `shape.md`, `rules.md`, `architecture.md`, and the `index.md` rows.
6. The handover — at a plan's close.

## Mechanics

- No hard wrapping: one paragraph, list item, or table row per line.
- Never run parallel edits on the same file; edit sequentially.
- After moving files, grep for dangling references; after a ledger batch, check that `count` and the index's status columns match the status lines (`grep -c '^- status'`).
- Stage explicit paths; never `git add -A`.

## References

| File | Shape it shows |
| --- | --- |
| `references/plan-example.md` | A full plan |
| `references/issue-example.md` | An issue rollup with per-item statuses |
| `references/roadmap-example.md` | A roadmap document with parked entries |
| `references/handover-example.md` | A handover |
| `references/adr-example.md` | A decision record: context, decision, consequences both sides, rejected alternatives |
| `references/verification-example.md` | The adversarial claim check |
| `references/refactor-sequence-example.md` | The safe change sequence and its undo |
| `references/acceptance-criteria-example.md` | Requirements, constraints, Given-When-Then criteria, non-goals |
| `references/docs-tone-example.md` | The human-docs tone |
