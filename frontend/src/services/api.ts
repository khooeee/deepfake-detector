import axios, { AxiosError } from 'axios';
import type { DetectionResult, HealthStatus, ApiError } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

/**
 * Analyze an image for deepfake detection
 * @param file - Image file to analyze
 * @returns Detection results
 */
export const analyzeImage = async (file: File): Promise<DetectionResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response) {
        // Server responded with error
        throw new Error(axiosError.response.data?.detail || 'Server error occurred');
      } else if (axiosError.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      }
    }
    // Error setting up request
    throw new Error('Failed to send request: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

/**
 * Check API health status
 * @returns Health status
 */
export const checkHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  } catch (error) {
    throw new Error('API health check failed');
  }
};

// Made with Bob
