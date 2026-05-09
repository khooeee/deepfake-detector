"""
FastAPI application for deepfake detection
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
import tempfile
import os
import logging
from pathlib import Path

from app.models.detector import DeepfakeDetector
from app.services.image_processor import ImageProcessor
from app.utils.validators import validate_image, validate_image_content

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Deepfake Detector API",
    description="API for detecting deepfake images using Vision Transformer",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global detector instance (loaded once at startup)
detector = None
image_processor = ImageProcessor()


@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global detector
    try:
        logger.info("Loading deepfake detection model...")
        detector = DeepfakeDetector()
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Deepfake Detector API",
        "version": "1.0.0",
        "model": "Vision Transformer (ViT-Large)",
        "endpoints": {
            "health": "/api/health",
            "detect": "/api/detect"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": detector is not None,
        "model_type": "vision-transformer-vit"
    }


@app.post("/api/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    """
    Detect if an uploaded image is a deepfake.

    Args:
        file: Uploaded image file (JPEG or PNG)

    Returns:
        JSON response with detection results
    """
    start_time = time.time()
    temp_path = None
    processed_path = None

    try:
        # Validate file metadata
        validation_error = validate_image(file)
        if validation_error:
            raise HTTPException(status_code=400, detail=validation_error)

        # Read file content
        content = await file.read()

        # Validate file content
        content_error = validate_image_content(content)
        if content_error:
            raise HTTPException(status_code=400, detail=content_error)

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        logger.info(f"Processing image: {file.filename}")

        # Get original image dimensions
        image_info = image_processor.get_image_info(temp_path)
        original_dimensions = [image_info['width'], image_info['height']]

        # Preprocess image
        processed_path = image_processor.preprocess(temp_path)

        # Run detection
        if detector is None:
            raise HTTPException(status_code=503, detail="Model not loaded")

        result = detector.predict(processed_path)

        # Calculate processing time
        processing_time = time.time() - start_time

        # Prepare response
        response = {
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
                "image_dimensions": original_dimensions,
                "filename": file.filename
            }
        }

        logger.info(f"Detection complete: {result['prediction']} ({processing_time:.2f}s)")
        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

    finally:
        # Clean up temporary files
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to remove temp file {temp_path}: {e}")

        if processed_path and os.path.exists(processed_path):
            try:
                os.remove(processed_path)
            except Exception as e:
                logger.warning(f"Failed to remove processed file {processed_path}: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

# Made with Bob
