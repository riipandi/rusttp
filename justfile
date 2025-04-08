#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

# TODO: get app name and version from Cargo.toml

[private]
app_identifier := "rusttp"

[private]
app_version := "0.0.0"

[private]
app_image := "ghcr.io/riipandi/rusttp"

[private]
default:
  @just --list --unsorted

#----- Development and Build tasks --------------------------------------------

[doc('Prepare the environment')]
prepare:
  @lefthook install || true

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

[doc('Tests the application')]
test *args:
  @cargo test {{args}}

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

#----- Docker related tasks ---------------------------------------------------

[doc('Start the development environment')]
compose-up:
  @docker compose -f compose.yaml up --detach --remove-orphans

[doc('Stop the development environment')]
compose-down:
  @docker compose -f compose.yaml down --remove-orphans

[doc('Cleanup the development environment')]
compose-cleanup:
  @docker compose -f compose.yaml down --remove-orphans --volumes

[doc('Build the Docker image')]
docker-build *args:
  @docker build -f Dockerfile . -t {{app_image}}:{{app_version}} {{args}}
  @docker image list --filter reference={{app_image}}:*

[doc('Run the Docker image')]
docker-run *args:
  @docker run --network=host --rm -it --env-file .env {{app_image}}:{{app_version}} {{args}}

[doc('Run the Docker image')]
[no-exit-message]
docker-shell:
  @docker run --network=host --rm -it --env-file .env --entrypoint /bin/sh {{app_image}}:{{app_version}}

[doc('Get Docker image list')]
docker-images:
  @docker image list --filter reference={{app_image}}:*

[doc('Push the Docker image')]
docker-push:
  @docker push {{app_image}}:{{app_version}}
