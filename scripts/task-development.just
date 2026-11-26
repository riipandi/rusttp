[private]
app_bin := "rusttp-server"

[doc('Run the dev server with hot reload')]
[group('development')]
[no-exit-message]
dev: email-build
    @pnpm --silent --filter webapp dev

[doc('Run the app CLI, e.g. `just run serve --bind 0.0.0.0:3000`')]
[group('development')]
[no-exit-message]
[positional-arguments]
run *args:
    @cargo run -q -- "$@"

# ---- Build -------------------------------------------------------------------

[doc('Build the SPA and Storybook, then the release binary that embeds them (`STORYBOOK=false` skips Storybook)')]
[group('development')]
build *args: email-build
    @[ "${STORYBOOK:-true}" = false ] || {{ just_executable() }} storybook-build
    @pnpm --silent --filter webapp build
    @cargo build --release {{ args }}
    @ls -lh target/release/{{ app_bin }} | awk '{printf "{{ BOLD + GREEN }}    %s{{ NORMAL }} %s (%s)\n", "Output", $5, $NF}'

[doc('Serve from the release binary')]
[group('development')]
[no-exit-message]
[positional-arguments]
start *args:
    @target/release/{{ app_bin }} serve "$@"

[doc('Update Cargo dependencies')]
[group('development')]
deps *args:
    @cargo update {{ args }}

# ---- Email development -------------------------------------------------------

[doc('Preview email templates')]
[group('email')]
[no-exit-message]
email-dev:
    @pnpm --silent -C packages/emails dev

[doc('Build email templates (`--verbose` lists each)')]
[group('email')]
[no-exit-message]
email-build *args:
    @pnpm --silent -C packages/emails build {{ args }}

[doc('Check email rendering, e.g. `just email-check test-email`')]
[group('email')]
[no-exit-message]
[positional-arguments]
email-check template *args:
    @t="$1"; shift; pnpm --filter emails check "./templates/$t.tsx" "$@"

# ---- Storybook ---------------------------------------------------------------

[doc('Serve Storybook for the UI library on :6006')]
[group('storybook')]
[no-exit-message]
storybook:
    @pnpm --silent --filter uilibs storybook

[doc('Build Storybook into apps/server/storybook (embedded by the server)')]
[group('storybook')]
[no-exit-message]
storybook-build:
    @pnpm --silent --filter uilibs storybook:build

[doc('Serve the built Storybook on port 6006')]
[group('storybook')]
[no-exit-message]
storybook-start:
    @pnpm --silent --filter uilibs storybook:start
