.DEFAULT_GOAL := help

APP_BIN    := $(shell grep '^name ' src-app/Cargo.toml | head -1 | sed 's/.*= *"\(.*\)"/\1/')
CARGO      := $$(which cargo)
PNPM       := $$(which pnpm)

APP_VERSION := $(shell grep '^version = ' Cargo.toml | head -1 | sed 's/.*= *"\(.*\)"/\1/')
BUILD_HASH  := $(shell git rev-parse --short HEAD 2>/dev/null || echo "dev")
BUILD_DIR   := ./target/release

UNAME_S := $(shell uname -s)

# ─── Compiler cache ───────────────────────────────────────────────────────────
SCCACHE_BIN := $(shell command -v sccache 2>/dev/null)
ifneq ($(SCCACHE_BIN),)
  export RUSTC_WRAPPER := sccache
  export SCCACHE_DIRECT := true
endif

# ─── Args ───────────────────────────────────────────────────────────────────

# Pass program args via ARGS or after -- (before build):
#   make run -- --help           or   make run ARGS="--help"
#   make run -- --host 127.0.0.1  or   make run ARGS="--host 127.0.0.1"
ARGS         :=
# Help is in KNOWN_TARGETS so override skips it (no warning) but _RESIDUAL_ still passes it to binary
KNOWN_TARGETS := build check run start watch test lint fmt clean help install prepare coverage web-deps web-dev web-build web-test docker-build
# Residuals passed to binary — does NOT filter KNOWN_TARGETS
_RESIDUAL_   := $(filter-out --,$(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS)))
# Only override non-target words to avoid conflict warnings
_OVERRIDE_   := $(filter-out $(KNOWN_TARGETS),$(_RESIDUAL_))
$(foreach a,$(_OVERRIDE_),$(eval .PHONY: $a))
$(foreach a,$(_OVERRIDE_),$(eval $a: ; @true))

.PHONY: build check run start watch test lint fmt clean help install prepare

# ─── Build ──────────────────────────────────────────────────────────────────

check: ## Check code compiles (fast, no codegen)
	@$(CARGO) check --workspace 2>&1

build: web-build ## Build frontend + release binary
	@echo "Building $(APP_BIN) v$(APP_VERSION) ($(BUILD_HASH)) ($$RUSTC_WRAPPER)"
	@_start=$$(python3 -c "import time; print(int(time.time()*1000))"); \
	$(CARGO) build --release -p $(APP_BIN) 2>&1; \
	_end=$$(python3 -c "import time; print(int(time.time()*1000))"); \
	_elapsed=$$(( _end - _start )); \
	if [ -f "$(BUILD_DIR)/$(APP_BIN)" ]; then \
	  if command -v rapidhash >/dev/null 2>&1; then \
	    hash=$$(rapidhash "$(BUILD_DIR)/$(APP_BIN)"); \
	  elif command -v sha256sum >/dev/null 2>&1; then \
	    hash=$$(sha256sum "$(BUILD_DIR)/$(APP_BIN)" | cut -d' ' -f1); \
	  else \
	    hash=$$(shasum -a 256 "$(BUILD_DIR)/$(APP_BIN)" | cut -d' ' -f1); \
	  fi; \
	  echo "Binary $(APP_BIN):$$(du -sh $(BUILD_DIR)/$(APP_BIN) | cut -f1) ($$hash)"; \
	else \
	  echo "Binary $(APP_BIN):(not built)"; \
	fi; \
	printf "Build time: %d.%03ds\n" $$(( _elapsed / 1000 )) $$(( _elapsed % 1000 ))

install: build ## Install binary to ~/.local/bin
	@mkdir -p $(HOME)/.local/bin
	@cp "$(BUILD_DIR)/$(APP_BIN)" "$(HOME)/.local/bin/$(APP_BIN)-next"
	@echo "$(APP_BIN)-next installed at: $(HOME)/.local/bin/$(APP_BIN)-next"

