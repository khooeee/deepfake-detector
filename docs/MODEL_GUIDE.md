# EfficientNet-B4 Model Guide (Legacy Reference)

> **Note**: This document is kept for reference purposes. The project now uses **Vision Transformer (ViT-Large)** as the primary model. See [`MODERN_MODELS_2026.md`](MODERN_MODELS_2026.md) for current recommendations.

## What is EfficientNet-B4?

EfficientNet-B4 is a convolutional neural network (CNN) architecture designed for image classification tasks. It's part of the EfficientNet family developed by Google Research in 2019. While it was a strong choice in 2019-2021, newer transformer-based models like ViT now offer superior performance.

## Overview

**EfficientNet** is a family of neural network models (B0 through B7) that use compound scaling to balance network depth, width, and resolution. The "B4" variant offers an optimal balance between accuracy and computational efficiency.

### Key Specifications

| Attribute | Value |
|-----------|-------|
| **Parameters** | ~19 million |
| **Model Size** | ~75MB |
| **Input Resolution** | 380×380 pixels (adaptable) |
| **Layers** | 32 convolutional blocks |
| **ImageNet Accuracy** | ~83% top-1 |
| **Inference Speed** | 1-3 seconds per image (CPU) |

## Architecture

### Core Components

1. **MBConv Blocks** (Mobile Inverted Bottleneck Convolutions)
   - Efficient convolution operations
   - Reduces computational cost
   - Maintains high accuracy

2. **Squeeze-and-Excitation (SE) Modules**
   - Channel-wise attention mechanism
   - Emphasizes important features
   - Improves feature representation

3. **Swish Activation Function**
   - Smooth, non-monotonic activation
   - Better gradient flow
   - Improved training dynamics

4. **Compound Scaling**
   - Scales depth, width, and resolution together
   - More efficient than scaling one dimension
   - Optimal resource utilization

### Architecture Diagram

```
Input Image (224×224×3)
    ↓
Stem (Conv + BN + Swish)
    ↓
MBConv Block 1 (16 filters)
    ↓
MBConv Block 2 (24 filters)
    ↓
MBConv Block 3 (40 filters)
    ↓
MBConv Block 4 (80 filters)
    ↓
MBConv Block 5 (112 filters)
    ↓
MBConv Block 6 (192 filters)
    ↓
MBConv Block 7 (320 filters)
    ↓
Head (Conv + Pooling + FC)
    ↓
Output (1792 features)
    ↓
Classification Layer (2 classes for deepfake detection)
    ↓
Softmax (Probability scores)
```

## Why EfficientNet-B4 for Deepfake Detection?

### 1. Optimal Balance

**Position in EfficientNet Family:**
- **B0-B2**: Too small, may miss subtle artifacts
- **B4**: Sweet spot for web applications ✓
- **B5-B7**: Too large, slower inference

### 2. Feature Detection Capabilities

EfficientNet-B4 excels at detecting:
- **Compression artifacts** from GAN generation
- **Facial inconsistencies** (eyes, teeth, hair)
- **Unnatural texture patterns**
- **Color/lighting inconsistencies**
- **Boundary artifacts** around manipulated regions
- **Frequency domain anomalies**

### 3. Performance Characteristics

```
Accuracy: ~94% on deepfake datasets
Speed: 1-3 seconds per image
Memory: ~500MB RAM during inference
GPU: Optional (3-5x faster with GPU)
```

### 4. Transfer Learning Benefits

- Pre-trained on ImageNet (1.2M images, 1000 classes)
- Learned general visual features
- Can be fine-tuned for deepfake detection
- Requires less training data

## Comparison with Alternative Models

### Model Comparison Table

| Model | Size | Speed | Accuracy | RAM | Best Use Case |
|-------|------|-------|----------|-----|---------------|
| **EfficientNet-B4** | 75MB | Fast | ~94% | 500MB | **Web apps (Recommended)** |
| EfficientNet-B0 | 20MB | Very Fast | ~90% | 200MB | Mobile/Edge devices |
| EfficientNet-B7 | 256MB | Slow | ~96% | 2GB | Research/Maximum accuracy |
| XceptionNet | 88MB | Medium | ~95% | 600MB | High accuracy needs |
| ResNet-50 | 98MB | Medium | ~92% | 700MB | Legacy compatibility |
| MobileNetV2 | 14MB | Very Fast | ~88% | 150MB | Resource-constrained |

### When to Choose Each Model

**Choose EfficientNet-B4 when:**
- Building a web application ✓
- Need balance of speed and accuracy ✓
- Have standard hardware (no GPU required) ✓
- Want reliable real-time detection ✓

**Choose EfficientNet-B0 when:**
- Deploying to mobile devices
- Extremely limited resources
- Speed is critical over accuracy

**Choose EfficientNet-B7 when:**
- Maximum accuracy is required
- Have powerful GPU available
- Speed is not a concern
- Research or forensic applications

