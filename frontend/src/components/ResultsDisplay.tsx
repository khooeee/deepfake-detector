import React from 'react';
import type { ResultsDisplayProps } from '../types';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const isFake = results.prediction === 'fake';
  const confidence = (results.confidence * 100).toFixed(2);
  const realProb = (results.probabilities.real * 100).toFixed(2);
  const fakeProb = (results.probabilities.fake * 100).toFixed(2);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Main Result Badge */}
      <div className={`
        text-center p-6 rounded-lg
        ${isFake
          ? 'bg-red-50 border-2 border-red-200'
          : 'bg-green-50 border-2 border-green-200'
        }
      `}>
        <div className="text-5xl mb-3">
          {isFake ? '⚠️' : '✓'}
        </div>
        <h2 className={`
          text-2xl font-bold
          ${isFake ? 'text-red-700' : 'text-green-700'}
        `}>
          {isFake ? 'Likely Deepfake' : 'Likely Authentic'}
        </h2>
        <p className="text-gray-600 mt-2">
          Confidence: <span className="font-semibold">{confidence}%</span>
        </p>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Confidence Score</h3>
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-500 ease-out
              ${isFake ? 'bg-red-500' : 'bg-green-500'}
            `}
            style={{ width: `${confidence}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Probabilities */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Detailed Analysis</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium text-gray-700">Authentic</span>
            </div>
            <span className="text-lg font-bold text-green-700">{realProb}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium text-gray-700">Deepfake</span>
            </div>
            <span className="text-lg font-bold text-red-700">{fakeProb}%</span>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      {results.details && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">
            Technical Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Model</p>
              <p className="font-medium text-gray-800">
                {results.details.model_used === 'vision-transformer-vit'
                  ? 'Vision Transformer'
                  : results.details.model_used}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Processing Time</p>
              <p className="font-medium text-gray-800">
                {results.details.processing_time}s
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Image Size</p>
              <p className="font-medium text-gray-800">
                {results.details.image_dimensions.join(' × ')}px
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Filename</p>
              <p className="font-medium text-gray-800 truncate">
                {results.details.filename}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ This is an AI-based analysis and should not be considered as definitive proof.
          Results should be verified through additional means for critical applications.
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;

// Made with Bob
