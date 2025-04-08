# 🦀 Rusttp

[![(Rust)](https://img.shields.io/badge/rust-v1.80-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/riipandi/rusttp?logo=rust)](https://github.com/riipandi/rusttp/releases)
[![Contribution welcome](https://img.shields.io/badge/Contributions-welcome-gray.svg)](https://github.com/riipandi/rusttp/graphs/contributors)
[![CI Test](https://github.com/riipandi/rusttp/actions/workflows/test.yml/badge.svg)](https://github.com/riipandi/rusttp/actions/workflows/test.yml)
[![CI Release](https://github.com/riipandi/rusttp/actions/workflows/release.yml/badge.svg)](https://github.com/riipandi/rusttp/actions/workflows/release.yml)

---

Minimal Rust starter project template for building application with Axum and Clap.

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

1. Install the required toolchain & SDK: [Rust][install-rust], [Docker][docker], [watchexec][watchexec], [just][just], and [lefthook][lefthook].
2. Create `.env` file or copy from `.env.example`, then configure required variables.
3. Generate application secret key, use this command: `just generate-key`
4. Run project in development mode: `just dev`

Type `just` on your terminal to see available tasks.

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
docker build -f Dockerfile . -t rusttp:latest
```

### List Docker Image

```sh
docker image list --filter reference=rusttp:latest
```

### Testing Container

```sh
docker run --network=host --rm -it --env-file .env --name rusttp rusttp:latest
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

## License

Licensed under either of [Apache License 2.0][license-apache] or [MIT license][license-mit] at your option.

> Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this project by you,
> as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

Copyrights in this project are retained by their contributors.

See the [LICENSE-APACHE](./LICENSE-APACHE) and [LICENSE-MIT](./LICENSE-MIT) files for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Creator Badge](https://badgen.net/badge/icon/Crafted%20by%20Aris%20Ripandi?label&color=black&labelColor=black)][riipandi-x]

[docker]: https://docs.docker.com/engine/install/
[install-rust]: https://www.rust-lang.org/tools/install
[just]: https://just.systems/man/en/
[lefthook]: https://lefthook.dev/installation/index.html
[license-apache]: https://choosealicense.com/licenses/apache-2.0/
[license-mit]: https://choosealicense.com/licenses/mit/
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
[watchexec]: https://github.com/watchexec/watchexec
