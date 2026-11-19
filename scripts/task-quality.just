[doc('Format Rust, Markdown, and the frontend packages')]
[group('quality')]
format:
    @cargo fmt --all
    @rumdl fmt --silent .
    @pnpm --silent format

[doc('Fail if Rust, Markdown, or the frontend packages are not formatted')]
[group('quality')]
format-check:
    @cargo fmt --all --check
    @rumdl fmt --check --quiet .
    @pnpm --silent format:check

[doc('Type-check every crate and target')]
[group('quality')]
check *args:
    @cargo check --workspace --all-targets {{ args }}

[doc('Run clippy with warnings as errors, then oxlint on the frontend packages')]
[group('quality')]
lint *args:
    @cargo clippy --workspace --all-targets {{ args }} -- -D warnings
    @pnpm --silent lint

[doc('Run the tests (nextest when installed)')]
[group('quality')]
test *args:
    @if command -v cargo-nextest >/dev/null; then cargo nextest run --workspace --no-tests=pass {{ args }}; else cargo test --workspace {{ args }}; fi

[doc('Run the Hurl API specs against a running server')]
[group('quality')]
test-api url="http://127.0.0.1:3000":
    @hurl --test --variable base_url={{ url }} --glob 'api/specs/**/*.hurl'

[doc('Run the Playwright E2E suite (starts the server and the built SPA unless E2E_BASE_URL is set)')]
[group('quality')]
[positional-arguments]
test-e2e *args:
    @pnpm --filter e2e test "$@"

[doc('Run every gate: format, check, lint, test')]
[group('quality')]
verify: format-check check lint test
