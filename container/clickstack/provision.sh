#!/bin/sh
# Registers the ClickStack account, reconciles the telemetry retention window,
# then creates or updates every dashboard in /dashboards through the v2 REST
# API. Re-runnable: an existing dashboard is updated in place, so a restart
# never leaves duplicates behind.
#
# The API only answers with the user's personal access key, so the script logs
# in with the same credentials it registers and reads the key from /api/me.
# CLICKSTACK_ACCESS_KEY skips that round trip.
set -eu

web=http://localhost:8080
api=http://clickstack:8000/api/v2
dir=/dashboards

# The session cookie is scoped to the host FRONTEND_URL names (localhost), and
# the init container reaches that host as `clickstack`; --connect-to keeps the
# request's own host while dialling the container.
web_curl() { curl --connect-to localhost:8080:clickstack:8080 "$@"; }

i=0
until curl -sf http://clickstack:8080/api/health >/dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 90 ]; then
        echo 'HyperDX did not become ready'
        exit 1
    fi
    sleep 2
done

credentials=$(printf '{"email":"%s","password":"%s","confirmPassword":"%s"}' \
    "$HYPERDX_EMAIL" "$HYPERDX_PASSWORD" "$HYPERDX_PASSWORD")
status=$(web_curl -s -o /dev/null -w '%{http_code}' -X POST "$web/api/register/password" \
    -H 'Content-Type: application/json' -d "$credentials")
case "$status" in
200) echo "HyperDX: registered $HYPERDX_EMAIL" ;;
409) echo 'HyperDX: account already exists' ;;
*)
    echo "HyperDX: registration answered $status"
    exit 1
    ;;
esac

# The session stays open past the key lookup: favorites live on the internal
# API, which answers to the session cookie only, never to the access key.
jar=$(mktemp)
web_curl -s -o /dev/null -c "$jar" -X POST "$web/api/login/password" \
    -H 'Content-Type: application/json' -d "$credentials"
token=${CLICKSTACK_ACCESS_KEY:-}
if [ -z "$token" ]; then
    token=$(web_curl -s -b "$jar" "$web/api/me" | jq -r '.accessKey // empty')
    if [ -z "$token" ]; then
        echo "HyperDX: no API access key for $HYPERDX_EMAIL"
        exit 1
    fi
fi

auth="Authorization: Bearer $token"
api_curl() { curl -sf -H "$auth" "$@"; }
named_ids() { jq -c '[.data[] | {(.name): .id}] | add // {}'; }

sources=$(api_curl "$api/sources" | named_ids)
connections=$(api_curl "$api/connections" | named_ids)
dashboards=$(api_curl "$api/dashboards" | named_ids)

# The image writes its own defaults the first time a team is created and never
# revisits them, so a stack that already has them keeps whatever it was given.
# Both lists are applied here instead, which is what makes a restart heal a
# connection whose password no longer matches, or a source pointing at a table
# the schema does not create.
send() {
    status=$(printf '%s' "$3" | curl -s -o /tmp/answer -w '%{http_code}' -X "$1" \
        -H "$auth" -H 'Content-Type: application/json' --data-binary @- "$api/$2")
    if [ "$status" != '200' ]; then
        echo "HyperDX: $2 answered $status: $(cat /tmp/answer)" >&2
        exit 1
    fi
}

if [ -n "${DEFAULT_CONNECTIONS:-}" ]; then
    connection=$(printf '%s' "$DEFAULT_CONNECTIONS" | jq -c '.[0]')
    name=$(printf '%s' "$connection" | jq -r '.name')
    id=$(printf '%s' "$connections" | jq -r --arg name "$name" '.[$name] // empty')
    if [ -n "$id" ]; then
        # The API never returns a stored password, so the value is written on
        # every start rather than compared.
        send PUT "connections/$id" "$connection"
        echo "HyperDX: applied connection $name"
    fi
fi

