#!/usr/bin/env bash
# PostToolUse hook: formats the file Claude just edited (Rust with rustfmt, Markdown with rumdl).
# Formatting is best effort: a file that doesn't parse yet, or a missing formatter, never fails the edit.

command -v jq >/dev/null || {
    echo "format hook: install jq" >&2
    exit 1
}

file=$(jq -r '.tool_input.file_path // empty')
root=${CLAUDE_PROJECT_DIR:-$PWD}

# Only touch existing files inside this repository (not memory files, not /tmp).
[[ -n "$file" && -f "$file" && "$file" == "$root"/* ]] || exit 0

case "$file" in
*.rs)
    # rustfmt reads rustfmt.toml from the file's ancestors; direct use skips cargo's metadata pass.
    command -v rustfmt >/dev/null && rustfmt --edition 2024 "$file" 2>/dev/null
    ;;
*.md)
    command -v rumdl >/dev/null && (cd "$root" && rumdl fmt "$file" >/dev/null 2>&1)
    ;;
esac
exit 0
