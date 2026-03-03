.PHONY: setup verify start stop test test-all lint help

PYTHON := $(shell [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3)

##@ Setup

setup: ## Initialize database and Qdrant collections
	$(PYTHON) scripts/init_db.py
	$(PYTHON) scripts/init_qdrant.py

verify: ## Check all dependencies (Python packages, Qdrant, tmux, API keys, git repo)
	$(PYTHON) scripts/verify_setup.py

##@ Development

start: ## Start all services: Qdrant, backend server, monitor, and frontend
	bash scripts/dev/start_all.sh

stop: ## Stop background server and monitor processes
	@pkill -f run_server.py   2>/dev/null && echo "Stopped server"   || echo "Server was not running"
	@pkill -f run_monitor.py  2>/dev/null && echo "Stopped monitor"  || echo "Monitor was not running"

##@ Testing

test: ## Run unit tests (no external services required)
	$(PYTHON) -m pytest tests/ -m "not integration" --timeout=30 -q --tb=short

test-all: ## Run all tests including integration (requires Qdrant and API keys)
	$(PYTHON) -m pytest tests/ -q --tb=short

##@ Code Quality

lint: ## Run flake8 linter over src/
	$(PYTHON) -m flake8 src/ --max-line-length=120 --extend-ignore=E203,W503 --statistics

##@ Help

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help
