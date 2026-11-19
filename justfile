#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

set dotenv-load

import 'scripts/task-development.just'
import 'scripts/task-quality.just'
import 'scripts/task-container.just'
import 'scripts/task-utilities.just'

[private]
default:
    @just --list --unsorted
