[doc('Format all sources')]
[group('quality')]
format:
    @cargo fmt --all
    @rumdl fmt --silent .
    @pnpm --silent format

[doc('Check formatting')]
[group('quality')]
format-check:
    @cargo fmt --all --check
    @rumdl fmt --check --quiet .
    @pnpm --silent format:check

[doc('Type-check all crates')]
[group('quality')]
check *args:
    @cargo check --workspace --all-targets {{ args }}

[doc('Type-check every package under packages/')]
[group('quality')]
typecheck:
    @pnpm --silent -r --workspace-concurrency=1 typecheck

[doc('Lint with clippy and oxlint')]
[group('quality')]
lint *args:
    @cargo clippy --workspace --all-targets {{ args }} -- -D warnings
    @pnpm --silent lint

[doc('Run Rust tests')]
[group('quality')]
test *args:
    @if command -v cargo-nextest >/dev/null; then cargo nextest run --workspace --no-tests=pass {{ args }}; else cargo test --workspace {{ args }}; fi

[doc('Run the webapp unit tests (Chromium; extra arguments go to Vitest)')]
[group('quality')]
test-web *args:
    @pnpm --silent --filter webapp test {{ args }}

[doc('Open the Vitest UI for the webapp unit tests')]
[group('quality')]
test-web-ui:
    @pnpm --silent --filter webapp test:ui

[doc('Run the webapp unit tests with a coverage report (.output/coverage)')]
[group('quality')]
test-web-coverage:
    @pnpm --silent --filter webapp test:coverage

[doc('Run Hurl API specs')]
[group('quality')]
test-api url="http://127.0.0.1:3000":
    @hurl --test --variable base_url={{ url }} --glob 'api/specs/**/*.hurl'

[doc('Fail when the built SPA entry load passes its budget (build first)')]
[group('quality')]
size:
    @pnpm --silent --filter webapp size

[doc('Run all quality gates')]
[group('quality')]
verify: format-check check lint test
