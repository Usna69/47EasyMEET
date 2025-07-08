'use client';

import React, { useState } from 'react';

export default function UserLetterheadUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setSelectedFile(null);
      return;
    }
    // Check if file is a JPG/JPEG
    if (!selectedFile.type.includes('jpeg') && !selectedFile.type.includes('jpg')) {
      setUploadError('Only JPG files are supported. Convert DOCX to JPG first.');
      setFile(null);
      setSelectedFile(null);
      return;
    }
    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      setFile(null);
      setSelectedFile(null);
      return;
    }
    setUploadError('');
    setFile(selectedFile);
    setSelectedFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadError('');
      setSuccess('');
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
      setSuccess('Sector letterhead uploaded successfully!');
      setFile(null);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('user-letterhead-upload');
      if (fileInput) fileInput.value = '';
      onUploadSuccess(data.letterheadPath);
    } catch (error) {
      console.error('Error uploading letterhead:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload letterhead');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setSelectedFile(null);
    setUploadError('');
    const fileInput = document.getElementById('user-letterhead-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sector Letterhead Upload</h3>
          <p className="text-sm text-gray-600">
            Upload the sector (user) letterhead that will be used when the toggle is enabled
          </p>
        </div>
        <div className="flex items-center">
          <svg className="w-6 h-6 text-[#014a2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
      </div>
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {uploadError}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {success}
        </div>
      )}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="user-letterhead-upload"
            onChange={handleFileChange}
            accept="image/jpeg"
            className="hidden"
          />
          <label
            htmlFor="user-letterhead-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#014a2f] hover:bg-[#014a2f]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014a2f]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Select Sector Letterhead
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Upload a JPG image (max 5MB) to use as your sector letterhead
          </p>
        </div>
        {selectedFile && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Selected File:</p>
                <p className="text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={removeFile}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-[#014a2f] text-white rounded-md hover:bg-[#014a2f]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Sector Letterhead"}
          </button>
        </div>
      </div>
    </div>
  );
} 