run: ## Run dev server (cargo run)
	@-ARGS='$(or $(_RESIDUAL_),$(ARGS))'; \
	if [ -n "$$ARGS" ]; then \
		$(CARGO) run -q -p $(APP_BIN) -- $$ARGS; \
	else \
		$(CARGO) run -q -p $(APP_BIN); \
	fi

start: build ## Run release binary
	@./target/release/$(APP_BIN) $(or $(_RESIDUAL_),$(ARGS))

test: ## Run all workspace tests
	@$(CARGO) nextest run --no-fail-fast $(or $(_RESIDUAL_),$(ARGS))

# ─── Code Quality ───────────────────────────────────────────────────────────

lint: ## Run clippy linter
	@$(CARGO) clippy --workspace --all-targets -- -D warnings

fmt: ## Format all code
	@$(CARGO) fmt --all

coverage: ## Run tests with coverage (requires cargo-llvm-cov)
	@$(CARGO) llvm-cov nextest --no-cfg-coverage 2>&1

clean: ## Clean build artifacts
	@$(CARGO) clean

# ─── Watch ─────────────────────────────────────────────────────────────────

watch: ## Run server with hot reload (requires watchexec)
	@-$(CARGO) watch -c -- cargo run -p $(APP_BIN) $(ARGS) 2>&1

# ─── Toolchain ──────────────────────────────────────────────────────────

prepare: ## Install required Rust tooling
	@command -v cargo-binstall >/dev/null 2>&1 || $(CARGO) install cargo-binstall --locked
	@command -v cargo-nextest >/dev/null 2>&1 || $(CARGO) binstall --locked -y cargo-nextest
	@command -v cargo-llvm-cov >/dev/null 2>&1 || $(CARGO) binstall --locked -y cargo-llvm-cov
	@command -v cargo-bloat >/dev/null 2>&1 || $(CARGO) binstall --locked -y cargo-bloat
	@command -v watchexec >/dev/null 2>&1 || $(CARGO) binstall --locked -y watchexec-cli
	@command -v rapidhash >/dev/null 2>&1 || $(CARGO) install --locked rapidhash
	@command -v sccache >/dev/null 2>&1 || $(CARGO) binstall --locked -y sccache
	@command -v tokei >/dev/null 2>&1 || $(CARGO) binstall --locked -y tokei

# ─── Frontend ───────────────────────────────────────────────────────────────

web-deps: ## Install SPA dependencies
	@if command -v pnpm >/dev/null 2>&1; then \
	  pnpm install; \
	else \
	  echo "[skip] pnpm not found"; \
	fi

web-dev: web-deps ## Start Vite dev server
	@pnpm dev

web-build: web-deps ## Build SPA into web/
	@if command -v pnpm >/dev/null 2>&1; then \
	  if [ -f package.json ]; then \
	    pnpm build; \
	  else \
	    echo "[skip] no package.json found"; \
	  fi; \
	else \
	  echo "[skip] pnpm not found"; \
	fi

web-test: web-deps ## Run SPA tests
	@if command -v pnpm >/dev/null 2>&1; then \
	  if [ -f package.json ]; then \
	    pnpm test; \
	  else \
	    echo "[skip] no package.json found"; \
	  fi; \
	else \
	  echo "[skip] pnpm not found"; \
	fi

# ─── Docker ─────────────────────────────────────────────────────────────────

docker-build: ## Build Docker image
	@docker build -t $(APP_BIN):$(APP_VERSION) .

compose-up: ## Start development server
	@docker-compose up -d --remove-orphans

# ─── Help ───────────────────────────────────────────────────────────────────

help: ## Show this help
	@if ! echo "$(MAKECMDGOALS)" | grep -qw run; then \
		printf '\033[33mUsage:\033[0m make \033[36m<target>\033[0m\n'; \
		awk -F ':.*## ' '/^[a-zA-Z_-]+:.*## / {printf " \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST); \
	fi
