# Commandline

## Commands

```sh
serve                 Start the application server
   --bind string      Address to bind to (default: 0.0.0.0:3000)
   --base-url string  Base URL (e.g. http://localhost:3000)
   --help, -h         Show help

health, hc             Check application health status
   --short             Print only the aggregated status: healthy or unhealthy
   --json              Print the result as JSON instead of text
   --timeout duration  Deadline for the whole check (default: 5s)
   --no-cache          Run every check now instead of reusing a cached result
   --help, -h          show help

generate:keys          Generate the application secret keys
   --env-file string   Write the generated keys to this env file instead of printing them
   --algorithm string  JWT signature algorithm for the key pair, or an HS* algorithm for AUTH_SECRET_KEY
   --overwrite         Replace existing values in the env file without asking
   --help, -h          Show help

generate:jwks          Generate a signing key pair for the OAuth provider
   --algorithm string  Signature algorithm: ES256, ES384, or RS256 (default: "ES256")
   --help, -h          Show help

config:generate     Write a starter config file
   --output string  Write to this path instead of the default config file
   --env-example    Also write .env.example with the development defaults
   --overwrite      Replace existing config, schema, and example env file
   --help, -h       Show help

config:validate  Check the configuration
   --help, -h    Show help

config:print     Print the resolved configuration (sensitive values are redacted)
   --source      Show the layer each value came from
   --help, -h    Show help

migrate:up       Run database migrations
   --to uint     Apply migrations only up to this version
   --dry-run     List the pending migrations without applying them
   --force       Skip the confirmation prompt
   --help, -h    Show help

migrate:down     Rollback database migrations
   --count int   Number of migrations to roll back (default: 1)
   --dry-run     List the migrations that would be rolled back without changing anything
   --force       Skip the confirmation prompt
   --help, -h    Show help

migrate:status   Check database migration status and version
   --help, -h    Show help

db:export                Export the application database to a SQL file
   --output string       Write the dump to this path
   --compression string  Compress the dump: none, gzip, zlib, or zip (default: "none")
   --schema-only         Export the schema without any rows
   --data-only           Export the rows without any DDL
   --overwrite           Replace the generated dump file when it already exists
   --help, -h            Show help

db:import                Import a database backup file
   --truncate            Empty every table in the dump before loading it
   --force               Skip the confirmation prompt
   --dry-run             Report what would be loaded without changing the database
   --help, -h            Show help

reset-password            Replace an administrator credential
   --new-password string  The replacement credential (generated when absent)
   --help, -h             Show help

setup-admin               Create an administrator account (default name: Admin Sistem)
   --email string         The administrator email address (default: "admin@example.com")
   --password string      The administrator password (generated and printed once when absent)
   --username string      The administrator handle (default: "admin")
   --help, -h             Show help
```

## Development Only

```sh
migrate:create <MIGRATION_NAME>   Create a new migration file
   --help, -h                     Show help

migrate:validate  Check the migration files
   --help, -h     Show help

migrate:reset     Rollback all migrations
   --up           Re-apply all migrations after the rollback (fresh schema)
   --seed         Run the seeders after the re-apply (requires --up)
   --dry-run      Print what would be rolled back without changing anything
   --force        Skip the confirmation prompt
   --help, -h     Show help

migrate:seed      Seed the database with initial data
   --dry-run      Report what would be seeded without changing anything
   --force        Skip the confirmation prompt
   --help, -h     Show help
```

## Global Flags

```sh
--env-file string     Load environment variables from a file
--config-file string  Load configuration from a JSON file
--version, -V         Show the application version
```
