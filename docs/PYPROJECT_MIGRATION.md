# Migration to pyproject.toml

## Overview
Migrated from `requirements.txt` to `pyproject.toml` for modern Python dependency management using PEP 621 standards.

## Benefits of pyproject.toml

### 1. **Single Source of Truth**
- All project metadata in one file
- Dependencies, build config, and tool settings unified
- No need for separate setup.py, setup.cfg, or requirements.txt

### 2. **Better Dependency Management**
- Clear separation of runtime vs development dependencies
- Optional dependency groups (e.g., dev, test, docs)
- Version constraints and extras in one place

### 3. **Modern Python Standard**
- PEP 621 compliant
- Native support in pip, uv, poetry, and other tools
- Future-proof for Python ecosystem

### 4. **Tool Configuration**
- Configure black, mypy, pytest in the same file
- Consistent formatting and linting rules
- Easy to share and maintain

## What Changed

### Before (requirements.txt)
```txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
torch>=2.4.0
...
```

### After (pyproject.toml)
```toml
[project]
name = "deepfake-detector-backend"
version = "1.0.0"
description = "Backend API for deepfake image detection"
requires-python = ">=3.9"

dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "torch>=2.4.0",
    ...
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    ...
]
```

## Installation Commands

### With uv (Recommended)
```bash
# Install all dependencies
cd backend && uv sync

# Install with dev dependencies
cd backend && uv sync --extra dev

# Run commands in the environment
cd backend && uv run uvicorn app.main:app --reload
```

### With pip
```bash
# Install all dependencies
cd backend && pip install -e .

# Install with dev dependencies
cd backend && pip install -e ".[dev]"
```

## Makefile Integration

Updated Makefile to use `uv sync`:
```makefile
install-backend:
    cd backend && uv sync

run-backend:
    cd backend && uv run uvicorn app.main:app --reload
```

## Project Structure

```
backend/
├── pyproject.toml      # Project metadata and dependencies
├── app/                # Application code
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   ├── services/
│   └── utils/
└── tests/              # Test files
```

## Key Features in pyproject.toml

### 1. Project Metadata
- Name, version, description
- Python version requirements
- License and author information
- Keywords and classifiers

### 2. Dependencies
- Runtime dependencies in `dependencies`
- Development dependencies in `optional-dependencies.dev`
- Clear version constraints

### 3. Build System
- Uses `hatchling` as build backend
- Configures which packages to include
- Handles editable installs

### 4. Tool Configuration
- **black**: Code formatting rules
- **mypy**: Type checking configuration
- **pytest**: Test discovery and execution

## Migration Steps (Already Done)

1. ✅ Created `pyproject.toml` with all dependencies
2. ✅ Removed `requirements.txt`
3. ✅ Updated Makefile to use `uv sync`
4. ✅ Tested installation with Python 3.13
5. ✅ Verified all dependencies install correctly

## Advantages for This Project

1. **Faster Installation**: `uv sync` is 10-100x faster than pip
2. **Lock File Support**: uv creates `uv.lock` for reproducible builds
3. **Better Caching**: Dependencies cached efficiently
4. **Dev Dependencies**: Easy to install dev tools separately
5. **Modern Workflow**: Aligns with Python best practices

## Commands Reference

```bash
# Install dependencies
make install-backend

# Or directly with uv
cd backend && uv sync

# Install with dev dependencies
cd backend && uv sync --extra dev

# Run the application
make run-backend

# Or directly with uv
cd backend && uv run uvicorn app.main:app --reload

# Run tests (when available)
cd backend && uv run pytest

# Format code
cd backend && uv run black app/

# Type check
cd backend && uv run mypy app/
```

## Compatibility

- ✅ Python 3.9+
- ✅ Python 3.13 (latest)
- ✅ Works with pip, uv, poetry
- ✅ Compatible with all major Python tools

---
*Migration completed successfully - modern Python dependency management in place!*
