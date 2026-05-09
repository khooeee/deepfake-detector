# Model Detection Flow - How It Works

## Overview
The deepfake detection uses a **Vision Transformer (ViT-Large)** model from Hugging Face, specifically fine-tuned for deepfake detection.

## Complete Detection Flow

### 1. **Model Initialization** (`backend/app/models/detector.py`)

```python
class DeepfakeDetector:
    def __init__(self, model_name="dima806/deepfake_vs_real_image_detection"):
        # Detect if GPU is available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load pre-trained Vision Transformer model from Hugging Face
        self.model = ViTForImageClassification.from_pretrained(model_name)
        self.processor = ViTImageProcessor.from_pretrained(model_name)

        # Move model to GPU/CPU and set to evaluation mode
        self.model.to(self.device)
        self.model.eval()
```

**What happens:**
- Downloads the pre-trained model from Hugging Face (first time only)
- Model is ~300MB and cached locally
- Automatically uses GPU if available, otherwise CPU
- Model is loaded once at startup and reused for all predictions

### 2. **API Endpoint** (`backend/app/main.py`)

```python
@app.post("/api/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    # 1. Validate uploaded file
    validation_error = validate_image(file)

    # 2. Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(content)
        temp_path = temp_file.name

    # 3. Preprocess image
    processed_path = image_processor.preprocess(temp_path)

    # 4. Run detection
    result = detector.predict(processed_path)

    # 5. Return results and clean up
    return JSONResponse(content=response)
```

### 3. **Image Preprocessing** (`backend/app/services/image_processor.py`)

```python
def preprocess(self, image_path: str) -> str:
    # Open image
    image = Image.open(image_path)

    # Convert to RGB (remove alpha channel if present)
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Resize to optimal size (224x224 for ViT)
    image = image.resize((224, 224), Image.Resampling.LANCZOS)

    # Save preprocessed image
    return processed_path
```

### 4. **Model Prediction** (`backend/app/models/detector.py`)

```python
def predict(self, image_path: str) -> dict:
    # Load and preprocess image
    image = Image.open(image_path).convert('RGB')

    # Process image for ViT model
    inputs = self.processor(images=image, return_tensors="pt")
    inputs = {k: v.to(self.device) for k, v in inputs.items()}

    # Run inference (no gradient calculation needed)
    with torch.no_grad():
        outputs = self.model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=1)

    # Extract probabilities
    fake_prob = probabilities[0][1].item()  # Class 1 = fake
    real_prob = probabilities[0][0].item()  # Class 0 = real

    # Determine prediction
    prediction = 'fake' if fake_prob > 0.5 else 'real'
    confidence = max(fake_prob, real_prob)

    return {
        'prediction': prediction,
        'confidence': confidence,
        'probabilities': {
            'real': real_prob,
            'fake': fake_prob
        }
    }
```

## Step-by-Step Breakdown

### Step 1: Image Upload
```
User uploads image → Frontend sends to /api/detect
```

### Step 2: Validation
```python
# Check file type (JPEG, PNG only)
# Check file size (max 10MB)
# Verify image can be opened
```

### Step 3: Preprocessing
```python
# Convert to RGB
# Resize to 224x224 pixels
# Normalize pixel values (done by ViT processor)
```

### Step 4: Model Inference
```python
# Image → ViT Processor → Tensor
# Tensor → ViT Model → Logits
# Logits → Softmax → Probabilities
# Probabilities → Prediction (real/fake)
```

### Step 5: Response
```json
{
  "prediction": "fake",
  "confidence": 0.9234,
  "probabilities": {
    "real": 0.0766,
    "fake": 0.9234
  },
  "details": {
    "model_used": "vision-transformer-vit",
    "processing_time": 2.34,
    "image_dimensions": [1920, 1080]
  }
}
```

## Vision Transformer Architecture

### How ViT Works for Deepfake Detection

1. **Patch Embedding**
   - Image divided into 16x16 pixel patches
   - Each patch converted to embedding vector

2. **Transformer Encoder**
   - Self-attention mechanism analyzes relationships between patches
   - Learns patterns that distinguish real from fake images

3. **Classification Head**
   - Final layer outputs 2 values (real/fake logits)
   - Softmax converts to probabilities

### Why ViT is Effective

- **Global Context**: Sees entire image, not just local features
- **Attention Mechanism**: Focuses on suspicious regions
- **Pre-trained**: Learned from millions of images
- **Fine-tuned**: Specifically trained on deepfake datasets

## Model Details

### Pre-trained Model
- **Name**: `dima806/deepfake_vs_real_image_detection`
- **Base**: Vision Transformer (ViT-Large)
- **Training**: Fine-tuned on deepfake detection datasets
- **Accuracy**: ~97-98% on standard benchmarks
- **Size**: ~300MB

### Input Requirements
- **Format**: RGB images
- **Size**: 224x224 pixels (automatically resized)
- **Normalization**: Handled by ViT processor

### Output
- **Classes**: 2 (real, fake)
- **Probabilities**: Sum to 1.0
- **Threshold**: 0.5 (adjustable)

## Performance

### Processing Time
- **CPU**: 2-4 seconds per image
- **GPU**: <1 second per image
- **Batch**: More efficient for multiple images

### Accuracy Factors
- **Image Quality**: Higher quality = better accuracy
- **Image Size**: Larger images provide more detail
- **Manipulation Type**: Some deepfakes harder to detect
- **Training Data**: Model trained on specific datasets

## Code Locations

### Core Files
1. **`backend/app/models/detector.py`** - Model wrapper and prediction logic
2. **`backend/app/main.py`** - API endpoint and request handling
3. **`backend/app/services/image_processor.py`** - Image preprocessing
4. **`backend/app/utils/validators.py`** - Input validation

### Key Functions
- `DeepfakeDetector.__init__()` - Load model
- `DeepfakeDetector.predict()` - Single image prediction
- `DeepfakeDetector.predict_batch()` - Batch prediction
- `detect_deepfake()` - API endpoint handler

## Example Usage

### Python API
```python
from app.models.detector import DeepfakeDetector

# Initialize detector
detector = DeepfakeDetector()

# Predict single image
result = detector.predict("path/to/image.jpg")
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']:.2%}")
```

### REST API
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "file=@image.jpg"
```

### Frontend (TypeScript)
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await axios.post('/api/detect', formData);
console.log(response.data.prediction); // 'real' or 'fake'
```

## Batch Processing

For multiple images:
```python
# Batch prediction (more efficient)
image_paths = ["img1.jpg", "img2.jpg", "img3.jpg"]
results = detector.predict_batch(image_paths)

for i, result in enumerate(results):
    print(f"Image {i+1}: {result['prediction']} ({result['confidence']:.2%})")
```

## Error Handling

The system handles various errors:
- Invalid file format
- Corrupted images
- File size too large
- Model loading failures
- GPU/CPU memory issues

All errors are logged and returned with appropriate HTTP status codes.

---
*The model runs automatically when you start the backend server with `make run-backend`*
