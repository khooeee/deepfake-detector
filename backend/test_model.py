"""
Test script to verify the deepfake detection model is working correctly
"""
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.detector import DeepfakeDetector
from PIL import Image
import requests
from io import BytesIO

def test_with_sample_images():
    """Test the model with sample images"""
    print("=" * 60)
    print("Testing Deepfake Detection Model")
    print("=" * 60)

    # Initialize detector
    print("\n1. Loading model...")
    detector = DeepfakeDetector()
    print(f"   ✓ Model loaded on device: {detector.device}")
    print(f"   ✓ Label mapping: {detector.id2label}")

    # Test with a real image (download from internet)
    print("\n2. Testing with a real image...")
    try:
        # Download a real image (example: a landscape photo)
        real_url = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        response = requests.get(real_url, timeout=10)
        img = Image.open(BytesIO(response.content))
        img.save("/tmp/test_real.jpg")

        result = detector.predict("/tmp/test_real.jpg")
        print(f"   Prediction: {result['prediction']}")
        print(f"   Confidence: {result['confidence']:.4f}")
        print(f"   Real probability: {result['probabilities']['real']:.4f}")
        print(f"   Fake probability: {result['probabilities']['fake']:.4f}")

        if result['prediction'] == 'real':
            print("   ✓ Correctly identified as REAL")
        else:
            print("   ✗ Incorrectly identified as FAKE")
    except Exception as e:
        print(f"   ✗ Error testing real image: {e}")

    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)

    print("\nNOTE: If your deepfake images are being classified as real,")
    print("it could mean:")
    print("1. The images are actually high-quality and hard to detect")
    print("2. The model needs fine-tuning on your specific deepfake type")
    print("3. The images might actually be real")
    print("\nTry testing with known deepfake images from datasets like:")
    print("- FaceForensics++")
    print("- Celeb-DF")
    print("- DFDC (Deepfake Detection Challenge)")

if __name__ == "__main__":
    test_with_sample_images()

# Made with Bob