**Choose XceptionNet when:**
- Need slightly higher accuracy
- Following research papers (commonly used baseline)
- Have GPU available

## How It Detects Deepfakes

### Detection Mechanisms

1. **Low-Level Features**
   - JPEG compression artifacts
   - Pixel-level inconsistencies
   - Color space anomalies
   - Noise patterns

2. **Mid-Level Features**
   - Texture inconsistencies
   - Edge artifacts
   - Facial feature alignment
   - Skin texture patterns

3. **High-Level Features**
   - Facial structure coherence
   - Lighting consistency
   - Shadow patterns
   - Overall image composition

### Common Deepfake Artifacts Detected

```
✓ GAN fingerprints (specific to generation method)
✓ Blending artifacts at face boundaries
✓ Inconsistent lighting across face
✓ Unnatural eye reflections
✓ Teeth/mouth inconsistencies
✓ Hair texture anomalies
✓ Background-foreground mismatches
✓ Temporal inconsistencies (for video frames)
```

## Implementation in Your Project

### Model Loading (PyTorch)

```python
import torch
from torchvision import models

# Load pre-trained EfficientNet-B4
model = models.efficientnet_b4(pretrained=True)

# Modify for binary classification (real/fake)
num_features = model.classifier[1].in_features
model.classifier[1] = torch.nn.Linear(num_features, 2)

# Set to evaluation mode
model.eval()
```

### Image Preprocessing

```python
from torchvision import transforms

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
```

### Inference

```python
def predict(image_path):
    image = Image.open(image_path).convert('RGB')
    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

    return {
        'prediction': 'fake' if predicted.item() == 1 else 'real',
        'confidence': confidence.item(),
        'probabilities': {
            'real': probabilities[0][0].item(),
            'fake': probabilities[0][1].item()
        }
    }
```

## Fine-Tuning for Better Performance

### Recommended Datasets

1. **FaceForensics++**
   - 1.8M frames from 1000 videos
   - Multiple manipulation methods
   - Industry standard benchmark

2. **Celeb-DF**
   - High-quality deepfakes
   - Celebrity faces
   - Challenging dataset

3. **DFDC (Deepfake Detection Challenge)**
   - Large-scale dataset
   - Diverse manipulations
   - Real-world scenarios

### Fine-Tuning Process

```python
# Freeze early layers
for param in model.features[:20].parameters():
    param.requires_grad = False

# Train only later layers and classifier
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.001
)

# Train on deepfake dataset
for epoch in range(10):
    train_one_epoch(model, train_loader, optimizer)
    validate(model, val_loader)
```

## Performance Optimization

### Speed Improvements

1. **Use GPU if available**
   ```python
   device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
   model.to(device)
   ```

2. **Batch processing**
   ```python
   # Process multiple images at once
   batch = torch.stack([transform(img) for img in images])
   outputs = model(batch)
   ```

3. **Model quantization**
   ```python
   # Reduce model size and increase speed
   quantized_model = torch.quantization.quantize_dynamic(
       model, {torch.nn.Linear}, dtype=torch.qint8
   )
   ```

### Memory Optimization

1. **Use mixed precision**
2. **Clear cache regularly**
3. **Process images in batches**
4. **Use efficient data loading**

## Limitations and Considerations

### Known Limitations

1. **Novel Techniques**: May struggle with very new deepfake methods
2. **High-Quality Fakes**: Advanced deepfakes can fool the model
3. **Adversarial Attacks**: Specifically crafted images can bypass detection
4. **Dataset Bias**: Performance depends on training data diversity

### Best Practices

1. **Regular Updates**: Retrain on new deepfake techniques
2. **Ensemble Methods**: Combine with other models for better accuracy
3. **Human Review**: Use as assistance, not replacement for human judgment
4. **Confidence Thresholds**: Set appropriate thresholds for your use case

## Resources

### Official Resources
- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [PyTorch Documentation](https://pytorch.org/vision/stable/models.html)
- [TensorFlow Hub](https://tfhub.dev/google/efficientnet/b4/1)

### Deepfake Detection Resources
- [FaceForensics++ Dataset](https://github.com/ondyari/FaceForensics)
- [Deepfake Detection Challenge](https://www.kaggle.com/c/deepfake-detection-challenge)
- [Research Papers](https://paperswithcode.com/task/deepfake-detection)

### Implementation Examples
- [PyTorch Hub Examples](https://pytorch.org/hub/)
- [Hugging Face Models](https://huggingface.co/models?search=deepfake)
- [GitHub Repositories](https://github.com/topics/deepfake-detection)

## Conclusion

EfficientNet-B4 is an excellent choice for your deepfake detector web application because it:

✓ Provides high accuracy (~94%)
✓ Runs fast enough for web applications (1-3 seconds)
✓ Works on standard hardware (no GPU required)
✓ Has a reasonable model size (75MB)
✓ Is well-documented and supported
✓ Can be easily fine-tuned for better performance

The model strikes the perfect balance between accuracy, speed, and resource requirements for a production web application.
