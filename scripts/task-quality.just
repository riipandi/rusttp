[doc('Format Rust and Markdown')]
[group('quality')]
format:
    @cargo fmt --all
    @rumdl fmt --silent .

[doc('Fail if Rust or Markdown is not formatted')]
[group('quality')]
format-check:
    @cargo fmt --all --check
    @rumdl fmt --check --quiet .

[doc('Type-check every crate and target')]
[group('quality')]
check *args:
    @cargo check --workspace --all-targets {{ args }}

[doc('Run clippy with warnings as errors')]
[group('quality')]
lint *args:
    @cargo clippy --workspace --all-targets {{ args }} -- -D warnings

[doc('Run the tests (nextest when installed)')]
[group('quality')]
test *args:
    @if command -v cargo-nextest >/dev/null; then cargo nextest run --workspace --no-tests=pass {{ args }}; else cargo test --workspace {{ args }}; fi

[doc('Run the Hurl API specs against a running server')]
[group('quality')]
test-api url="http://127.0.0.1:3000":
    @hurl --test --variable base_url={{ url }} --glob 'api/specs/**/*.hurl'

[doc('Run every gate: format, check, lint, test')]
[group('quality')]
verify: format-check check lint test
