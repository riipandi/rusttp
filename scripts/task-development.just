[private]
app_bin := "rusttp-server"

[doc('Run the dev server with hot reload')]
[group('development')]
[no-exit-message]
dev:
    @pnpm --silent --filter webapp dev

[doc('Run the app CLI, e.g. `just run serve --bind 0.0.0.0:3000`')]
[group('development')]
[no-exit-message]
[positional-arguments]
run *args:
    @cargo run -q -- "$@"

# ---- Build -------------------------------------------------------------------

[doc('Build the SPA, then the release binary that embeds it')]
[group('development')]
build *args:
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
    @pnpm --silent --filter emails dev

[doc('Build email templates')]
[group('email')]
email-build:
    @pnpm --silent --filter emails build

[doc('Check email client support, e.g. `just email-check password-reset`')]
[group('email')]
[no-exit-message]
[positional-arguments]
email-check template *args:
    @t="$1"; shift; pnpm --filter emails check "./templates/$t.tsx" "$@"
