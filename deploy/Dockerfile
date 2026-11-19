# syntax=docker/dockerfile:1.7

# Distroless tags: `nonroot` (default) or `debug-nonroot` (adds busybox for `just docker-shell`).
ARG DISTROLESS_TAG=nonroot
ARG RUST_VERSION=1.100
ARG NODE_VERSION=26

# -----------------------------------------------------------------------------
# Build the SPA: the server embeds apps/server/frontend (the build manifest,
# the route table, the assets) at compile time, so it must exist first.
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-trixie-slim AS frontend
ENV CI=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true PNPM_HOME=/pnpm PATH="/pnpm:$PATH"
# Keep in sync with `packageManager` in package.json.
ARG PNPM_VERSION=12.21.0
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /usr/src

# The lockfile records every workspace importer, so each packages/*/package.json
# must exist before a frozen install; copying manifests first keeps this layer
# cached across source-only changes.
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --link packages/e2e/package.json packages/e2e/
COPY --link packages/emails/package.json packages/emails/
COPY --link packages/webapp/package.json packages/webapp/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --link packages/webapp packages/webapp
RUN NODE_ENV=production pnpm --filter webapp build

# -----------------------------------------------------------------------------
# Base image for building the Rust application, with tini for the runner.
# -----------------------------------------------------------------------------
FROM rust:${RUST_VERSION}-slim-trixie AS base
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt,type=cache,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean && apt-get update -y \
    && apt-get -yqq --no-install-recommends install curl ca-certificates

# tini reaps zombies and forwards signals, so Ctrl-C and `docker stop` reach the server.
RUN set -eux; \
    TINI_DOWNLOAD_URL="https://github.com/krallin/tini/releases/download/v0.19.0"; \
    case "$(dpkg --print-architecture)" in \
      amd64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini" ;; \
      arm64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini-arm64" ;; \
      *) echo "unsupported architecture"; exit 1 ;; \
    esac; \
    curl -fsSL "${TINI_BIN_URL}" -o /usr/bin/tini; \
    chmod +x /usr/bin/tini
WORKDIR /usr/src

# -----------------------------------------------------------------------------
# Build the server with the SPA embedded.
# -----------------------------------------------------------------------------
FROM base AS builder
COPY --link . .
COPY --link --from=frontend /usr/src/apps/server/frontend apps/server/frontend
RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=cargo-target,target=/usr/src/target \
    cargo build --release --locked -p rusttp-server \
    && strip -s target/release/rusttp-server \
    && mv target/release/rusttp-server /usr/src/rusttp-server

# -----------------------------------------------------------------------------
# Runtime: distroless (glibc, no shell, no package manager), as nonroot.
# -----------------------------------------------------------------------------
FROM gcr.io/distroless/cc-debian13:${DISTROLESS_TAG} AS runner
LABEL org.opencontainers.image.source="https://github.com/riipandi/rusttp"
LABEL org.opencontainers.image.description="Rust modular monolith with a server-rendered React SPA"
LABEL org.opencontainers.image.licenses="Apache-2.0 OR MIT"

COPY --from=base --chown=root:root --chmod=0755 /usr/bin/tini /usr/bin/tini
COPY --from=builder --chown=root:root --chmod=0755 /usr/src/rusttp-server /usr/bin/rusttp-server

ARG BIND_ADDR=0.0.0.0:3000 RUST_LOG=info,memory_serve=warn
ENV BIND_ADDR=$BIND_ADDR RUST_LOG=$RUST_LOG TINI_SUBREAPER=true

USER nonroot:nonroot
EXPOSE 3000/tcp

# No HEALTHCHECK yet: `rusttp-server health` is still a placeholder, and the image has no curl.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["rusttp-server", "serve"]
