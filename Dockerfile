# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG PLATFORM=linux/amd64
ARG RUST_VERSION=1.82

FROM --platform=${PLATFORM} busybox:1.37-glibc as glibc
FROM --platform=${PLATFORM} gcr.io/distroless/cc-debian12:nonroot AS runner
LABEL org.opencontainers.image.source="https://github.com/riipandi/rusttp"
LABEL org.opencontainers.image.documentation="https://github.com/riipandi/rusttp"
LABEL org.opencontainers.image.description="Minimal Rust starter project template for building application with Axum and Clap"
LABEL org.opencontainers.image.authors="Aris Ripandi"
LABEL org.opencontainers.image.vendor="Aris Ripandi"
LABEL org.opencontainers.image.licenses="Apache-2.0 or MIT"

# -----------------------------------------------------------------------------
# Base image for building the application
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} rust:${RUST_VERSION}-slim-bookworm AS base
RUN apt-get update && apt-get -yqq --no-install-recommends install tini
RUN update-ca-certificates
WORKDIR /usr/src

# -----------------------------------------------------------------------------
# Install dependencies and build the application.
# -----------------------------------------------------------------------------
FROM base AS builder
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/src/target cargo build \
  --release && strip -s target/release/rusttp && \
  mv target/release/rusttp . && chmod +x rusttp

# -----------------------------------------------------------------------------
# Cleanup the builder stage and create data directory.
# -----------------------------------------------------------------------------
FROM base AS pruner

# Copy output and config files from the builder stage.
COPY --from=builder /usr/src/rusttp /srv/rusttp

# Create the data directory and set permissions.
RUN mkdir -p /srv/storage/backup /srv/storage/uploads && chmod -R 0775 /srv/storage

# -----------------------------------------------------------------------------
# Use the slim image for a lean production container.
# -----------------------------------------------------------------------------
FROM runner

# Required application environment variables
ARG DATABASE_URL

# Copy the build output files from the pruner stage.
COPY --chown=nonroot:nonroot --from=pruner /srv /srv

# Copy necessary system utilities from previous stage.
COPY --from=base /usr/bin/tini /usr/bin/tini

# To enhance security, consider avoiding the copying of sysutils.
# Additional system utilities for debugging (~9MB).
COPY --from=glibc /bin/hostname /bin/hostname
COPY --from=glibc /bin/whoami /bin/whoami
COPY --from=glibc /bin/clear /bin/clear
COPY --from=glibc /bin/mkdir /bin/mkdir
COPY --from=glibc /bin/which /bin/which
COPY --from=glibc /bin/head /bin/head
COPY --from=glibc /bin/cat /bin/cat
COPY --from=glibc /bin/ls /bin/ls
COPY --from=glibc /bin/sh /bin/sh

# Define the host and port to listen on.
ARG APP_MODE=production HOST=0.0.0.0 PORT=8000
ENV APP_MODE=$APP_MODE NODE_ENV=$APP_MODE
ENV HOST=$HOST PORT=$PORT
ENV TINI_SUBREAPER=true

WORKDIR /srv
ENV PATH="/srv:$PATH"
USER nonroot:nonroot
EXPOSE $PORT/tcp

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["rusttp"]