if [ -n "${DEFAULT_SOURCES:-}" ]; then
    printf '%s' "$DEFAULT_SOURCES" | jq -c '.[]' >/tmp/sources.jsonl

    # The environment names its references, the API wants ids. A reference that
    # does not resolve yet is dropped here and written by the second pass, once
    # every source exists.
    resolve='(if .connection then .connection = ($connections[.connection] // .connection) else . end)
        | (if .logSourceId then .logSourceId = ($sources[.logSourceId] // empty) else . end)
        | (if .traceSourceId then .traceSourceId = ($sources[.traceSourceId] // empty) else . end)
        | (if .sessionSourceId then .sessionSourceId = ($sources[.sessionSourceId] // empty) else . end)
        | (if .metricSourceId then .metricSourceId = ($sources[.metricSourceId] // empty) else . end)
        | with_entries(select(.value != null and .value != ""))'

    # A source the stack lost is created first, so the ids below can name it.
    while read -r source; do
        name=$(printf '%s' "$source" | jq -r '.name')
        id=$(printf '%s' "$sources" | jq -r --arg name "$name" '.[$name] // empty')
        if [ -z "$id" ]; then
            send POST 'sources' "$(printf '%s' "$source" | jq -c \
                --argjson connections "$connections" --argjson sources "$sources" "$resolve")"
            echo "HyperDX: created source $name"
        fi
    done </tmp/sources.jsonl

    sources=$(api_curl "$api/sources" | named_ids)
    while read -r source; do
        name=$(printf '%s' "$source" | jq -r '.name')
        id=$(printf '%s' "$sources" | jq -r --arg name "$name" '.[$name] // empty')
        body=$(printf '%s' "$source" | jq -c \
            --argjson connections "$connections" --argjson sources "$sources" "$resolve")
        stored=$(api_curl "$api/sources/$id" | jq -c '.data')
        send PUT "sources/$id" "$(printf '%s' "$stored" | jq -c --argjson body "$body" '. + $body | del(.id)')"
        echo "HyperDX: applied source $name"
    done </tmp/sources.jsonl
fi

# The files name their source and connection, because the ids HyperDX assigns
# are regenerated whenever the stack is recreated. The API compares those
# fields against `_id`, so the names are resolved here, and an unknown name
# fails the run instead of provisioning a dashboard with a dangling reference.
# `tiles` and `filters` map a name to the id it already has, so an update keeps
# it; two entries sharing a name are left to the API, which mints fresh ids.
filter='
def id_of($table; $kind):
  if . == null then . else ($table[.] // error("unknown \($kind) \(.)")) end;

.tiles |= map(
  (if .config.source then .config.sourceId = (.config.source | id_of($sources; "source")) else . end)
  | del(.config.source)
  | (if .config.connection then .config.connectionId = (.config.connection | id_of($connections; "connection")) else . end)
  | del(.config.connection)
  | (if $tiles[.name] then .id = $tiles[.name] else del(.id) end)
)
| (if .filters then
    .filters |= map(
      (if .source then .sourceId = (.source | id_of($sources; "source")) else . end)
      | del(.source)
      | (if $filters[.name] then .id = $filters[.name] else del(.id) end)
    )
  else . end)
'

for file in "$dir"/*.json; do
    name=$(jq -r '.name' "$file")
    id=$(printf '%s' "$dashboards" | jq -r --arg name "$name" '.[$name] // empty')
    if [ -n "$id" ]; then
        mode=update
        method=PUT
        url="$api/dashboards/$id"
        stored=$(api_curl "$url")
        tiles=$(printf '%s' "$stored" | jq -c '[.data.tiles[]]
      | group_by(.name)
      | map(select(length == 1) | {(.[0].name): .[0].id})
      | add // {}')
        filters=$(printf '%s' "$stored" | jq -c '[(.data.filters // [])[]]
      | group_by(.name)
      | map(select(length == 1) | {(.[0].name): .[0].id})
      | add // {}')
    else
        mode=create
        method=POST
        url="$api/dashboards"
        tiles='{}'
        filters='{}'
    fi

    body=$(jq -c --argjson sources "$sources" \
        --argjson connections "$connections" --argjson tiles "$tiles" \
        --argjson filters "$filters" "$filter" "$file") || {
        echo "HyperDX: $file could not be prepared"
        exit 1
    }

    # The validator answers for the create shape only, where a filter carries no id.
    check=$(printf '%s' "$body" | jq -c 'if .filters then .filters |= map(del(.id)) else . end' |
        curl -s -X POST -H "$auth" -H 'Content-Type: application/json' \
            --data-binary @- "$api/dashboards/validate")
    if [ "$(printf '%s' "$check" | jq -r '.valid')" != 'true' ]; then
        echo "HyperDX: $name is invalid: $(printf '%s' "$check" | jq -c '.errors')"
        exit 1
    fi

    status=$(printf '%s' "$body" | curl -s -o /tmp/answer -w '%{http_code}' -X "$method" \
        -H "$auth" -H 'Content-Type: application/json' --data-binary @- "$url")
    if [ "$status" != '200' ]; then
        echo "HyperDX: $name answered $status: $(jq -c '.message // .' /tmp/answer)"
        exit 1
    fi
    echo "HyperDX: provisioned $name"
done

# A dashboard this repository no longer ships is removed, so a renamed file does
# not leave its old copy behind. The `rusttp` tag scopes the sweep: a dashboard
# created by hand on the same instance carries no such tag and is left alone.
names=$(for file in "$dir"/*.json; do jq -r '.name' "$file"; done | jq -R . | jq -sc .)
api_curl "$api/dashboards" |
    jq -r --argjson names "$names" '
        .data[]
        | select((.tags // []) | index("rusttp"))
        | select(.name as $name | $names | index($name) | not)
        | "\(.id) \(.name)"' >/tmp/stale.txt
while read -r id name; do
    status=$(curl -s -o /tmp/answer -w '%{http_code}' -X DELETE -H "$auth" "$api/dashboards/$id")
    if [ "$status" != '200' ]; then
        echo "HyperDX: $name could not be removed: $(jq -c '.message // .' /tmp/answer)"
        exit 1
    fi
    echo "HyperDX: removed $name"
done </tmp/stale.txt

# Saved searches follow the dashboards: each /searches file names its source,
# is created or updated by name, and a `rusttp`-tagged search no file ships
# any more is removed.
search_dir=/searches
searches=$(api_curl "$api/saved-searches" | named_ids)
for file in "$search_dir"/*.json; do
    name=$(jq -r '.name' "$file")
    body=$(jq -c --argjson sources "$sources" '
        .sourceId = ($sources[.source] // error("unknown source \(.source)")) | del(.source)' "$file") || {
        echo "HyperDX: $file could not be prepared"
        exit 1
    }
    id=$(printf '%s' "$searches" | jq -r --arg name "$name" '.[$name] // empty')
    if [ -n "$id" ]; then
        send PUT "saved-searches/$id" "$body"
    else
        send POST 'saved-searches' "$body"
    fi
    echo "HyperDX: provisioned search $name"
done

search_names=$(for file in "$search_dir"/*.json; do jq -r '.name' "$file"; done | jq -R . | jq -sc .)
api_curl "$api/saved-searches" |
    jq -r --argjson names "$search_names" '
        .data[]
        | select((.tags // []) | index("rusttp"))
        | select(.name as $name | $names | index($name) | not)
        | "\(.id) \(.name)"' >/tmp/stale.txt
while read -r id name; do
    status=$(curl -s -o /tmp/answer -w '%{http_code}' -X DELETE -H "$auth" "$api/saved-searches/$id")
    if [ "$status" != '200' ]; then
        echo "HyperDX: search $name could not be removed: $(jq -c '.message // .' /tmp/answer)"
        exit 1
    fi
    echo "HyperDX: removed search $name"
done </tmp/stale.txt

# Every shipped dashboard and saved search is a favorite of the provisioned
# account. Favorites are per user and the PUT upserts, so a restart re-applies
# them without duplicates and leaves a user's own favorites alone.
shipped='.data[] | select(.name as $name | $names | index($name)) | "\($type) \(.id) \(.name)"'
{
    api_curl "$api/dashboards" | jq -r --argjson names "$names" --arg type dashboard "$shipped"
    api_curl "$api/saved-searches" | jq -r --argjson names "$search_names" --arg type savedSearch "$shipped"
} >/tmp/shipped.txt
while read -r type id name; do
    status=$(web_curl -s -o /tmp/answer -w '%{http_code}' -b "$jar" -X PUT "$web/api/favorites" \
        -H 'Content-Type: application/json' -d "{\"resourceType\":\"$type\",\"resourceId\":\"$id\"}")
    if [ "$status" != '200' ]; then
        echo "HyperDX: $name could not be favorited: $(jq -c '.message // .' /tmp/answer)"
        exit 1
    fi
    echo "HyperDX: favorited $name"
done </tmp/shipped.txt
rm -f "$jar"

# Telemetry retention: the image creates every otel/hyperdx table with a
# 30-day TTL and never revisits it. CLICKSTACK_RETENTION_DAYS (default 30,
# from compose) rewrites each table's TTL when it differs, so a restart heals
# both a changed setting and a table the image recreated with its own default.
if [ -n "${CLICKSTACK_RETENTION_DAYS:-}" ]; then
    case "$CLICKSTACK_RETENTION_DAYS" in
    '' | *[!0-9]* | 0)
        echo "HyperDX: CLICKSTACK_RETENTION_DAYS must be a positive integer, got '$CLICKSTACK_RETENTION_DAYS'"
        exit 1
        ;;
    esac
    ch() {
        curl -sf -u "${CLICKHOUSE_USER:-default}:${CLICKSTACK_DB_PASSWORD:-securedb}" \
            --data-binary "$1" http://clickstack:8123/
    }
    ch "SELECT table,
               extract(engine_full, 'TTL (.+) \\\\+ toIntervalDay\\\\(\\\\d+\\\\)') AS expr,
               extract(engine_full, 'toIntervalDay\\\\((\\\\d+)\\\\)') AS days
        FROM system.tables
        WHERE database = 'default' AND (table LIKE 'otel_%' OR table LIKE 'hyperdx_%')
          AND engine_full LIKE '%TTL %'
        ORDER BY table FORMAT TSV" >/tmp/ttl.txt || {
        echo 'HyperDX: retention check could not read the table TTLs'
        exit 1
    }
    applied=0
    while IFS='	' read -r table expr days; do
        [ -n "$table" ] || continue
        if [ "$days" = "$CLICKSTACK_RETENTION_DAYS" ]; then continue; fi
        ch "ALTER TABLE \`default\`.\`$table\` MODIFY TTL $expr + toIntervalDay($CLICKSTACK_RETENTION_DAYS)" || {
            echo "HyperDX: retention ALTER failed for $table"
            exit 1
        }
        echo "HyperDX: applied retention ${CLICKSTACK_RETENTION_DAYS}d to $table"
        applied=$((applied + 1))
    done </tmp/ttl.txt
    if [ "$applied" -eq 0 ]; then
        echo "HyperDX: retention is ${CLICKSTACK_RETENTION_DAYS}d on every table"
    fi
fi

# Alerts notify through webhooks: the Mailpit one always, so a fired alert
# lands as an email in the local inbox, plus a generic one when
# CLICKSTACK_ALERT_WEBHOOK_URL is set. Both update in place by name. String
# variables arrive JSON-escaped, so the templates only add the quotes.
upsert_hook() {
    hook=$(api_curl "$api/webhooks" | named_ids | jq -r --arg name "$1" '.[$name] // empty')
    hook_body=$(jq -cn --arg name "$1" --arg url "$2" --arg body "$3" \
        '{name: $name, service: "generic", url: $url, body: $body}')
    if [ -n "$hook" ]; then
        send PUT "webhooks/$hook" "$hook_body"
    else
        send POST 'webhooks' "$hook_body"
        hook=$(api_curl "$api/webhooks" | named_ids | jq -r --arg name "$1" '.[$name]')
    fi
    echo "HyperDX: applied webhook channel $1" >&2
    printf '%s' "$hook"
}

hook=$(upsert_hook 'rusttp mailpit' "${CLICKSTACK_ALERT_MAILPIT_URL:-http://mailpit:8025/api/v1/send}" '{
    "From": {"Email": "clickstack@rusttp.localhost", "Name": "ClickStack"},
    "To": [{"Email": "alerts@rusttp.localhost"}],
    "Subject": "{{title}}",
    "Text": "{{body}}\n\n{{link}}",
    "Tags": ["alert", "{{state}}"]
}')
channels=$(jq -cn --arg hook "$hook" '[{type: "webhook", webhookId: $hook}]')
if [ -n "${CLICKSTACK_ALERT_WEBHOOK_URL:-}" ]; then
    hook=$(upsert_hook 'rusttp alerts' "$CLICKSTACK_ALERT_WEBHOOK_URL" '{
    "alert": {"state": "{{state}}", "title": "{{title}}", "threshold": {{threshold}},
              "message": "{{body}}"},
    "link": "{{link}}"
}')
    channels=$(printf '%s' "$channels" | jq -c --arg hook "$hook" '. + [{type: "webhook", webhookId: $hook}]')
fi

# Each /alerts file watches one shipped saved search by name; the alert is
# created or updated by name, and a `rusttp`-tagged alert no file ships any
# more is removed.
alert_dir=/alerts
searches=$(api_curl "$api/saved-searches" | named_ids)
alerts=$(api_curl "$api/alerts" | named_ids)
for file in "$alert_dir"/*.json; do
    name=$(jq -r '.name' "$file")
    body=$(jq -c --argjson searches "$searches" --argjson channels "$channels" '
        .savedSearchId = ($searches[.savedSearch] // error("unknown saved search \(.savedSearch)"))
        | del(.savedSearch) | .source = "saved_search" | .channels = $channels' "$file") || {
        echo "HyperDX: $file could not be prepared"
        exit 1
    }
    id=$(printf '%s' "$alerts" | jq -r --arg name "$name" '.[$name] // empty')
    if [ -n "$id" ]; then
        send PUT "alerts/$id" "$body"
    else
        send POST 'alerts' "$body"
    fi
    echo "HyperDX: provisioned alert $name"
done

alert_names=$(for file in "$alert_dir"/*.json; do jq -r '.name' "$file"; done | jq -R . | jq -sc .)
api_curl "$api/alerts" |
    jq -r --argjson names "$alert_names" '
        .data[]
        | select((.tags // []) | index("rusttp"))
        | select(.name as $name | $names | index($name) | not)
        | "\(.id) \(.name)"' >/tmp/stale.txt
while read -r id name; do
    status=$(curl -s -o /tmp/answer -w '%{http_code}' -X DELETE -H "$auth" "$api/alerts/$id")
    if [ "$status" != '200' ]; then
        echo "HyperDX: alert $name could not be removed: $(jq -c '.message // .' /tmp/answer)"
        exit 1
    fi
    echo "HyperDX: removed alert $name"
done </tmp/stale.txt
