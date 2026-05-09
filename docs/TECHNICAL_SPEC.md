# Technical Specification - Deepfake Detector

## 1. Model Selection & Integration

### Recommended Model: Vision Transformer (ViT-Large)

**Why Vision Transformer (ViT)?**
- State-of-the-art accuracy (97-98%)
- Excellent at capturing global context and subtle artifacts
- Transformer-based architecture with attention mechanisms
- Well-supported via Hugging Face transformers library
- Robust to adversarial attacks

**Model Specifications:**
- **Model**: `dima806/deepfake_vs_real_image_detection` (ViT-based)
- **Accuracy**: ~97-98% on standard benchmarks
- **Size**: ~300MB
- **Inference**: 2-4 seconds (CPU), <1 second (GPU)
- **Input Resolution**: 224×224

**Alternative Models:**
1. **ConvNeXt V2**
   - Faster inference (1-2 seconds)
   - Good accuracy (~96%)
   - Smaller size (~200MB)

2. **Swin Transformer V2**
   - Similar accuracy to ViT (~97%)
   - Hierarchical architecture
   - Good for high-resolution images

### Model Integration Code Structure

```python
# backend/app/models/detector.py
import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image

class DeepfakeDetector:
    def __init__(self, model_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load Vision Transformer model
        model_name = model_path or "dima806/deepfake_vs_real_image_detection"
        self.model = ViTForImageClassification.from_pretrained(model_name)
        self.processor = ViTImageProcessor.from_pretrained(model_name)

        self.model.to(self.device)
        self.model.eval()

    def predict(self, image_path):
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        inputs = self.processor(images=image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Run inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=1)

        # Get predictions (assuming class 0=real, class 1=fake)
        fake_prob = probabilities[0][1].item()
        real_prob = probabilities[0][0].item()

        return {
            'prediction': 'fake' if fake_prob > 0.5 else 'real',
            'confidence': max(fake_prob, real_prob),
            'probabilities': {
                'real': real_prob,
                'fake': fake_prob
            }
        }
```

## 2. Backend Implementation Details

### FastAPI Application Structure

```python
# backend/app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
from pathlib import Path
import tempfile
import os

from app.models.detector import DeepfakeDetector
from app.services.image_processor import ImageProcessor
from app.utils.validators import validate_image

app = FastAPI(title="Deepfake Detector API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector (load model once at startup)
detector = None

@app.on_event("startup")
async def startup_event():
    global detector
    detector = DeepfakeDetector()
    print("Model loaded successfully")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": detector is not None
    }

@app.post("/api/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    start_time = time.time()

    # Validate file
    validation_error = validate_image(file)
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Process image
        processor = ImageProcessor()
        processed_path = processor.preprocess(temp_path)

        # Run detection
        result = detector.predict(processed_path)

        # Calculate processing time
        processing_time = time.time() - start_time

        # Get image dimensions
        from PIL import Image
        img = Image.open(temp_path)
        dimensions = img.size

        return JSONResponse({
            "success": True,
            "prediction": result['prediction'],
            "confidence": round(result['confidence'], 4),
            "probabilities": {
                "real": round(result['probabilities']['real'], 4),
                "fake": round(result['probabilities']['fake'], 4)
            },
            "details": {
                "model_used": "vision-transformer-vit",
                "processing_time": round(processing_time, 2),
                "image_dimensions": list(dimensions)
            }
        })

    finally:
        # Clean up temporary files
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if 'processed_path' in locals() and os.path.exists(processed_path):
            os.remove(processed_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Image Validation

```python
# backend/app/utils/validators.py
from fastapi import UploadFile
from PIL import Image
import io

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png'}

def validate_image(file: UploadFile) -> str:
    """Validate uploaded image file. Returns error message or None."""

    # Check file extension
    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return f"Invalid content type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"

    # Check file size (if available)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        return f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"

    return None
```

### Image Preprocessing

```python
# backend/app/services/image_processor.py
from PIL import Image
import tempfile
import os

class ImageProcessor:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size

    def preprocess(self, image_path):
        """Preprocess image for model input."""
        img = Image.open(image_path)

        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize to target size
        img = img.resize(self.target_size, Image.LANCZOS)

        # Save processed image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            img.save(temp_file.name, 'JPEG', quality=95)
            return temp_file.name
