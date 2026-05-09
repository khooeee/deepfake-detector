# Quick Run Guide

## 🚀 Super Quick Start (Using Makefile)

### One-Command Install
```bash
make install
```
This installs both backend and frontend dependencies automatically!

### One-Command Run
```bash
make run
```
This starts both backend and frontend servers in parallel!

✅ **That's it!** Open http://localhost:5173 in your browser.

---

## 📋 Makefile Commands

```bash
make help              # Show all available commands
make install           # Install all dependencies (backend + frontend)
make run               # Run both servers (backend + frontend)
make dev               # Same as 'make run'
make clean             # Clean up temporary files
make install-backend   # Install backend only
make install-frontend  # Install frontend only
make run-backend       # Run backend only
make run-frontend      # Run frontend only
```

---

## 🔧 Manual Setup (Alternative)

### First Time Setup

#### 1. Backend Setup (5 minutes)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Frontend Setup (2 minutes)
```bash
cd frontend
npm install
```

### Running Manually

#### Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m app.main
```
✅ Backend running at: http://localhost:8000

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Frontend running at: http://localhost:5173

---

## 🎯 Access the App

Open your browser: **http://localhost:5173**

## 🧪 Quick Test

1. Upload an image (drag & drop or click)
2. Click "Analyze Image"
3. View results in 2-4 seconds

---

## 🐛 Troubleshooting

### Using Makefile

**Make not found?**
- macOS/Linux: Install with `brew install make` or `apt-get install make`
- Windows: Use Git Bash or WSL, or follow manual setup

**Permission errors?**
```bash
chmod +x Makefile
```

### Manual Setup Issues

**Backend won't start?**
- Check Python version: `python --version` (need 3.9+)
- Activate venv: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

**Frontend won't start?**
- Check Node version: `node --version` (need 16+)
- Clear cache: `rm -rf node_modules && npm install`

**Model download slow?**
- First run downloads ~300MB model
- Takes 1-2 minutes
- Subsequent runs are instant

**Port already in use?**
- Backend (8000): Change in `backend/app/main.py`
- Frontend (5173): Vite will auto-select next port

---

## 🛑 Stop the Application

### Using Makefile
Press `Ctrl+C` once (stops both servers)

### Manual
Press `Ctrl+C` in both terminals

---

## 📚 More Information

- **Detailed Setup**: See [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md)
- **Project Overview**: See [`PROJECT_SUMMARY.md`](PROJECT_SUMMARY.md)
- **Architecture**: See [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 💡 Pro Tips

1. **Use Makefile**: Simplest way to manage the project
2. **First Run**: Be patient during model download
3. **GPU**: If available, inference is 3-5x faster
4. **Test Images**: Try various images to see accuracy

---

**Recommended**: Use `make install` and `make run` for the easiest experience! 🎉
