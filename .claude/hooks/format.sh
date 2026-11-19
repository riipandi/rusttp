#!/usr/bin/env bash
# Runs after Claude edits a file: formats it if it's Rust.
# A file that doesn't parse yet is left alone; compiling catches it.
command -v jq >/dev/null || {
    echo "format hook: install jq" >&2
    exit 1
}
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
*.rs) cd "$CLAUDE_PROJECT_DIR" && cargo fmt -- --style-edition 2024 "$file" 2>/dev/null ;;
esac
exit 0
