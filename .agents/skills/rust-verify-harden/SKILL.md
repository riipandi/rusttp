---
name: rust-verify-harden
description: >-
    Run the Rust quality gates (cargo fmt/check/clippy/test, or their just recipes) and fix failures, then audit
    the changed and related Rust code for resource leaks, deadlock risk, data races, module-boundary violations,
    and hot-path waste, applying low-risk fixes. Use when the user asks to verify build quality gates, prep Rust
    code for merge/release, or audit concurrency/memory safety. Verify fixes against current docs (docs.rs,
    doc.rust-lang.org, crate changelogs), not memory.
---

# Rust Verify & Harden

Run the quality gates, fix what fails, then do a focused safety and performance pass on the code the change touched. The project's contracts in `.agents/docs/rules.md` (dependency direction, modules, data, migrations, Rust code) win over anything here.

## Sources of truth

- Check current documentation before applying a fix you are not certain of: docs.rs for crate APIs (match the version in `Cargo.lock`), doc.rust-lang.org for the language, std, and edition guide, the Clippy lint list for lint rationale, and the crate's changelog for deprecations.
- Use whatever fetch/search tool the runtime provides (DeepWiki MCP, web fetch, `cargo doc --open` locally). If none is available, say which claims rest on memory.
- When documentation conflicts with memory or with existing code, documentation wins; note the source in the summary.

## Phase 1 — Quality gates

Run the gates listed in `.agents/docs/shape.md` ("Commands"): format, check, lint, test, and feature combinations when `cargo-hack` is installed. If a gate has no command there, say so and skip it — never invent a replacement, and do not install a tool unasked.

Fixing rules:

1. **Check fails** — find the root cause (type error, trait bound, API change). For a crate API change, read the crate's changelog or docs.rs for the locked version before editing.
2. **Clippy fails** — fix the code. `#[allow(...)]` only when the lint is genuinely wrong for this case, with a one-line comment saying why. Remember `-D warnings` turns `missing_docs` warnings into errors: document public items instead of silencing the lint.
3. **Test fails** — fix the bug, not the assertion.
4. **Workspace hygiene** (flag, fix if trivial): a crate missing `[lints] workspace = true`; a dependency version written in a member instead of `[workspace.dependencies]`; a crate on disk that `[workspace] members` does not include.

Edition 2024 rules to enforce in new or changed code:

- Every unsafe operation sits in an explicit `unsafe {}` block, even inside `unsafe fn`; `extern` blocks are `unsafe extern`.
- `gen` is a reserved keyword.
- Watch tail-expression temporaries and `if let` scrutinee drop order (they changed in 2024) when a lock guard or borrow is involved.

Error handling in non-test code: no `.unwrap()` / `.expect()` unless the panic is a true invariant, marked `// INVARIANT: ...`. Keep `unsafe` minimal, with a `// SAFETY: ...` comment, and list it in the summary.

## Phase 2 — Deep analysis

Scope: files changed in Phase 1 plus their direct callers and callees.

1. **Resource leaks** — `Rc`/`Arc` cycles without `Weak`; `mem::forget` / `Box::leak` without reason; unbounded `Vec`/`HashMap`/channel growth in long-lived tasks; detached `tokio::spawn` whose `JoinHandle` is dropped. Every background task must be tracked (`TaskTracker`/`JoinSet`) and stop on the shutdown `CancellationToken`.
2. **Deadlocks** — a `std::sync::Mutex` / `RwLock` guard held across `.await`; nested locks taken in inconsistent order; a lock held while calling back into code that may take it again; blocking I/O or CPU-heavy work on the async executor (use `spawn_blocking`).
3. **Races** — `unsafe impl Send/Sync` without proof; `static mut`; check-then-act on shared state or on the database (prefer a single SQL statement, a row lock, or a unique constraint over read-then-write). Run `cargo miri test` only on crates with `unsafe` and only if miri is installed. Use `loom` only if it is already a dev-dependency.
4. **Database** — a transaction held across unrelated `.await`s or external calls; a pool connection acquired and kept for the life of a task; N+1 queries in a loop.
5. **Module boundaries** (see `.agents/docs/rules.md`) — a module importing another module's non-`api` items; a framework crate depending on a module; a query touching another module's schema; DDL inside a domain module.

Apply a fix only when it is local and low-risk, with one line of reasoning. Report instead of fixing anything that changes behavior, ownership structure, or public API.

## Phase 3 — Performance pass

Same scope. Look for needless `clone()` / `to_string()` on hot paths, `Vec` / `String` growth with a known size (`with_capacity`), repeated allocation inside loops, `collect()` only to iterate again, and accidental O(n²) work. Do not claim a speedup without a measurement (a benchmark or a before/after timing); otherwise list it as an opportunity.

## Phase 4 — Close out

1. Re-run every gate from Phase 1; all must pass.
2. Summarize, in the user's language:
    - **Files changed**, each with its reason.
    - **Issues found** by category (leak, deadlock, race, database, boundary, perf), with `file:line`.
    - **Fixes applied**, one line each, with the documentation consulted.
    - **Remaining `unwrap` / `expect` / `unsafe`**, each justified or flagged.
    - **Not fixed**: risky or design-level findings and why.
    - **Gates skipped** and why.

## Rules

- Stay in scope: Phase 1 files plus direct neighbors. Anything else is a recommendation.
- Do not add dependencies or install tools unless the user approves.
- Do not commit or push unless asked.
