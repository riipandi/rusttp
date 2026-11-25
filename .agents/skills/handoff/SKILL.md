---
name: handoff
description: Compact the current conversation into a handover document in the agent ledger so a fresh agent can pick up the work.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handover so a fresh agent can continue without re-reading this session. The `agent-docs` skill owns the ledger rules ("File naming", "Handovers"); this skill applies them.

1. **Name it** `.agents/docs/handover/handover-<nnnnn>-<topic>.md`: the next number across `handover/` and `archive/`, a two-to-five-word kebab-case topic.
2. **Shape it** after `.agents/skills/agent-docs/references/handover-example.md`. Title `# Handover: <summary>` (what the session closed or left open). Frontmatter: `status` (`done` or `partial`), `created` (`date -Iseconds`), and `plan` or `wave` only when the session had them.
3. **Fill it** in English: what the session did and decided, with dates; ledger moves by file name; commits, or the uncommitted paths; each open thread with its file and next action; the trap that bit this session and its correction; suggested skills for the next session, one line each.
4. **Point, don't copy**: reference plans, issues, agent docs, and commits by path or hash.
5. **Redact** secrets, tokens, credentials, and personal data.
6. **Tailor** to the arguments when given: they name the next session's focus.
7. **Close the ledger**: add the row in `.agents/docs/index.md`; move `done` handovers other than the newest to `archive/` unchanged. Do not commit unless asked.
