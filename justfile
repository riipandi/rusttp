#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

set dotenv-load

# Kache caches compiler work when installed; `KACHE=false just <recipe>` passes every compile
# through. Disabling keeps the wrapper set: changing it alters Cargo's fingerprints and rebuilds all.
_kache := lowercase(trim(env("KACHE", "true")))
_kache_bin := `command -v kache || true`
export KACHE_DISABLED := if _kache == "false" { "1" } else { env("KACHE_DISABLED", "") }
export RUSTC_WRAPPER := if _kache_bin != "" { "kache" } else { env("RUSTC_WRAPPER", "") }

import 'scripts/task-development.just'
import 'scripts/task-quality.just'
import 'scripts/task-container.just'
import 'scripts/task-utilities.just'
import 'scripts/task-e2e.just'

[private]
default:
    @just --list --unsorted
