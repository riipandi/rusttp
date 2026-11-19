# syntax=docker/dockerfile:1

FROM rust:1.100-slim-trixie AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release --locked -p rusttp-server \
    && cp target/release/rusttp-server /usr/local/bin/rusttp-server

FROM debian:trixie-slim
COPY --from=builder /usr/local/bin/rusttp-server /usr/local/bin/rusttp-server
ENV BIND_ADDR=0.0.0.0:3000
EXPOSE 3000
USER nobody
ENTRYPOINT ["rusttp-server"]
CMD ["serve"]
