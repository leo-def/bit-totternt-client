# Variables
NODE = node
NPM = npm
TS_NODE = npx ts-node
TSC = npx tsc
NODEMON = npx nodemon

# Default Target
.PHONY: all
all: build

# Install dependencies
.PHONY: install
install:
	$(NPM) install

# Build the TypeScript project
.PHONY: build
build:
	$(NPM) run build

# Run the project in development mode using ts-node
.PHONY: dev
dev:
	$(NPM) run start:dev

# Run unit tests
.PHONY: test
test:
	$(NPM) test

# Run the compiled production build
.PHONY: run
run: build
	$(NODE) ./build/index.js

# Run the compiled production build with environment file (Node.js 20+)
.PHONY: run-env
run-env: build
	@if [ -f .env ]; then \
		$(NODE) --env-file=.env ./build/index.js; \
	else \
		echo "No .env file found. Copying .env.example to .env..."; \
		cp .env.example .env; \
		$(NODE) --env-file=.env ./build/index.js; \
	fi

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf build/

# Display help
.PHONY: help
help:
	@echo "BitTorrent Client CLI - Makefile Commands:"
	@echo "  make install      - Install project dependencies"
	@echo "  make build        - Compile TypeScript to JavaScript"
	@echo "  make dev          - Run in development mode with live reloading"
	@echo "  make test         - Run unit tests"
	@echo "  make run          - Compile and run production client using defaults"
	@echo "  make run-env      - Compile and run using configuration from .env file"
	@echo "  make clean        - Remove build directory"
	@echo "  make help         - Display this help message"
