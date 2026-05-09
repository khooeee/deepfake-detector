# Setup Instructions - Deepfake Detector

## Quick Start

Follow these steps to get the application running on your machine.

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn
- 4GB+ RAM (for running the ML model)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# This will download the Vision Transformer model (~300MB)
# It happens automatically on first run
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node dependencies
npm install
# or
yarn install
```

### Step 3: Run the Application

You need to run both backend and frontend in separate terminals.

#### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # Activate venv if not already active
python -m app.main
```

The backend will start on `http://localhost:8000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# or
yarn dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## First Run

On the first run, the backend will:
1. Download the Vision Transformer model from Hugging Face (~300MB)
2. Load the model into memory
3. This may take 1-2 minutes

Subsequent runs will be much faster as the model is cached.

## Testing the Application

1. Open `http://localhost:5173` in your browser
2. Upload a test image (JPEG or PNG, max 10MB)
3. Click "Analyze Image"
4. View the results showing whether the image is real or fake

## Troubleshooting

### Backend Issues

**Model download fails:**
```bash
# Check internet connection
# Try manually downloading:
python -c "from transformers import ViTForImageClassification; ViTForImageClassification.from_pretrained('dima806/deepfake_vs_real_image_detection')"
```

**Port 8000 already in use:**
```bash
# Change port in backend/app/main.py (line 180)
# Or kill the process using port 8000
```

**Import errors:**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Vite will automatically use next available port
# Or change port in frontend/vite.config.js
```

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend is running on port 8000
- Check CORS settings in backend/app/main.py

## Performance Tips

### For Faster Inference

1. **Use GPU (if available):**
   - Install CUDA-enabled PyTorch
   - Model will automatically use GPU
   - Reduces inference time from 2-4s to <1s

2. **Optimize for CPU:**
   - Close other applications
   - Ensure sufficient RAM (4GB+)

### For Development

1. **Backend hot reload:**
   - Already enabled with `--reload` flag
   - Changes to Python files auto-restart server

2. **Frontend hot reload:**
   - Vite provides instant HMR
   - Changes reflect immediately

## Production Deployment

### Backend

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```bash
# Build for production
npm run build

# Serve with any static server
npm run preview
```

## Environment Variables

### Backend (.env)

Create `backend/.env`:
```
MODEL_NAME=dima806/deepfake_vs_real_image_detection
MAX_UPLOAD_SIZE=10485760
PORT=8000
```

### Frontend (.env)

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

## System Requirements

### Minimum
- CPU: Dual-core 2GHz+
- RAM: 4GB
- Storage: 1GB free space
- OS: Windows 10, macOS 10.15+, or Linux

### Recommended
- CPU: Quad-core 3GHz+
- RAM: 8GB
- GPU: NVIDIA GPU with CUDA support (optional)
- Storage: 2GB free space

## Next Steps

1. Review the code in `backend/app/` and `frontend/src/`
2. Customize the UI in React components
3. Adjust model parameters in `backend/app/models/detector.py`
4. Add additional features as needed

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in terminal output
3. Check browser console for frontend errors
4. Refer to TECHNICAL_SPEC.md for implementation details

---

Happy detecting! 🔍
