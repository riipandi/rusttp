# 🦀 Rusttp

[![(Rust)](https://img.shields.io/badge/rust-v1.80-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/riipandi/rusttp?logo=rust)](https://github.com/riipandi/rusttp/releases)
[![Contribution welcome](https://img.shields.io/badge/Contributions-welcome-gray.svg)](https://github.com/riipandi/rusttp/graphs/contributors)
<!-- [![CI Test](https://github.com/riipandi/rusttp/actions/workflows/ci-test.yml/badge.svg)](https://github.com/riipandi/rusttp/actions/workflows/ci-test.yml) -->
<!-- [![CI Build](https://github.com/riipandi/rusttp/actions/workflows/ci-build.yml/badge.svg)](https://github.com/riipandi/rusttp/actions/workflows/ci-build.yml) -->

---

Rust starter project template for building REST API (or full-stack application). [Built-in features](#built-in-features).

> [!NOTE]
> _This is a template for [cargo-generate](https://cargo-generate.github.io/cargo-generate/)._
> _Read the [documentation](#quick-start) to get started._

## Quick Start

You will need `Rust >=1.80`, `Docker >= 27.5`, and `Docker Compose >= 2.32` installed on your machine.

### Create New Project

Install [`cargo-generate`](https://crates.io/crates/cargo-generate) sub-command then execute:

```sh
cargo generate riipandi/rusttp -b main -n myapp-name
```

> Don't forget to change `myapp-name` with your real application name.

### Up and Running

1. Install the required toolchain & SDK: [Rust][install-rust], [Docker][docker], [cargo-watch][cargo-watch], and [just][just].
2. Create `.env` file or copy from `.env.example`, then configure required variables.
3. Generate application secret key, use this command: `just generate-key`
4. Run project in development mode: `just dev`

Type `just` on your terminal to see available tasks.

### Auto Reload

Whenever the source code changes, the app is recompiled and restarted.

Optionally you can pass additional args to the server, example:

```sh
cargo watch -cx 'run -- --address 127.0.0.1'
```

That command equivalent to: `rusttp --address 127.0.0.1` in release build.

### Built-in features

- [ ] Database integration
  - [ ] SQLx with Postgres
  - [ ] Connection Pooling
  - [ ] Database migration
- [ ] Basic authentication
  - [ ] Signin with email
  - [ ] User registration
  - [ ] Password recovery
  - [ ] Signup email confirmation
- [ ] OAuth2 authentication
  - [ ] Signin with GitHub
  - [ ] Signin with Google
  - [ ] OAuth account linking
- [ ] Configuration from environment variables
- [ ] GitHub actions for CI tests and release
- [ ] Docker build configuration

## Database Migration

This project does not use an ORM, instead using SQLx to interact with database. [SQLx is not an ORM!][sqlx-not-orm]
SQLx also manages and applies changes to the database schema using files called migrations.
If you have multiple developers contributing migrations at the same time, you will need to
install [`sqlx-cli`][sqlx-cli]. Please refer to the [SQLx project page][sqlx-github] for the installation guide.

Using `sqlx-cli` to create database migration file:

```sh
sqlx migrate add -t create_example_table -r --source ./crates/entity/migrations
```

Apply the database migrations:

```sh
sqlx migrate run --source ./crates/entity/migrations/up
```

Revert or reset the database migrations:

```sh
sqlx migrate revert --target-version 0 --source ./crates/entity/migrations/down
```

To ensure the database schema is always reproducible, SQLx also stores the content hash
of applied migrations and checks them against the current contents of the files, so you
must not change migrations that have already been applied.

For more detailed information about the SQLx command type: `sqlx --help`

## Docker Container

### Development Server

```sh
# Start development server
docker-compose -f compose.yaml up -d --remove-orphans

# Stop development server
docker-compose -f compose.yaml down --remove-orphans
```

### Build Container

```sh
docker build -f Dockerfile . -t rusttp
docker image list | grep rusttp
```

### Testing Container

```sh
docker run --rm -it -p 8000:8000 --env-file .env.docker --name rusttp rusttp
```

### Push Images

Sign in to container registry:

```sh
echo $REGISTRY_TOKEN | docker login REGISTRY_URL --username YOUR_USERNAME --password-stdin
```

Replace `REGISTRY_URL` with your container registry, ie: `ghcr.io` or `docker.io`

Push docker image:

```sh
docker push REGISTRY/ORG/rusttp:latest
```

## Deployment

Read [DEPLOY.md](./DEPLOY.md) for detailed documentation.

## Contributions

Welcome, and thank you for your interest in contributing to this project! There are many ways in which you can contribute,
beyond writing code. You can read this repository’s [Contributing Guidelines](./CONTRIBUTING.md) to learn how to contribute.

## References

- [Realworld Axum with SQLx](https://github.com/launchbadge/realworld-axum-sqlx)
- [Back to the server with Rust, Axum, and htmx](https://joeymckenzie.tech/blog/templates-with-rust-axum-htmx-askama)
- [Automated distribution with cargo dist](https://opensource.axo.dev/cargo-dist)

## License

Licensed under either of [Apache License 2.0][license-apache] or [MIT license][license-mit] at your option.

> Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this project by you,
> as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

Copyrights in this project are retained by their contributors.

See the [LICENSE-APACHE](./LICENSE-APACHE) and [LICENSE-MIT](./LICENSE-MIT) files for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Made%20by%20Aris%20Ripandi?icon=bitcoin-lightning&label&color=black&labelColor=black)][riipandi-twitter]

[cargo-watch]: https://github.com/watchexec/cargo-watch
[docker]: https://docs.docker.com/engine/install/
[install-rust]: https://www.rust-lang.org/tools/install
[just]: https://just.systems/man/en/
[license-apache]: https://choosealicense.com/licenses/apache-2.0/
[license-mit]: https://choosealicense.com/licenses/mit/
[riipandi-twitter]: https://twitter.com/intent/follow?original_referer=https://ripandis.com&screen_name=riipandi
[sqlx-cli]: https://github.com/launchbadge/sqlx/tree/main/sqlx-cli
[sqlx-github]: https://github.com/launchbadge/sqlx
[sqlx-not-orm]: https://github.com/launchbadge/sqlx?tab=readme-ov-file#sqlx-is-not-an-orm
