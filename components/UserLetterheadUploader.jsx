'use client';

import React, { useState } from 'react';

export default function UserLetterheadUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showConversionTip, setShowConversionTip] = useState(false);
  const [uploadedPath, setUploadedPath] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check if file is a JPG/JPEG
    if (!selectedFile.type.includes('jpeg') && !selectedFile.type.includes('jpg')) {
      setUploadError('Only JPG files are supported. Convert DOCX to JPG first.');
      setShowConversionTip(true);
      setFile(null);
      return;
    }
    
    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      setFile(null);
      return;
    }
    
    setUploadError('');
    setFile(selectedFile);
    setShowConversionTip(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      setUploadError('');
      
      const formData = new FormData();
      formData.append('letterhead', file);
      formData.append('type', 'user'); // Indicate this is for user letterhead
      
      const response = await fetch('/api/letterhead-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload letterhead');
      }
      
      const data = await response.json();
      
      setUploadedPath(data.letterheadPath);
      onUploadSuccess(data.letterheadPath);
      setFile(null);
      setUploadError('');
    } catch (error) {
      console.error('Error uploading letterhead:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload letterhead');
    } finally {
      setUploading(false);
    }
  };

  const goToConversionSite = () => {
    window.open('https://convertio.co/docx-jpg/', '_blank');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Upload a custom letterhead for this user (JPG format only).
        </p>
        
        {/* Always visible DOCX to JPG conversion button */}
        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1 font-medium">
                Have a DOCX letterhead? Convert it to JPG first
              </p>
              <p className="text-xs text-blue-600">
                Only JPG files can be used as letterheads
              </p>
            </div>
            <button
              type="button"
              onClick={goToConversionSite}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Convert at Convertio
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            accept=".jpg,.jpeg"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-[#014a2f] file:text-white
              hover:file:bg-[#014a2f]/90"
          />
          
          {showConversionTip && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700 mb-2">
                Need to convert a DOCX file to JPG?
              </p>
              <button
                type="button"
                onClick={goToConversionSite}
                className="text-sm bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition-colors"
              >
                Convert DOCX to JPG at Convertio
              </button>
            </div>
          )}
          
          {file && (
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`py-2 px-4 rounded-md text-sm font-medium ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-[#014a2f] text-white hover:bg-[#014a2f]/90'}`}
                >
                  {uploading ? 'Uploading...' : 'Upload Letterhead'}
                </button>
              </div>
            </div>
          )}
          
          {uploadedPath && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ✓ Letterhead uploaded successfully
              </p>
            </div>
          )}
          
          {uploadError && (
            <p className="text-sm text-red-600 mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
} 