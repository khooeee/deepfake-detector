# Quick Start Guide - Deepfake Detector

This guide will help you get the deepfake detector app up and running in minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 16+ installed (`node --version`)
- ✅ Python 3.9+ installed (`python --version`)
- ✅ pip installed (`pip --version`)
- ✅ At least 4GB RAM available

## 5-Minute Setup

### Step 1: Project Structure (1 min)

Create the basic project structure:

```bash
# Create directories
mkdir -p frontend backend/app/models backend/app/routes backend/app/services backend/app/utils
mkdir -p backend/models/pretrained backend/tests
mkdir -p frontend/src/components frontend/src/services frontend/src/utils

# Create placeholder files
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
```

### Step 2: Backend Setup (2 min)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.9
pillow==10.2.0
torch==2.2.0
torchvision==0.17.0
transformers==4.37.0
accelerate==0.26.0
numpy==1.26.3
pydantic==2.6.0
python-dotenv==1.0.1
EOF

# Install dependencies (this may take a minute)
pip install -r requirements.txt
```

### Step 3: Frontend Setup (2 min)

```bash
cd ../frontend

# Initialize React app with Vite
npm create vite@latest . -- --template react

# Install dependencies
npm install axios

# Install Tailwind CSS (optional but recommended)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Next Steps

Now that your environment is set up, you're ready to implement the application!

### Option 1: Manual Implementation
Follow the detailed implementation steps in [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) to build each component.

### Option 2: Use Code Mode
Switch to Code mode to have the implementation done automatically:

1. Review the plan and architecture documents
2. Approve the plan
3. Switch to Code mode
4. The code will be generated following the specifications

## Verification

### Test Backend Setup

```bash
cd backend
source venv/bin/activate
python -c "import fastapi; import torch; print('Backend dependencies OK')"
```

### Test Frontend Setup

```bash
cd frontend
npm run dev
```

You should see the Vite dev server start successfully.

## Common Issues

### Python Version Issues
If you have multiple Python versions:
```bash
python3.9 -m venv venv  # Use specific version
```

### Node Version Issues
Use nvm to manage Node versions:
```bash
nvm install 18
nvm use 18
```

### Torch Installation Issues
For CPU-only (smaller download):
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

For GPU support (CUDA):
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Project Structure Overview

After setup, your structure should look like:

```
deepfake-detector/
├── frontend/
│   ├── node_modules/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── venv/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── requirements.txt
├── README.md
├── ARCHITECTURE.md
├── TECHNICAL_SPEC.md
└── QUICKSTART.md (this file)
```

## What's Next?

1. **Review the Plan**: Check [`ARCHITECTURE.md`](ARCHITECTURE.md) for system design
2. **Review Technical Details**: See [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) for implementation details
3. **Start Coding**: Begin implementing following the todo list
4. **Or Switch Modes**: Use Code mode for automated implementation

## Estimated Time to Complete

- **Setup**: 5 minutes (done!)
- **Backend Implementation**: 2-3 hours
- **Frontend Implementation**: 2-3 hours
- **Testing & Polish**: 1-2 hours
- **Total**: 5-8 hours for MVP

## Need Help?

- Check [`README.md`](README.md) for detailed documentation
- Review [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) for code examples
- See [`ARCHITECTURE.md`](ARCHITECTURE.md) for system design

---

Ready to build? Let's create an amazing deepfake detector! 🚀
