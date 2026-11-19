# syntax=docker/dockerfile:1.7

# Distroless tags: `nonroot` (default) or `debug-nonroot` (adds busybox for `just docker-shell`).
ARG DISTROLESS_TAG=nonroot
ARG RUST_VERSION=1.100

# ------------------------------------------------------------------------------
# Base image: Rust + Node.js and pnpm through Vite+, and tini for the runner.
# ------------------------------------------------------------------------------
FROM rust:${RUST_VERSION}-slim-trixie AS base
ENV DO_NOT_TRACK=1 CI=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV VP_HOME=/opt/vite-plus PNPM_HOME=/pnpm
ENV PATH="/opt/vite-plus/bin:$PNPM_HOME:$PATH"
ENV VP_NODE_MANAGER=yes VP_PM_MANAGER=yes

# Keep in sync with `packageManager` in package.json.
ARG NODE_VERSION=26.13
ARG PNPM_VERSION=12.21.0
ARG VP_VERSION=1.7.0

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt,type=cache,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean && apt-get update -y \
    && apt-get -yqq --no-install-recommends install curl unzip ca-certificates \
    && update-ca-certificates

# The Vite+ CLI manages both the Node.js runtime and pnpm (shims in $VP_HOME/bin);
# explicit versions keep this layer deterministic. CI=true keeps the installer quiet.
SHELL ["/usr/bin/bash", "-c"]
RUN curl -fsSL https://vite.plus | VP_VERSION=${VP_VERSION} bash \
    && vp env install ${NODE_VERSION} pnpm@${PNPM_VERSION} \
    && vp env current

# tini reaps zombies and forwards signals, so `docker stop` reaches the server.
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

# ------------------------------------------------------------------------------
# Install dependencies, build the SPA, then the server that embeds it.
# ------------------------------------------------------------------------------
FROM base AS builder

# The lockfile records every workspace importer, so each packages/*/package.json
# must exist before a frozen install; copying manifests first keeps the
# dependency layers cached across source-only changes.
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --link packages/e2e/package.json packages/e2e/
COPY --link packages/emails/package.json packages/emails/
COPY --link packages/webapp/package.json packages/webapp/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts \
    --frozen-lockfile --stream

COPY --link . .

# Emails and the SPA first: the server reads apps/server/emails and embeds apps/server/frontend.
RUN NODE_ENV=production pnpm --filter emails build \
    && NODE_ENV=production pnpm --filter webapp build

RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=cargo-target,target=/usr/src/target \
    cargo build --release --locked -p rusttp-server \
    && strip -s target/release/rusttp-server \
    && mv target/release/rusttp-server /usr/src/rusttp-server

# ------------------------------------------------------------------------------
# Prune: only the binary and the data directories the runner needs.
# ------------------------------------------------------------------------------
FROM base AS pruner
COPY --from=builder /usr/src/rusttp-server /srv/rusttp-server

# The data directories; "others" may write because a container can run as an arbitrary uid.
RUN mkdir -p /srv/storage/{backup,logs,uploads} && chmod -R 0775 /srv/storage

# ------------------------------------------------------------------------------
# Runtime: distroless (glibc, no shell, no package manager), as nonroot.
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/cc-debian13:${DISTROLESS_TAG} AS runner
LABEL org.opencontainers.image.source="https://github.com/riipandi/rusttp"
LABEL org.opencontainers.image.description="Rust modular monolith with a server-rendered React SPA"
LABEL org.opencontainers.image.licenses="Apache-2.0 OR MIT"

COPY --from=base --chown=root:root --chmod=0755 /usr/bin/tini /usr/bin/tini
COPY --from=pruner --chown=nonroot:nonroot /srv /srv

ARG BIND_ADDR=0.0.0.0:3000 LOG_LEVEL=info TZ=UTC
ENV BIND_ADDR=$BIND_ADDR LOG_LEVEL=$LOG_LEVEL TZ=$TZ TINI_SUBREAPER=true
ENV PATH="/srv:/usr/bin:/busybox:$PATH"

WORKDIR /srv
VOLUME /srv/storage
USER nonroot:nonroot
EXPOSE 3000/tcp

# No HEALTHCHECK yet: `rusttp-server health` is still a placeholder, and the image has no curl.

# SHELL: /busybox/sh
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["rusttp-server", "serve"]
