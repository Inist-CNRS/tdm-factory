# =============================================================================
# TDM Factory - Development Commands
# =============================================================================

.PHONY: help install lint lint-fix stylelint run-dev run-docker clean clean-install

# Default target
help:
	@echo "Available commands:"
	@echo "  install           - Install dependencies for all projects (quiet mode)"
	@echo "  clean             - Remove node_modules and package-lock.json from all projects"
	@echo "  lint              - Run ESLint on all projects"
	@echo "  lint-fix          - Run ESLint with the fix option on all projects"
	@echo "  stylelint         - Run Stylelint on frontend projects"
	@echo "  run-dev           - Start development environment with Docker"
	@echo "  run-docker        - Build and run production Docker container"

# =============================================================================
# Installation
# =============================================================================

install:
	@echo "Installing dependencies for all projects..."
	@cd tdm-be && npm install --legacy-peer-deps && cd ..
	@cd tdm-fe && npm install --legacy-peer-deps && cd ..
	@cd tdm-admin && npm install --legacy-peer-deps
	@echo "✅ All dependencies installed"
	
# =============================================================================
# Code Quality
# =============================================================================

lint:
	@echo "Running linting on all projects..."
	@echo "Backend :"
	@cd tdm-be && npm run lint || true
	@echo "Frontend :"
	@cd tdm-fe && npm run lint || true
	@echo "Admin :"
	@cd tdm-admin && npm run lint || true

lint-fix:
	@echo "Running linting on all projects..."
	@echo "Backend :"
	@cd tdm-be && npm run lint --fix || true
	@echo "Frontend :"
	@cd tdm-fe && npm run lint --fix || true
	@echo "Admin :"
	@cd tdm-admin && npm run lint --fix || true

stylelint:
	@echo "Running Stylelint on frontend projects..."
	@echo "Frontend (tdm-fe):"
	@cd tdm-fe && npm run stylelint:test || echo "Stylelint completed with warnings"
	@echo "Admin (tdm-admin):"
	@cd tdm-admin && npm run stylelint:test || echo "Stylelint completed with warnings"
	@echo "✅ Stylelint completed"

# =============================================================================
# Development & Deployment
# =============================================================================

run-dev:
	@echo "Starting development environment..."
	docker compose -f docker-compose.dev.yml up --force-recreate

run-docker:
	@echo "Building and running production container..."
	docker build --tag 'tdm-factory:latest' .
	docker run -p 3000:3000 'tdm-factory:latest'

clean:
	@echo "Cleaning node_modules and package-lock.json from all projects..."
	@docker compose -f docker-compose.dev.yml down
	@echo "🧹 Cleaning Backend (tdm-be)..."
	@sudo rm -rf tdm-be/node_modules tdm-be/package-lock.json
	@echo "🧹 Cleaning Frontend (tdm-fe)..."
	@sudo rm -rf tdm-fe/node_modules tdm-fe/package-lock.json tdm-fe/.vite tdm-fe/dist
	@echo "🧹 Cleaning Admin (tdm-admin)..."
	@sudo rm -rf tdm-admin/node_modules tdm-admin/package-lock.json tdm-admin/.vite tdm-admin/dist
	@echo "✅ All projects cleaned"

clean-install:
	@echo "🧹 Full clean and reinstall..."
	@$(MAKE) clean
	@$(MAKE) install
	@echo "✅ Full clean and reinstall completed"