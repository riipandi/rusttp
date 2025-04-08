#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

[private]
[doc('Listing available recipes')]
default:
  @just --list --unsorted

[doc('Start development')]
dev:
  @cargo watch -i lib -x 'run --features reload'

[doc('Build release mode')]
build:
  @cargo build --release

[doc('Build debug mode')]
build-debug:
  @cargo build

[doc('Generate a random secret key')]
generate-key:
  @openssl rand -base64 500 | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

[doc('Format the code')]
format:
  @cargo fmt --manifest-path Cargo.toml --verbose

[doc('Check the code')]
check:
  @cargo fmt --manifest-path Cargo.toml --verbose

[doc('Clean up artifacts')]
[confirm("Are you sure you want to cleanup the artifacts?")]
cleanup:
  @npx --yes rimraf build dist tmp target
