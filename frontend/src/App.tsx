import React, { useState } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeImage } from './services/api';
import type { DetectionResult } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Detect AI-Generated Images
          </h2>
          <p className="text-gray-600">
            Upload an image to analyze whether it's authentic or AI-generated using
            state-of-the-art Vision Transformer technology.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <ImageUpload
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Results */}
        {results && !loading && (
          <div className="mb-8">
            <ResultsDisplay results={results} />
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && !loading && (
          <div className="max-w-2xl mx-auto flex justify-center space-x-4">
            {!results && (
              <button
                onClick={handleAnalyze}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
                         hover:bg-blue-700 transition-colors duration-200
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🔍 Analyze Image
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg
                       hover:bg-gray-700 transition-colors duration-200
                       shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🔄 Upload New Image
            </button>
          </div>
        )}

        {/* Info Section */}
        {!selectedFile && !loading && (
          <div className="max-w-2xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">High Accuracy</h3>
              <p className="text-sm text-gray-600">
                97-98% accuracy on standard benchmarks
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Analysis</h3>
              <p className="text-sm text-gray-600">
                Results in 2-4 seconds
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">
                Images processed and immediately deleted
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Powered by Vision Transformer (ViT-Large) • Built with React & FastAPI
          </p>
          <p className="text-xs text-gray-400 mt-2">
            For educational and research purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
