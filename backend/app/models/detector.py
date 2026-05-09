"""
Deepfake Detection Model using Vision Transformer (ViT)
"""
import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import logging

logger = logging.getLogger(__name__)


class DeepfakeDetector:
    """
    Deepfake detector using Vision Transformer (ViT-Large) model.
    Pre-trained on deepfake detection datasets.
    """

    def __init__(self, model_name: str = "dima806/deepfake_vs_real_image_detection"):
        """
        Initialize the deepfake detector.

        Args:
            model_name: Hugging Face model identifier
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

        try:
            # Load Vision Transformer model
            logger.info(f"Loading model: {model_name}")
            self.model = ViTForImageClassification.from_pretrained(model_name)
            self.processor = ViTImageProcessor.from_pretrained(model_name)

            self.model.to(self.device)
            self.model.eval()

            # Get label mapping from model config
            self.id2label = self.model.config.id2label
            self.label2id = self.model.config.label2id

            logger.info(f"Model loaded successfully")
            logger.info(f"Label mapping: {self.id2label}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def predict(self, image_path: str) -> dict:
        """
        Predict if an image is real or fake.

        Args:
            image_path: Path to the image file

        Returns:
            Dictionary containing prediction results:
            - prediction: 'real' or 'fake'
            - confidence: confidence score (0-1)
            - probabilities: dict with 'real' and 'fake' probabilities
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Run inference
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=1)

            # Get predicted class
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
            predicted_label = self.id2label[predicted_class_idx]

            # Get probabilities for each class
            real_prob = probabilities[0][self.label2id['Real']].item()
            fake_prob = probabilities[0][self.label2id['Fake']].item()

            # Determine prediction (use model's prediction)
            prediction = predicted_label.lower()  # 'real' or 'fake'
            confidence = probabilities[0][predicted_class_idx].item()

            result = {
                'prediction': prediction,
                'confidence': confidence,
                'probabilities': {
                    'real': real_prob,
                    'fake': fake_prob
                }
            }

            logger.info(f"Raw logits: {logits[0].tolist()}")
            logger.info(f"Probabilities: Real={real_prob:.4f}, Fake={fake_prob:.4f}")
            logger.info(f"Prediction: {prediction} (confidence: {confidence:.4f})")
            return result

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise

    def predict_batch(self, image_paths: list) -> list:
        """
        Predict multiple images in batch.

        Args:
            image_paths: List of image file paths

        Returns:
            List of prediction dictionaries
        """
        try:
            # Load and preprocess images
            images = [Image.open(path).convert('RGB') for path in image_paths]
            inputs = self.processor(images=images, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Run inference
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=1)

            # Process results
            results = []
            for i in range(len(image_paths)):
                # Get predicted class for this image
                predicted_class_idx = torch.argmax(probabilities[i]).item()
                predicted_label = self.id2label[predicted_class_idx]

                # Get probabilities
                real_prob = probabilities[i][self.label2id['Real']].item()
                fake_prob = probabilities[i][self.label2id['Fake']].item()

                prediction = predicted_label.lower()
                confidence = probabilities[i][predicted_class_idx].item()

                results.append({
                    'prediction': prediction,
                    'confidence': confidence,
                    'probabilities': {
                        'real': real_prob,
                        'fake': fake_prob
                    }
                })

            logger.info(f"Batch prediction completed for {len(image_paths)} images")
            return results

        except Exception as e:
            logger.error(f"Batch prediction failed: {e}")
            raise

# Made with Bob
