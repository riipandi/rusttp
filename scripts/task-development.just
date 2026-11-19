[private]
app_bin := "rusttp-server"

[doc('Run the server and restart it on every code change')]
[group('development')]
[no-exit-message]
[positional-arguments]
dev *args:
    @watchexec -r -e rs,toml -- cargo run -- serve "$@"

[doc('Run the app CLI, e.g. `just run serve --bind 0.0.0.0:3000`')]
[group('development')]
[no-exit-message]
[positional-arguments]
run +args:
    @cargo run -q -- "$@"

[doc('Build the server in release mode')]
[group('development')]
build *args:
    @cargo build --release {{ args }}
    @ls -lh target/release/{{ app_bin }} | awk '{printf "{{ BOLD + GREEN }}    %s{{ NORMAL }} %s (%s)\n", "Output", $5, $NF}'

[doc('Start the server from the release build')]
[group('development')]
[no-exit-message]
[positional-arguments]
start *args:
    @target/release/{{ app_bin }} serve "$@"

[doc('Update dependencies')]
[group('development')]
deps *args:
    @cargo update {{ args }}
