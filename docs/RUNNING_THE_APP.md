# Running the Deepfake Detector Application

## Quick Start

```bash
# Install dependencies (first time only)
make install

# Run the application
make run
```

Then open http://localhost:5173 in your browser!

## What Happens When You Run

### With `make run`

The application uses **concurrently** to run both servers with color-coded output:

```
🚀 Starting Deepfake Detector...

Backend will run on: http://localhost:8000
Frontend will run on: http://localhost:5173

Press Ctrl+C to stop both servers

[BACKEND]  INFO:     Uvicorn running on http://0.0.0.0:8000
[BACKEND]  INFO:     Loading deepfake detection model...
[BACKEND]  INFO:     Model loaded successfully!
[FRONTEND] VITE v5.4.21  ready in 234 ms
[FRONTEND] ➜  Local:   http://localhost:5173/
```

### Color-Coded Output

- **[BACKEND]** - Blue text - Python FastAPI server logs
- **[FRONTEND]** - Green text - Vite development server logs

This makes it easy to:
- ✅ See which server is logging
- ✅ Debug issues quickly
- ✅ Monitor both servers at once
- ✅ Identify errors by source

## Running Servers Individually

### Backend Only

```bash
make run-backend
```

Starts the FastAPI server on http://localhost:8000

**What it does:**
1. Activates Python virtual environment (via uv)
2. Loads the Vision Transformer model (~300MB, first time only)
3. Starts uvicorn with hot reload
4. Serves API at http://localhost:8000
5. API docs available at http://localhost:8000/docs

**Output:**
```
🔧 Starting backend server with uv...
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Loading deepfake detection model...
INFO:     Using device: cpu
INFO:     Loading model: dima806/deepfake_vs_real_image_detection
INFO:     Model loaded successfully
INFO:     Application startup complete.
```

### Frontend Only

```bash
make run-frontend
```

Starts the React development server on http://localhost:5173

**What it does:**
1. Starts Vite development server
2. Enables hot module replacement (HMR)
3. Serves React app with TypeScript
4. Auto-opens browser (optional)

**Output:**
```
⚛️  Starting frontend server...
VITE v5.4.21  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

## Development Workflow

### 1. First Time Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install all dependencies
make install
```

### 2. Daily Development

```bash
# Start both servers
make run

# Or use the alias
make dev
```

### 3. Making Changes

**Backend Changes:**
- Edit files in `backend/app/`
- Server auto-reloads on save
- See changes in [BACKEND] logs

**Frontend Changes:**
- Edit files in `frontend/src/`
- HMR updates browser instantly
- See changes in [FRONTEND] logs

### 4. Stopping Servers

Press `Ctrl+C` once - both servers stop automatically thanks to concurrently's `--kill-others` flag.

## Troubleshooting

### Port Already in Use

**Backend (8000):**
```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in Makefile
--port 8001
```

**Frontend (5173):**
```bash
# Find process using port 5173
lsof -ti:5173 | xargs kill -9

# Or Vite will auto-increment to 5174
```

### Model Loading Issues

If you see:
```
[BACKEND] ERROR: Failed to load model
```

**Solutions:**
1. Check internet connection (first download)
2. Ensure 4GB+ RAM available
3. Check disk space (~500MB needed)
4. Try clearing cache: `rm -rf ~/.cache/huggingface`

### Frontend Not Connecting to Backend

If you see CORS errors:
```
[FRONTEND] Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Ensure backend is running on port 8000
2. Check CORS settings in `backend/app/main.py`
3. Verify frontend is on http://localhost:5173

### Concurrently Not Found

If you see:
```
npx: command not found: concurrently
```

**Solution:**
```bash
cd frontend && npm install --save-dev concurrently
```

## Advanced Usage

### Custom Ports

Edit `Makefile` to change ports:

```makefile
# Backend on 8080
"cd ../backend && uv run uvicorn app.main:app --reload --port 8080"

# Frontend on 3000
"npm run dev -- --port 3000"
```

### Production Build

```bash
# Build frontend for production
cd frontend && npm run build

# Serve with backend
cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Running Tests

```bash
# Run all tests
make test

# Backend tests only
cd backend && uv run pytest

# Frontend tests only
cd frontend && npm test
```

## Environment Variables

### Backend (.env)

Create `backend/.env`:
```env
MODEL_NAME=dima806/deepfake_vs_real_image_detection
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

## Logs and Debugging

### Backend Logs

- **INFO**: Normal operations
- **WARNING**: Non-critical issues
- **ERROR**: Failed operations
- **DEBUG**: Detailed debugging (set LOG_LEVEL=DEBUG)

### Frontend Logs

- **Vite**: Build and HMR logs
- **Console**: Browser console logs
- **Network**: Check browser DevTools Network tab

## Performance Tips

### Backend

1. **Use GPU**: Install CUDA for 10x faster inference
2. **Batch Processing**: Process multiple images at once
3. **Model Caching**: Model loads once, reused for all requests

### Frontend

1. **HMR**: Changes reflect instantly without full reload
2. **Code Splitting**: Vite automatically splits code
3. **Asset Optimization**: Images and assets optimized on build

## Monitoring

### Backend Health

```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_type": "vision-transformer-vit"
}
```

### Frontend Status

Open http://localhost:5173 - should see the upload interface

## Cleanup

```bash
# Clean temporary files and caches
make clean

# Remove virtual environments
rm -rf backend/.venv
rm -rf frontend/node_modules

# Full reinstall
make clean
make install
```

---

**Pro Tip:** Keep the terminal with `make run` visible while developing to monitor both servers and catch errors immediately!
