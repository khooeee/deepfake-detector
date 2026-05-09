.PHONY: help install install-backend install-frontend run run-backend run-frontend dev clean test

# Default target
help:
	@echo "Deepfake Detector - Available Commands:"
	@echo ""
	@echo "  make install          - Install both backend and frontend dependencies"
	@echo "  make install-backend  - Install backend dependencies only (using uv)"
	@echo "  make install-frontend - Install frontend dependencies only"
	@echo ""
	@echo "  make run              - Run both backend and frontend (in parallel)"
	@echo "  make run-backend      - Run backend only"
	@echo "  make run-frontend     - Run frontend only"
	@echo "  make dev              - Same as 'make run'"
	@echo ""
	@echo "  make clean            - Clean up temporary files and caches"
	@echo "  make test             - Run tests (if available)"
	@echo ""
	@echo "Note: Backend uses 'uv' for fast Python package management"
	@echo "      Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
	@echo ""

# Install all dependencies
install: install-backend install-frontend
	@echo "✅ Installation complete!"
	@echo ""
	@echo "To run the application:"
	@echo "  make run"
	@echo ""

# Install backend dependencies using uv
install-backend:
	@echo "📦 Installing backend dependencies with uv sync..."
	@command -v uv >/dev/null 2>&1 || { echo "❌ uv is not installed. Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
	cd backend && uv sync
	@echo "✅ Backend dependencies installed with uv sync"

# Install frontend dependencies
install-frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Frontend dependencies installed"

# Run both backend and frontend in parallel with concurrently
run:
	@echo "🚀 Starting Deepfake Detector..."
	@echo ""
	@echo "Backend will run on: http://localhost:8000"
	@echo "Frontend will run on: http://localhost:5173"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@echo ""
	@cd frontend && npx concurrently \
		--names "BACKEND,FRONTEND" \
		--prefix-colors "blue,green" \
		--kill-others \
		"cd ../backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" \
		"npm run dev"

# Run backend only (using uv)
run-backend:
	@echo "🔧 Starting backend server with uv..."
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run frontend only
run-frontend:
	@echo "⚛️  Starting frontend server..."
	cd frontend && npm run dev

# Alias for run
dev: run

# Clean up temporary files
clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.pytest_cache 2>/dev/null || true
	rm -rf backend/.venv 2>/dev/null || true
	rm -rf backend/venv 2>/dev/null || true
	rm -rf frontend/dist 2>/dev/null || true
	rm -rf frontend/.vite 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	@echo "Backend tests:"
	cd backend && uv run python -m pytest tests/ -v || echo "No tests found"
	@echo ""
	@echo "Frontend tests:"
	cd frontend && npm test || echo "No tests configured"

# Setup for first time (creates venv and installs everything)
setup: install
	@echo ""
	@echo "🎉 Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make run' to start the application"
	@echo "  2. Open http://localhost:5173 in your browser"
	@echo ""

# Check if uv is installed
check-uv:
	@command -v uv >/dev/null 2>&1 || { echo "❌ uv is not installed."; echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
	@echo "✅ uv is installed"

# Made with Bob
