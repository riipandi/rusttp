# Agents Instructions

Always-on rules. Detail lives in `.agents/docs/` (map: `index.md`); a scoped `AGENTS.md` in `apps/`, `crates/`, `packages/webapp/`, and `packages/uilibs/` adds its area's must-knows. Before a change, read `.agents/docs/shape.md` (layout, commands) and the section of the area file it touches: `backend.md` (Rust), `frontend.md` (`packages/`), `rules.md` (cross-area), `architecture.md` (decisions).

## Working rules

- Verify behavior in the tree before documenting, testing, or building on it; a declared module, a file, or a doc entry is not proof. A claim in a plan or doc is a hypothesis until the tree confirms it.
- Early-stage project: no backward compatibility, no legacy shims; a replaced name or shape is removed.
- Do not add, remove, or rename a top-level directory unless asked; extend an existing crate, module, or package.
- No new dependency without the owner's approval (`rules.md`, "Dependencies").
- A comment carries what the code cannot (a why, a contract, a trap); never restate the next line.
- Chat follows the user's language. Files, code, identifiers, and commit messages are English.
- Sample data comes from Dan Brown's novels and Harry Potter, never `John Doe`, `foo`, or lorem ipsum (`rules.md`, "Sample data").
- Never print a secret or rewrite a `.env` without consent. The default credentials in `container/` and `.env.example` are development-only by the owner's choice: not findings, never reused outside local dev.
- Never run a migration rollback, database reset, or drop without explicit consent in the same turn.

## Ambiguous decisions

Stop and ask before writing code, migrations, protos, public APIs, or config when the request fits more than one crate, module, schema, or transport; implies an unnamed module, endpoint, job, migration set, config key, or flag; is hard to undo (schema, set name, a module's `api`, wire contract, secret); or needs an invented product rule. A rule the docs already settle is not a question.

Ask in this shape, then wait; if the owner already chose in the thread, do not re-ask (confirm only a delta that new facts cause):

```text
Unclear: <decision> — wrong pick means <cost>.

1. <option> — <consequence>
2. <option> — <consequence>  [recommended: <one reason>]
3. Other — reply with the design you want
```

## Workflow

- **Docs sync.** A change lands its documentation in the same commit; `rules.md` ("Where a fact lives") says which file. Outdated prose is a defect of the change. The `agent-docs` skill carries the closing sweep.
- **Findings.** A finding that outlives the turn goes to `.agents/docs/issues/` when found (`agent-docs`).
- **Plans.** A plan in `.agents/docs/plans/` is a contract; it runs only on the owner's explicit go-ahead, phase by phase.
- **Validation.** Run the gates in `shape.md` ("Commands") before claiming a change works. A server change also needs a probe against a running binary; webapp logic (stores, libraries, schemas) also runs `just test-web`.
- **Library docs.** Check crates and packages against the docs of the locked version (docs.rs, changelogs, Context7, DeepWiki); the locked source wins.
- **Audience.** `.agents/docs/` is for agents (English, `file:line` evidence); `docs/` is for humans (no paths or internals).

## Skills

A skill advises; this file and `.agents/docs/` win. Project skills live in `.agents/skills/` (`.claude/skills` links there).

- `agent-docs`: any ledger or docs work (plan, issue, roadmap, handover, audit, index, `docs/`); `handoff` writes a handover on request.
- `rust-verify-harden`: before a Rust change claims done.
- `deep-audit`: evidence-based audit of a feature or the system; reports go to `.agents/docs/audit/`.
- `security-review`: before an auth, session, crypto, or storage change claims done.
- UI: `emil-design-eng` and `apple-design` when composing; `impeccable` for a polish pass; `clarity` for human prose.

## Git

- Stage explicit paths and check `git status`; never `git add -A` or `git add .`.
- Message: `{feat,fix,docs,refactor,test,chore}[(scope)]: <concise message>`. Never push unasked.
- Commit only when asked; a plan go-ahead covers its phases' commits. Otherwise recommend the message and paths.
- Never `git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, `git commit --no-verify`, or `git push --force`.
