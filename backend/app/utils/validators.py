"""
Image validation utilities
"""
from fastapi import UploadFile
from PIL import Image
import io

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png'}
MIN_DIMENSION = 32
MAX_DIMENSION = 4096


def validate_image(file: UploadFile) -> str:
    """
    Validate uploaded image file.

    Args:
        file: Uploaded file from FastAPI

    Returns:
        Error message if validation fails, None if valid
    """
    # Check file extension
    if not file.filename:
        return "No filename provided"

    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return f"Invalid content type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"

    return None


def validate_image_content(content: bytes) -> str:
    """
    Validate image content (size, dimensions, format).

    Args:
        content: Image file content as bytes

    Returns:
        Error message if validation fails, None if valid
    """
    # Check file size
    if len(content) > MAX_FILE_SIZE:
        return f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB"

    # Try to open and validate image
    try:
        image = Image.open(io.BytesIO(content))

        # Check image dimensions
        width, height = image.size
        if width < MIN_DIMENSION or height < MIN_DIMENSION:
            return f"Image too small. Minimum dimensions: {MIN_DIMENSION}x{MIN_DIMENSION}px"

        if width > MAX_DIMENSION or height > MAX_DIMENSION:
            return f"Image too large. Maximum dimensions: {MAX_DIMENSION}x{MAX_DIMENSION}px"

        # Verify it's a valid image format
        if image.format not in ['JPEG', 'PNG']:
            return f"Invalid image format. Allowed: JPEG, PNG"

        return None

    except Exception as e:
        return f"Invalid image file: {str(e)}"

# Made with Bob
