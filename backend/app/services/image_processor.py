"""
Image preprocessing service
"""
from PIL import Image
import tempfile
import os
import logging

logger = logging.getLogger(__name__)


class ImageProcessor:
    """
    Service for preprocessing images before model inference.
    """

    def __init__(self, target_size: tuple = (224, 224)):
        """
        Initialize image processor.

        Args:
            target_size: Target image size (width, height)
        """
        self.target_size = target_size

    def preprocess(self, image_path: str) -> str:
        """
        Preprocess image for model input.

        Args:
            image_path: Path to input image

        Returns:
            Path to preprocessed image
        """
        try:
            # Load image
            img = Image.open(image_path)

            # Convert to RGB if necessary
            if img.mode != 'RGB':
                logger.info(f"Converting image from {img.mode} to RGB")
                img = img.convert('RGB')

            # Resize to target size
            if img.size != self.target_size:
                logger.info(f"Resizing image from {img.size} to {self.target_size}")
                img = img.resize(self.target_size, Image.LANCZOS)

            # Save processed image to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
                img.save(temp_file.name, 'JPEG', quality=95)
                processed_path = temp_file.name

            logger.info(f"Image preprocessed successfully: {processed_path}")
            return processed_path

        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise

    def get_image_info(self, image_path: str) -> dict:
        """
        Get information about an image.

        Args:
            image_path: Path to image file

        Returns:
            Dictionary with image information
        """
        try:
            img = Image.open(image_path)
            return {
                'size': img.size,
                'mode': img.mode,
                'format': img.format,
                'width': img.width,
                'height': img.height
            }
        except Exception as e:
            logger.error(f"Failed to get image info: {e}")
            raise

# Made with Bob
