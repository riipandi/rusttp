# Agents Instructions

This file holds the workflow rules, always in force; the detail — the repository's shape, toolchain, contracts, and reasoning — lives in `.agents/docs/`. Read in this order:

1. This file — behavioral rules and workflow.
2. `.agents/docs/index.md` — the documentation map.
3. `.agents/docs/shape.md` — the repository's shape: the layout, the toolchain, the commands. Read once, return when a path or a command is needed.
4. `.agents/docs/rules.md` — the detailed rules: contracts, how-to-change recipes, traps. Read the section a change touches before touching it.
5. `.agents/docs/architecture.md` — the architecture and its decision records. Read the relevant section before changing a crate or module.
6. `.agents/docs/ui-components.md` — the inventory of `packages/uilibs` (components, import paths, primitives). Read it before adding or changing a UI component.
7. `.agents/docs/stylex-authoring.md` — how to write StyleX styles; read it before writing or editing any `*.stylex.ts` or `stylex.props` call. `.agents/docs/stylex-installation.md` — StyleX build setup; read it only when changing the compiler pipeline (`packages/plugins/src/stylex.ts`, a consumer's Vite config).

## Working rules

- Verify behavior in the code before documenting, testing, or building on it; a declared module, a file, or a doc entry is not proof that the behavior exists.
- Do not add, remove, or rename a top-level directory unless asked; extend an existing crate or module.
- Do not add a dependency without the owner's approval; when approved, declare it once in `[workspace.dependencies]` with the full `"x.y.z"` version (no `=` prefix) and only the features the code uses (no tokio `full`; `default-features = false` when the defaults pull in unused parts).
- No self-evident comments: a comment must carry what the code cannot (a why, a contract, a trap), never restate what the next line already says.
- Chat follows the user's language. Files, code, identifiers, and commit messages are English.
- UI components live in `packages/uilibs` and are styled with StyleX only: reuse a component from the index before writing one, take every color, size, and motion value from `src/styles/` tokens, and follow `stylex-authoring.md` (no `className` or raw `style` beside `stylex.props`, no top-level pseudo-classes or media queries, no non-StyleX imports in a style). A control takes `size` and composes `controlBase` or `controlPress` (`stylex-authoring.md`, "Controls"), a built-in string is a `labels` prop, and a new story passes the a11y gate (`pnpm --filter uilibs test`).
- Sample data (fixtures, test values, previews, stories, placeholder copy and labels) is drawn from Dan Brown's novels and Harry Potter, never from `John Doe`, `foo`, or lorem ipsum; `.agents/docs/rules.md` ("Sample data") has the details.

## Skills

A skill advises; the rules in this file and `.agents/docs/` still win. Project skills live in `.agents/skills/` (`.claude/skills` is a symlink to it); the others are used when the agent environment provides them.

- **The documentation ledger** — `agent-docs` for every piece of ledger work: a plan, an issue, a roadmap entry, a handover, an audit, an index update, or a `docs/` change. Read the matching exemplar in its `references/` folder before writing that kind of document.
- **Rust quality** — `rust-verify-harden` before claiming a Rust change is done: the quality gates, then the leak/deadlock/race/boundary pass over the touched code.
- **Audits** — `deep-audit` for an evidence-based review of a feature or the whole system; reports go to `.agents/docs/audit/`.
- **Security** — `security-review` before an auth, session, crypto, or storage change claims done.
- **Frontend UI** (`packages/webapp`, `packages/uilibs`) — `emil-design-eng` and `apple-design` when composing UI; `impeccable` for a design review or polish pass.
- **Prose** — `clarity` before writing or rewriting a tree document; `handoff` for handovers.

## Ambiguous decisions

Stop and confirm before writing code, migrations, protos, public APIs, or config when scope, system design, or an architecture choice is unclear. Do not pick a design silently and ship it.

Ask when any of these is true:

- The request fits more than one crate, module, schema, or transport.
- A new module, endpoint, job, migration set, config key, or feature flag is implied but not named.
- `.agents/docs/architecture.md` and this file leave more than one valid shape.
- The change would be hard to undo (schema, migration set name, public `api` of a module, wire contract, secret).
- You would have to invent a product rule (who can call it, what is stored, what is async).

Do not ask about rules the docs already settle — check `.agents/docs/rules.md` first; a settled rule is not a question.

How to ask:

1. One line: what is unclear and what breaks if the wrong option ships.
2. A numbered list of concrete options (usually 2–4). Each option is a design, not a vibe.
3. Mark exactly one option `recommended` with one sentence of why.
4. Always add a final free-input option.
5. Wait. Do not implement, generate, or migrate until the owner picks.

```text
Unclear: <decision> — wrong pick means <cost>.

1. <option> — <one-line consequence>
2. <option> — <one-line consequence>  [recommended: <one reason>]
3. <option> — <one-line consequence>
4. Other — reply with the design you want
```

If the owner already chose in the same thread, do not re-ask. If new facts change the choice, confirm the delta only.

## Workflow

- **Verify before claiming.** A claim about the codebase needs a file you read; a command needs a recipe or tool you saw. A plan's or doc's claim is a hypothesis until the tree confirms it.
- **Issues.** A finding that outlives the turn goes to `.agents/docs/issues/issue-<nnnnn>-<topic>.md` (sequential per kind, see the `agent-docs` skill, "File naming") when found, not to chat memory. The `agent-docs` skill carries the shape and the status vocabulary.
- **Docs sync.** A change that lands a behavior lands its documentation in the same turn: contract or invariant → `.agents/docs/rules.md`; reasoning or decision record → `.agents/docs/architecture.md`; layout, toolchain, or command → `.agents/docs/shape.md`; a UI component added, removed, or renamed in `packages/uilibs` → `.agents/docs/ui-components.md`; a shipped endpoint → `api/specs/<area>/*.hurl` (and `api/connect/*.proto` for RPC) and `docs/`. Outdated prose is a defect of the change. Every completed task runs the closing sweep the `agent-docs` skill carries.
- **Validation.** Run the gates in `.agents/docs/shape.md` (format, check, clippy, tests) before claiming a change works; a green unit suite does not exercise the composition root, so a server change also needs a probe against a running binary.
- **Plans.** A plan (`.agents/docs/plans/`) is a contract with a fixed shape; it executes only on the owner's explicit instruction, phase by phase.
- **Prose.** `.agents/docs/` is for agents: English, technical, `file:line` evidence. `docs/` is for humans: no paths, internals, or agent context.
- **Library docs.** Check external crates against current docs (docs.rs for the version in `Cargo.lock`, doc.rust-lang.org, changelogs) via whatever tool the environment provides (Context7, DeepWiki, web fetch). The locked source is the pinned truth — code wins over docs.
- **Secrets.** Never print a secret; never rewrite a `.env` file without consent.
- **Destructive operations.** Never run a migration rollback, database reset, or drop without explicit consent in the same turn.

## Git

- Stage explicit paths. Check `git status`. Never `git add -A` or `git add .`.
- Message: `{feat,fix,docs,refactor,test,chore}[(scope)]: <concise message>`. Do not push.
- Do not commit unless this turn asked for it; a plan's "continue with phase N" go-ahead covers that phase's one commit. When the work is finished, recommend the one-line message and list the paths.
- Never run `git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, `git commit --no-verify`, or `git push --force`.

## Related docs

The full map is `.agents/docs/index.md`; the entries this file names — shape, rules, architecture, issues, plans, roadmap, audits, handovers — live under `.agents/docs/`.
