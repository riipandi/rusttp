---
name: handoff
description: Compact the current conversation into a handover document in the agent ledger so a fresh agent can pick up the work.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handover so a fresh agent can continue without re-reading this session. The `agent-docs` skill owns the ledger rules; this skill only applies them to handovers.

1. **Name it.** `.agents/docs/handover/handover-<nnnnn>-<topic>.md`, numbered and titled per `agent-docs` ("File naming"): next number across `.agents/docs/handover/` and `.agents/docs/archive/`, topic in short kebab-case.
2. **Shape it** after `.agents/skills/agent-docs/references/handover-example.md`. Title: `# Handover: <summary>`, what the session closed or left open. Frontmatter: `status` (`done` or `partial`), `created` (from `date -Iseconds`), `plan` and `wave` only when the session had them — omit a key rather than guess it.
3. **Fill it** in English:
    - What the session did and decided, with dates.
    - Ledger moves: plans, issues, roadmap entries, audits created or flipped, by file name.
    - Commits, or the uncommitted paths when nothing was committed.
    - What stayed open, each with its file and next action; and the trap that bit this session, with the correction.
    - Suggested skills for the next session (e.g. `rust-verify-harden`, `deep-audit`, `agent-docs`), one line each on why.
4. **Point, don't copy.** Reference plans, issues, `.agents/docs/*.md`, commits, and diffs by path; never restate their content.
5. **Redact** secrets, tokens, credentials, and personal data.
6. **Tailor** to the arguments when given: they describe what the next session will focus on.
7. **Close the ledger.** Add or update the Handovers line in `.agents/docs/index.md`; keep `partial` handovers and the newest one in the live directory and move `done` ones unchanged to `.agents/docs/archive/`. Do not commit unless asked.
