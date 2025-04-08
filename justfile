#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

[private]
[doc('Listing available recipes')]
default:
  @just --list --unsorted

[doc('Start development')]
dev:
  @watchexec -r -e rs -- cargo run

[no-exit-message]
[doc('Start the server')]
start *args:
  @target/release/rusttp {{args}}

[doc('Build release mode')]
build:
  @cargo build --release
  @ls -lh target/release

[doc('Build debug mode')]
build-debug:
  @cargo build
  @ls -lh target/debug

[doc('Generate a random secret key')]
generate-key:
  @openssl rand -base64 500 | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

[doc('Format the code')]
format:
  @cargo fmt --all -- --check

[doc('Check the code')]
check:
  @cargo check --manifest-path Cargo.toml --verbose

[doc('Update dependencies')]
deps:
  @cargo update

[doc('Clean up artifacts')]
[confirm("Are you sure you want to cleanup the artifacts?")]
cleanup:
  @npx --yes rimraf build dist tmp target
