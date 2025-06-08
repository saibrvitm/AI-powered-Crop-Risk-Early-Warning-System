import React, { useState, useRef } from 'react';
import axios from 'axios';

const DiseasePredictor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setPrediction(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setPrediction(null);
    } else {
      setError('Please drop an image file');
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post('http://localhost:8000/api/disease-predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPrediction(response.data);
      // Scroll to results
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error predicting disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Plant Disease Detection
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Upload an image of your plant leaf to detect diseases using AI
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Image Upload Area */}
        <div 
          className="mb-8 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="region"
          aria-label="Image upload area"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="image-upload"
            aria-label="Upload plant image"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Select Image
          </label>
          <p className="mt-2 text-sm text-gray-500">
            or drag and drop an image here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supported formats: JPG, PNG, JPEG (max 5MB)
          </p>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Image Preview</h2>
            <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Selected plant leaf"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handlePredict}
            disabled={!selectedImage || loading}
            className={`px-6 py-3 rounded-md text-white font-semibold ${
              !selectedImage || loading
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
            aria-label="Predict disease"
          >
            {loading ? 'Analyzing...' : 'Predict Disease'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors"
            aria-label="Reset form"
          >
            Reset
          </button>
        </div>

        {/* Results Section */}
        {prediction && (
          <div 
            ref={resultsRef}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
            role="region"
            aria-label="Prediction results"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Results</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  prediction.is_healthy ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-lg font-medium">
                  {prediction.is_healthy ? 'Healthy Plant' : 'Disease Detected'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Disease: </span>
                  {prediction.disease.replace(/_/g, ' ')}
                </p>
                <p className="text-gray-700 mt-2">
                  <span className="font-medium">Confidence: </span>
                  {(prediction.confidence * 100).toFixed(2)}%
                </p>
              </div>

              {!prediction.is_healthy && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Recommended Actions
                  </h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>Isolate the affected plant to prevent spread</li>
                    <li>Remove and destroy infected leaves</li>
                    <li>Consider appropriate fungicide or pesticide treatment</li>
                    <li>Monitor other plants for similar symptoms</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accessibility Information */}
        <div className="bg-blue-50 rounded-lg p-4 mt-8">
          <h2 className="text-lg font-medium text-blue-900 mb-2">
            Accessibility Information
          </h2>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Use the Tab key to navigate through interactive elements</li>
            <li>Press Enter or Space to activate buttons</li>
            <li>Screen readers will announce the prediction results</li>
            <li>High contrast mode is supported</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiseasePredictor; 