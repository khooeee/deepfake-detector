# Model Accuracy Troubleshooting

## Issue: All Images Classified as Real (99% Authentic)

If you're experiencing this issue, here are the possible causes and solutions:

## 1. Model Limitations

### Understanding the Model
The model (`dima806/deepfake_vs_real_image_detection`) was trained on specific types of deepfakes:
- Face-swap deepfakes
- GAN-generated faces
- Specific manipulation techniques

### What It May NOT Detect Well
- **Modern AI-generated images** (Stable Diffusion, DALL-E, Midjourney)
- **Non-face deepfakes** (landscapes, objects)
- **Subtle manipulations** (color grading, minor edits)
- **High-quality deepfakes** using latest techniques
- **Deepfakes from 2024+** (model trained on older data)

## 2. Image Quality Issues

### Preprocessing Problems
The model expects:
- **224x224 pixels** (we resize automatically)
- **RGB format** (we convert automatically)
- **Proper normalization** (handled by ViT processor)

### Check Your Images
```python
# Test if image is being processed correctly
from PIL import Image
img = Image.open("your_image.jpg")
print(f"Size: {img.size}")
print(f"Mode: {img.mode}")
print(f"Format: {img.format}")
```

## 3. Model Configuration

### Verify Label Mapping
Run this to check the model's labels:
```bash
cd backend && uv run python test_model.py
```

Expected output:
```
Label mapping: {0: 'Real', 1: 'Fake'}
```

### Check Raw Predictions
The updated code now logs:
```
[BACKEND] INFO: Raw logits: [-2.3456, 5.6789]
[BACKEND] INFO: Probabilities: Real=0.0012, Fake=0.9988
[BACKEND] INFO: Prediction: fake (confidence: 0.9988)
```

## 4. Testing with Known Datasets

### Download Test Images

**Known Real Images:**
- Natural photographs from Unsplash
- Stock photos
- Your own camera photos

**Known Deepfake Images:**
Download from research datasets:

1. **FaceForensics++**
   - URL: https://github.com/ondyari/FaceForensics
   - Contains: Face-swap deepfakes
   - Best for: Testing face manipulation detection

2. **Celeb-DF**
   - URL: https://github.com/yuezunli/celeb-deepfakeforensics
   - Contains: Celebrity deepfakes
   - Best for: High-quality deepfake testing

3. **DFDC (Deepfake Detection Challenge)**
   - URL: https://ai.facebook.com/datasets/dfdc/
   - Contains: Various deepfake types
   - Best for: Comprehensive testing

### Test Script
```bash
# Run the test script
cd backend && uv run python test_model.py
```

## 5. Alternative Models

If the current model doesn't work well for your use case, consider:

### For Modern AI-Generated Images
```python
# In backend/app/models/detector.py, change model_name to:
model_name = "umm-maybe/AI-image-detector"  # Detects AI-generated images
```

### For Face Deepfakes
```python
model_name = "dima806/deepfake_vs_real_image_detection"  # Current (face-focused)
```

### For General Manipulation
```python
model_name = "microsoft/resnet-50"  # General image classification
# Note: Requires custom training for deepfake detection
```

## 6. Debugging Steps

### Step 1: Check Backend Logs
When you upload an image, look for:
```
[BACKEND] INFO: Processing image: test.jpg
[BACKEND] INFO: Raw logits: [x.xxxx, y.yyyy]
[BACKEND] INFO: Probabilities: Real=0.xxxx, Fake=0.yyyy
[BACKEND] INFO: Prediction: fake (confidence: 0.xxxx)
```

### Step 2: Verify Image Upload
Check that the image is being received:
```
[BACKEND] INFO: Received file: test.jpg (size: 123456 bytes)
```

### Step 3: Test with Known Images
1. Take a photo with your phone → Should be "real"
2. Download a known deepfake → Should be "fake"
3. Generate an AI image (Midjourney/DALL-E) → May be "real" (model limitation)

### Step 4: Check Model Output
Add this to `detector.py` for debugging:
```python
# After line 65 (probabilities calculation)
print(f"DEBUG - Logits: {logits}")
print(f"DEBUG - Probabilities: {probabilities}")
print(f"DEBUG - Predicted class: {predicted_class_idx}")
```

## 7. Model Performance Expectations

### What to Expect
- **Face-swap deepfakes**: 90-95% accuracy
- **GAN-generated faces**: 85-90% accuracy
- **Modern AI images**: 50-70% accuracy (not trained on these)
- **Real photos**: 95-99% accuracy

### Common False Positives
- Heavily edited photos
- Low-quality images
- Compressed images
- Images with filters

### Common False Negatives
- High-quality deepfakes
- Modern AI-generated images
- Subtle manipulations

## 8. Solutions

### Solution 1: Use Multiple Models
Combine predictions from multiple models:
```python
# Ensemble approach
model1_result = detector1.predict(image)
model2_result = detector2.predict(image)
final_prediction = combine_predictions([model1_result, model2_result])
```

### Solution 2: Adjust Threshold
Instead of 0.5, use a different threshold:
```python
# In detector.py, change line 71:
prediction = 'fake' if fake_prob > 0.3 else 'real'  # More sensitive
```

### Solution 3: Fine-tune the Model
Train on your specific deepfake types:
```python
# Requires training data and GPU
from transformers import Trainer, TrainingArguments
# ... fine-tuning code ...
```

### Solution 4: Use a Different Model
Try models specifically trained for your use case:
- **AI-generated images**: `umm-maybe/AI-image-detector`
- **Face deepfakes**: `selimsef/dfdc_deepfake_challenge`
- **General manipulation**: Custom trained models

## 9. Verification Checklist

- [ ] Model loads successfully
- [ ] Label mapping is correct (0=Real, 1=Fake)
- [ ] Images are being preprocessed correctly
- [ ] Backend logs show probabilities
- [ ] Tested with known real images
- [ ] Tested with known deepfake images
- [ ] Checked image quality and format
- [ ] Verified model is appropriate for your use case

## 10. Getting Help

### Check Logs
```bash
# Start backend with verbose logging
cd backend && uv run uvicorn app.main:app --reload --log-level debug
```

### Test Model Directly
```bash
cd backend && uv run python test_model.py
```

### Report Issues
If the model consistently misclassifies:
1. Note the type of images (faces, objects, AI-generated, etc.)
2. Check the model's training data
3. Consider using a different model
4. Fine-tune on your specific use case

## Important Notes

1. **No model is perfect**: Even the best models have 90-95% accuracy
2. **Training data matters**: Models only detect what they were trained on
3. **Modern deepfakes are hard**: Latest techniques are very sophisticated
4. **Context is important**: Use multiple signals, not just one model
5. **Keep updating**: Deepfake technology evolves rapidly

---

**The model has been updated to use the correct label mapping and includes detailed logging. Restart the backend to see the improvements!**
