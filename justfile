#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

[private]
[doc('Listing available recipes')]
default:
  @just --list --unsorted

[doc('Start development')]
dev *args:
  @watchexec -r -e rs -- cargo run {{args}}

[no-exit-message]
[doc('Run the application')]
run *args:
  @target/release/rusttp {{args}}

[doc('Build the application')]
build *args:
  @cargo build {{args}}

[doc('Format the code')]
format *args:
  @cargo fmt --all -- --check {{args}}

[doc('Check the code')]
check *args:
  @cargo check --manifest-path Cargo.toml {{args}}

[doc('Update dependencies')]
deps *args:
  @cargo update {{args}}

[doc('Generate secret key')]
generate-key:
  @openssl rand -base64 500 | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

[doc('Clean up artifacts')]
[confirm("Are you sure you want to cleanup the artifacts?")]
cleanup:
  @npx --yes rimraf build dist tmp target
