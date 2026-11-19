[private]
compose_file := "container/compose.yaml"

[private]
app_image := "ghcr.io/riipandi/rusttp"

[private]
app_version := `sed -n 's/^version = "\(.*\)"/\1/p' Cargo.toml | head -n 1`

[doc('Start the development services')]
[group('container')]
compose-up:
    @docker compose -f {{ compose_file }} up --detach --remove-orphans

[doc('Stop the development services')]
[group('container')]
compose-down:
    @docker compose -f {{ compose_file }} down --remove-orphans

[doc('Restart the development services (all, or the ones named)')]
[group('container')]
compose-restart *services:
    @docker compose -f {{ compose_file }} restart {{ services }}

[doc('Run a command in a running service (default: a shell)')]
[group('container')]
[no-exit-message]
[positional-arguments]
compose-exec service *cmd="sh":
    @docker compose -f {{ compose_file }} exec "$@"

[confirm("Delete the development volumes?")]
[doc('Stop the development services and delete their volumes')]
[group('container')]
compose-cleanup:
    @docker compose -f {{ compose_file }} down --remove-orphans --volumes

[doc('Build the Docker image')]
[group('container')]
docker-build *args: && docker-images
    @docker build -f deploy/Dockerfile . -t {{ app_image }}:{{ app_version }} {{ args }}

[doc('List the local Docker images of this app')]
[group('container')]
docker-images:
    @docker image list --filter reference={{ app_image }}:*

[doc('Run the Docker image')]
[group('container')]
[no-exit-message]
[positional-arguments]
docker-run *args:
    @docker run --rm -it -p 3000:3000 --env-file .env -e BIND_ADDR=0.0.0.0:3000 {{ app_image }}:{{ app_version }} "$@"

[doc('Open a shell in the Docker image')]
[group('container')]
[no-exit-message]
docker-shell:
    @docker run --rm -it --env-file .env --entrypoint /bin/sh {{ app_image }}:{{ app_version }}

[doc('Push the Docker image')]
[group('container')]
docker-push:
    @docker push {{ app_image }}:{{ app_version }}
