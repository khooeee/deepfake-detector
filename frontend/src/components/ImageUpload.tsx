import React, { useRef, useState } from 'react';
import type { ImageUploadProps } from '../types';

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect, previewUrl, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!previewUrl ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl">📁</div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag and drop an image here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select
              </p>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Supported formats: JPEG, PNG</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto max-h-96 object-contain bg-gray-100"
          />
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
            Preview
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

// Made with Bob