```

## 3. Frontend Implementation Details

### React Component Structure

```jsx
// frontend/src/App.jsx
import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import { analyzeImage } from './services/api';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      setResults(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <Header />
      <main className="container">
        <ImageUpload
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          disabled={loading}
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {results && !loading && (
          <ResultsDisplay results={results} />
        )}

        <div className="actions">
          {selectedFile && !loading && (
            <>
              {!results && (
                <button onClick={handleAnalyze} className="btn-primary">
                  Analyze Image
                </button>
              )}
              <button onClick={handleReset} className="btn-secondary">
                Upload New Image
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
```

### API Service

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.detail || 'Server error');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request
      throw new Error('Failed to send request');
    }
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  } catch (error) {
    throw new Error('API health check failed');
  }
};
```

### Image Upload Component

```jsx
// frontend/src/components/ImageUpload.jsx
import React, { useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onFileSelect, previewUrl, disabled }) => {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="upload-container">
      {!previewUrl ? (
        <div
          className={`upload-area ${disabled ? 'disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <div className="upload-icon">📁</div>
          <p>Drag and drop an image here</p>
          <p className="upload-hint">or click to select</p>
          <p className="upload-formats">Supported: JPEG, PNG (max 10MB)</p>
        </div>
      ) : (
        <div className="preview-container">
          <img src={previewUrl} alt="Preview" className="preview-image" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

### Results Display Component

```jsx
// frontend/src/components/ResultsDisplay.jsx
import React from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results }) => {
  const isFake = results.prediction === 'fake';
  const confidence = (results.confidence * 100).toFixed(2);

  return (
    <div className="results-container">
      <div className={`result-badge ${isFake ? 'fake' : 'real'}`}>
        {isFake ? '⚠️ Likely Fake' : '✓ Likely Real'}
      </div>

      <div className="confidence-section">
        <h3>Confidence Score</h3>
        <div className="confidence-bar">
          <div
            className={`confidence-fill ${isFake ? 'fake' : 'real'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="confidence-text">{confidence}%</p>
      </div>

      <div className="probabilities-section">
        <h3>Detailed Probabilities</h3>
        <div className="probability-item">
          <span>Real:</span>
          <span>{(results.probabilities.real * 100).toFixed(2)}%</span>
        </div>
        <div className="probability-item">
          <span>Fake:</span>
          <span>{(results.probabilities.fake * 100).toFixed(2)}%</span>
        </div>
      </div>

      {results.details && (
        <div className="details-section">
          <h3>Analysis Details</h3>
          <p>Model: {results.details.model_used}</p>
          <p>Processing Time: {results.details.processing_time}s</p>
          <p>Image Size: {results.details.image_dimensions.join(' × ')}px</p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
```

## 4. Dependencies

### Backend Requirements (requirements.txt)

```
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
```

### Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

## 5. Environment Variables

### Backend (.env)

```
MODEL_PATH=./models/pretrained/vit_deepfake_detector
MAX_UPLOAD_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:5173
TEMP_DIR=/tmp/deepfake_detector
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
VITE_MAX_FILE_SIZE=10485760
```

## 6. Testing Strategy

### Backend Tests

```python
# backend/tests/test_detector.py
import pytest
from app.models.detector import DeepfakeDetector

def test_model_loading():
    detector = DeepfakeDetector()
    assert detector.model is not None

def test_prediction():
    detector = DeepfakeDetector()
    result = detector.predict("test_images/real.jpg")
    assert 'prediction' in result
    assert 'confidence' in result
    assert result['prediction'] in ['real', 'fake']
```

### Frontend Tests

```javascript
// frontend/src/components/__tests__/ImageUpload.test.jsx
import { render, screen } from '@testing-library/react';
import ImageUpload from '../ImageUpload';

test('renders upload area', () => {
  render(<ImageUpload onFileSelect={() => {}} />);
  expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
});
```

## 7. Performance Optimization

### Backend Optimizations
- Model caching at startup
- Async file operations
- Image preprocessing pipeline
- Response compression

### Frontend Optimizations
- Lazy loading components
- Image preview optimization
- Debounced API calls
- Error boundary implementation

## 8. Security Considerations

- File type validation (both client and server)
- File size limits
- CORS configuration
- Input sanitization
- Temporary file cleanup
- Rate limiting (future enhancement)

## 9. Deployment Checklist

- [ ] Environment variables configured
- [ ] Model weights downloaded
- [ ] CORS settings updated for production
- [ ] SSL/TLS certificates configured
- [ ] Database for logging (optional)
- [ ] Monitoring and error tracking
- [ ] Backup strategy
- [ ] CI/CD pipeline setup
