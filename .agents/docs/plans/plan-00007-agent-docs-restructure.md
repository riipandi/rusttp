---
status: in-progress
created: 2026-11-22T14:56:00+07:00
updated: 2026-11-22T14:56:00+07:00
phases:
    - id: 1
      title: Roadmap for parked work (manual verifications, dual edition)
      status: pending
      note: —
    - id: 2
      title: Handover titles and archive policy
      status: pending
      note: —
    - id: 3
      title: Split rules.md into rules, backend, frontend; tighten the core documents
      status: pending
      note: —
    - id: 4
      title: Slim root AGENTS.md and scoped AGENTS.md per area
      status: pending
      note: —
    - id: 5
      title: Refine the agent-docs, handoff, deep-audit, and rust-verify-harden skills
      status: pending
      note: —
    - id: 6
      title: New ui-audit skill
      status: pending
      note: —
    - id: 7
      title: Docs sync (docs/)
      status: pending
      note: —
    - id: 8
      title: Agent docs sync (.agents/docs, AGENTS.md, skills)
      status: pending
      note: —
    - id: 9
      title: Ledger close and handover
      status: pending
      note: —
    - id: 10
      title: Final validation
      status: pending
      note: —
---

# Restructure the agent docs — split rules by area, scope AGENTS.md, refine the skills, add a UI audit skill

## Objective

The owner asked (2026-11-22) for a documentation and instruction structure any agent can work in well: the parked manual verifications move to a roadmap, handover titles carry a summary instead of a timestamp, every rule and instruction gets shorter without losing context, and a UI/frontend audit skill exists. After this plan, an agent working in Rust reads `AGENTS.md`, its scoped `AGENTS.md`, and `backend.md`; an agent working in the webapp or UI library reads `AGENTS.md`, its scoped `AGENTS.md`, and `frontend.md`. The plan changes Markdown only; no code, config, or dependency changes, and `stylex-authoring.md` and `stylex-installation.md` are not touched.

## Current state (verified in the tree, 2026-11-22)

- **One rules file for every area** — `.agents/docs/rules.md` (219 lines) holds 17 contract sections: 8 backend (Dependency direction, Modules, Data, Migrations, Errors and HTTP, Rust code, CLI, Tests), 8 frontend (UI library, Webapp forms, state, tests, bundle, i18n, accessibility, Keyboard shortcuts), Sample data (43 lines), plus "How to change it" and 25 traps mixed across areas.
- **A long root `AGENTS.md`** — 89 lines with a seven-step read order; no scoped `AGENTS.md` exists (`ls apps/*/AGENTS.md crates/AGENTS.md packages/*/AGENTS.md` finds none). `CLAUDE.md` is a shim (`@AGENTS.md`).
- **Section names quoted from outside the core documents** — `AGENTS.md` (12 references), `PRODUCT.md:30` (`rules.md`, "Sample data"), `.agents/skills/rust-verify-harden/SKILL.md` (3), `agent-docs` and `handoff` skills (1 each), `index.md` (5).
- **Handover titles are timestamps** — `# Handover — <date time>` in handovers 00002–00009; 00001 already carries a summary. `created` in the frontmatter already holds the time.
- **Archive policy keeps five** — `agent-docs/SKILL.md` ("Handovers") keeps the five newest live; the live directory holds 00007 (done), 00008 (partial), 00009 (done).
- **Parked work in two places** — `handover-00008` lists three open items not fixable in code (real screen reader, real forced-colors OS mode, physical device); `architecture.md:284-286` ("Parked") holds the community/enterprise edition idea. `roadmap/` does not exist.
- **Another project named** — `architecture.md:134` and `ui-components.md:5` name another project.
- **Skills** — `agent-docs` (112 lines + 9 references), `deep-audit` (127 + 7 references), `handoff` (21), `rust-verify-harden` (71). No UI audit skill; `deep-audit` has no frontend dimension. `.claude/skills` links to `.agents/skills`; `.agents/skills/.gitignore` lists only the pnpm-installed TanStack skills.
- **Domain modules** — `modules/` does not exist on disk (`Cargo.toml:3` members are `apps/*`, `crates/*`); `issue-00001` keeps its location `considering`.

## Decisions

