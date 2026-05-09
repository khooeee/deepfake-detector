/**
 * Type definitions for the Deepfake Detector application
 */

export interface DetectionResult {
  is_deepfake: boolean;
  confidence: number;
  prediction: 'real' | 'fake';
  probabilities: {
    real: number;
    fake: number;
  };
  details?: {
    model_used: string;
    processing_time: number;
    image_dimensions: [number, number];
    filename: string;
  };
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
}

export interface ApiError {
  detail: string;
}

// Component Props
export interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  disabled: boolean;
}

export interface ResultsDisplayProps {
  results: DetectionResult;
}

export interface LoadingSpinnerProps {
  message?: string;
}

// Made with Bob
