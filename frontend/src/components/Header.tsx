import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔍</div>
            <div>
              <h1 className="text-2xl font-bold">Deepfake Detector</h1>
              <p className="text-blue-100 text-sm">AI-Powered Image Analysis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg">
            <span className="text-xs font-semibold">Powered by</span>
            <span className="text-sm font-bold">Vision Transformer</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

// Made with Bob