- **D1 (2026-11-22, owner): rules split by area.** `rules.md` keeps the cross-cutting rules (dependency direction, sample data, secrets, ambiguity recipes that span areas, cross-area traps); `backend.md` takes Rust, crates, modules, data, migrations, errors and HTTP, CLI, Rust tests and traps; `frontend.md` takes the UI library, the webapp (forms, state, tests, bundle, i18n, accessibility, shortcuts) and frontend traps. `architecture.md` and `shape.md` stay single files. Cost: section quotes outside the docs move with their section. Rejected: three files kept and only shortened — every agent still reads every area. Rejected: per-domain folders with their own rules and architecture — doubles the files for a small tree.
- **D2 (2026-11-22, owner): slim root plus scoped `AGENTS.md`.** Root `AGENTS.md` targets about 50 lines: always-on rules, ambiguity protocol, git, and the map. Scoped files land in `crates/`, `packages/webapp/`, `packages/uilibs/`, and also `apps/` (the composition root is Rust and would otherwise get no backend pointer). Each scoped file is short: the area's must-know rules and which `.agents/docs/` file to read. Rejected: root only — the detail never arrives on its own. Rejected: root tidied as it is — the read order stays long.
- **D3 (2026-11-22, owner): `ui-audit` is a new project skill.** It covers accessibility (axe sweep, keyboard, names), StyleX token use, i18n (messages, sorted keys), the entry budget, rendered screenshots inspected per state, responsive widths, reduced motion, and forced colors; it writes `audit-<nnnnn>-<topic>.md` with `deep-audit`'s report template and numbering. Rejected: a frontend reference inside `deep-audit` — the stack-specific checks would bloat a stack-agnostic skill. Rejected: its own report format — two audit shapes in one ledger.
- **D4 (2026-11-22, owner): handover title is `# Handover: <summary>`.** The summary names what the session closed or left open, in at most about ten words; the time stays in `created`. All handovers, live and archived, are retitled; this is the one edit the archive's "moved unchanged" rule allows, recorded in the skill. Rejected: em dash form; no separator.
- **D5 (2026-11-22, owner): a `done` handover archives.** The live directory holds `partial` handovers plus the single newest one as the next session's entry point. Rejected: keep five newest; archive every done one without exception.
- **D6 (2026-11-22, owner): one home for parked ideas.** `roadmap-00001` takes the three manual verifications and the dual-edition idea; `architecture.md` drops "Parked". Rejected: leave the edition idea in `architecture.md`.
- **D7 (2026-11-22, owner): concise without losing context.** Every rule, trap, and decision record survives the rewrite (shortened, merged where duplicated, never dropped unless stale and proven so); duplication between `AGENTS.md` and the core documents goes to one home. Each kept sentence carries a contract, a why, or a trap. Other projects are not named. `stylex-authoring.md` and `stylex-installation.md` stay byte-identical.
- **D8 (2026-11-22, owner): plan first.** This plan is committed and waits for the owner's go-ahead.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| Parked work | `roadmap/roadmap-00001-parked-verifications.md` | Four entries, each with evidence, unlock, first move |
| Handover title and archive policy | `agent-docs/SKILL.md`, `references/handover-example.md`, `handoff/SKILL.md` | `# Handover: <summary>`; done archives except the newest |
| Area rules | `rules.md`, `backend.md`, `frontend.md` | Every current contract and trap, in its area |
| Entry points | `AGENTS.md`, `apps/AGENTS.md`, `crates/AGENTS.md`, `packages/webapp/AGENTS.md`, `packages/uilibs/AGENTS.md` | Root always-on rules; scoped area pointers |
| UI audit | `.agents/skills/ui-audit/` | Checklist for this stack, `deep-audit` report template |
| Map | `index.md` | Every core document, skill, and ledger row |

## Execution rules

- **Atomic commit per phase** with the message named in the phase; the owner's go-ahead for a range of phases authorizes those phases' commits and nothing else. After the last phase, recommend the closing commit message.
- **Execution waits for the owner's explicit go-ahead.**
- **No backward compatibility** (early-stage project): old section names and file names are replaced, not aliased.
- **Markdown only.** No code, config, lockfile, or dependency change. `stylex-authoring.md` and `stylex-installation.md` are untouched.
- **Content loss check before each rewrite commit:** every `###` section and every trap of the old file is mapped to its new home (a scratch list under `.amp/in/`, deleted at the end).
- **Stage explicit paths**; never `git add -A`. No push.
- **E2E: n/a** — no runtime change.

## Phases

