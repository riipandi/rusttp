#!/bin/bash
###
# Example usage on the docker-compose.yaml file:
#
# env:
#   PG_EXTRA_DATABASE: mydb1,mydb2
###

set -e
set -u

# Parse and process multiple databases and schemas
if [ -n "${PG_EXTRA_DATABASE:-}" ]; then
    echo "Multiple database creation requested: $PG_EXTRA_DATABASE"
    IFS=',' read -ra databases <<< "$PG_EXTRA_DATABASE"

    # Create extra databases with owners
    for db in "${databases[@]}"; do
        echo "  Creating database '$db' with owner '$POSTGRES_USER'"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
            CREATE DATABASE "$db" WITH OWNER = "$POSTGRES_USER"
            ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8'
            LC_CTYPE = 'en_US.UTF-8'
            TEMPLATE = template0;
EOSQL
    done

    # # Drop the default database if it exists
    # echo "Dropping default database 'postgres' if it exists"
    # psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "DROP DATABASE IF EXISTS postgres;"

    echo "Multiple databases and schemas created successfully."
else
    echo "No databases requested for creation."
fi
