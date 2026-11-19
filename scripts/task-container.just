[private]
compose_file := "container/compose.yaml"

[private]
app_image := "ghcr.io/riipandi/rusttp"

[private]
app_version := `sed -n 's/^version = "\(.*\)"/\1/p' Cargo.toml | head -n 1`

[private]
_cert-ensure:
    @test -f storage/config/localhost_crt.pem || just cert-generate

[doc('Start dev services')]
[group('container')]
compose-up: _cert-ensure
    @docker compose -f {{ compose_file }} up --detach --remove-orphans

[doc('Stop dev services')]
[group('container')]
compose-down:
    @docker compose -f {{ compose_file }} down --remove-orphans

[doc('Restart dev services')]
[group('container')]
compose-restart *services:
    @docker compose -f {{ compose_file }} restart {{ services }}

[doc('Exec into a dev service')]
[group('container')]
[no-exit-message]
[positional-arguments]
compose-exec service *cmd="sh":
    @docker compose -f {{ compose_file }} exec "$@"

[confirm("Delete the development volumes?")]
[doc('Stop dev services, delete volumes')]
[group('container')]
compose-cleanup:
    @docker compose -f {{ compose_file }} down --remove-orphans --volumes

[doc('Pull the container images')]
[group('container')]
compose-pull:
    @docker compose -f {{ compose_file }} pull

[doc('Build Docker image')]
[group('container')]
docker-build *args: && docker-images
    @docker build -f deploy/Dockerfile . -t {{ app_image }}:{{ app_version }} {{ args }}

[doc('List Docker images')]
[group('container')]
docker-images:
    @docker image list --filter reference={{ app_image }}:*

[doc('Run Docker image')]
[group('container')]
[no-exit-message]
[positional-arguments]
docker-run *args:
    @docker run --rm -it -p 3000:3000 --env-file .env -e BIND_ADDR=0.0.0.0:3000 {{ app_image }}:{{ app_version }} "$@"

[doc('Shell into a debug build of the image')]
[group('container')]
[no-exit-message]
docker-shell:
    @docker build -q -f deploy/Dockerfile . --build-arg DISTROLESS_TAG=debug-nonroot -t {{ app_image }}:debug > /dev/null
    @docker run --rm -it --env-file .env --entrypoint /busybox/sh {{ app_image }}:debug

[doc('Push Docker image')]
[group('container')]
docker-push:
    @docker push {{ app_image }}:{{ app_version }}