1. **Roadmap for parked work** — create `roadmap-00001-parked-verifications.md` (screen reader, forced-colors OS mode, physical device, community/enterprise editions), each with evidence, unlock, first move; `handover-00008` flips to `done` pointing at the roadmap; `architecture.md` drops "Parked"; `index.md` gains the roadmap row. Validation: `rumdl check .agents`; `rg -n "Parked" .agents/docs/architecture.md` empty; the four entries match their sources. _Commit: `docs(agents): move parked verifications and the edition idea to roadmap-00001`._
2. **Handover titles and archive policy** — `agent-docs` (naming and "Handovers"), `references/handover-example.md`, and `handoff/SKILL.md` carry `# Handover: <summary>` and D5; handovers 00001–00009 retitled; 00007 and 00008 (done) archive, 00009 stays as the newest; `index.md` rows move. Validation: `grep -h "^# Handover" .agents/docs/handover/*.md .agents/docs/archive/handover-*.md` shows nine `# Handover: <summary>` titles and no timestamp; `ls .agents/docs/handover` shows only 00009. _Commit: `docs(agents): title handovers by summary and archive done handovers`._
3. **Split and tighten the core documents** — `rules.md` → `rules.md`, `backend.md`, `frontend.md` per D1; concision pass over `architecture.md`, `shape.md`, `ui-components.md`, `index.md` per D7; the other-project mentions removed; `updated` refreshed. Validation: the section map shows every old section and trap with a home; the other-project grep empty; `git diff --quiet -- .agents/docs/stylex-*.md`; `rumdl check .`. _Commit: `docs(agents): split rules by area and tighten the core documents`._
4. **Slim root and scoped `AGENTS.md`** — root `AGENTS.md` to about 50 lines per D2; `apps/AGENTS.md`, `crates/AGENTS.md`, `packages/webapp/AGENTS.md`, `packages/uilibs/AGENTS.md`; `PRODUCT.md:30` and other outside quotes point at the new homes. Validation: `wc -l AGENTS.md` ≤ 60; every path and quoted section in every `AGENTS.md` resolves (check script below); `rumdl check .`. _Commit: `docs(agents): slim root AGENTS.md and add scoped AGENTS.md per area`._
5. **Refine four skills** — `agent-docs` (shorter, the new core files, `ui-audit` as an audit owner, the naming and archive rules), `handoff` (D4, D5), `deep-audit` (shorter, points at `ui-audit` for frontend scope), `rust-verify-harden` (points at `backend.md`); references trimmed only where they duplicate the skill. Validation: each `SKILL.md` frontmatter `name` matches its directory; every path in the skills resolves; `rumdl check .agents/skills`. _Commit: `docs(skills): refine agent-docs, handoff, deep-audit, and rust-verify-harden`._
6. **`ui-audit` skill** — `.agents/skills/ui-audit/SKILL.md` plus references for the checklist dimensions per D3; it names the repo's real commands (`pnpm --filter uilibs test`, `just test-web`, `just size`, the Playwright E2E projects) only after checking them in `package.json` and `scripts/*.just`. Validation: every command it names exists (`rg` in `package.json` files and `scripts/`); frontmatter valid; `rumdl check`. _Commit: `feat(skills): add the ui-audit skill for webapp and uilibs audits`._
7. **Docs sync (`docs/`)** — check whether a human page names the agent docs or handovers. Validation: `rg -n -i "agents|handover|rules.md" docs README.md CONTRIBUTING.md`; update or record n/a. _Commit: `docs: <message>` only if something changed._
8. **Agent docs sync** — `index.md` lists the new files, the skills, and the ledger; `AGENTS.md` skill map names `ui-audit`; dangling-reference sweep across the repo. Validation: the check script below exits clean. _Commit: `docs(agents): sync the index and references after the restructure`._
9. **Ledger close and handover** — plan archived, `handover-00010` written with the new title, the previous newest handover archives, index moved. Validation: `ls .agents/docs/plans` empty; the index agrees with `ls`. _Commit: `docs(agents): close plan 00007 and write handover 00010`._
10. **Final validation** — the matrix below over the tree as it stands. _Commit: none if green._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Markdown lint | `rumdl check .` | Clean |
| Format | `pnpm format:check` and `just format-check` | Clean |
| Reference check | Scratch script: every `.agents/docs/*.md`, `AGENTS.md`, and skill path named in tracked Markdown exists; every quoted section (`file` ("Section")) exists as a heading in that file | 0 dangling |
| Content preservation | Scratch section map: each old `rules.md` section and trap → new file and heading | Every row mapped |
| Untouched files | `git diff --quiet 67d339f -- .agents/docs/stylex-authoring.md .agents/docs/stylex-installation.md` and `git diff --stat 67d339f` lists `.md` files only | Exit 0; only Markdown |
| Other projects | `rg -n -i` for the other project's name over `.agents` (outside this plan), `AGENTS.md`, and the scoped `AGENTS.md` files | No match |
| Handover titles | `grep -h "^# Handover" .agents/docs/handover/*.md .agents/docs/archive/handover-*.md` | All `# Handover: <summary>` |
| Skills | `name` in each project `SKILL.md` equals its directory; `.claude/skills/ui-audit` resolves through the symlink | All match |
| Size | `wc -l AGENTS.md`; `wc -w` over `AGENTS.md` and the core documents (`rules`, `backend`, `frontend`, `architecture`, `shape`) against `67d339f` (`AGENTS.md`, `rules`, `architecture`, `shape`: 15949 words; lines mislead, the old `shape.md` held whole paragraphs in one table row) | Root ≤ 60 lines; fewer words than 15949 |
| Code gates | n/a — no code changes; `git diff --stat` proves it | — |
| E2E | n/a — no runtime change | — |

## Explicitly out of scope

- **`stylex-authoring.md`, `stylex-installation.md`** — the owner excluded them.
- **The domain-module location (`issue-00001`)** — stays `considering`; the backend docs describe `modules/` as planned, not present.
- **The pnpm-installed TanStack skills** — owned by their packages and git-ignored.
- **`formatRelative` rounding** — offered earlier, not picked.
