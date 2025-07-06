"use client";

import React from "react";

const { useState } = React;

interface SWGLetterheadUploaderProps {
  onUploadSuccess?: () => void;
}

export default function SWGLetterheadUploader({ onUploadSuccess }: SWGLetterheadUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type (only JPG)
      if (!file.type.includes("image/jpeg")) {
        setError("Letterhead must be a JPG image");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Letterhead image must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("letterhead", selectedFile);
      formData.append("type", "swg");

      const response = await fetch("/api/letterhead-upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess("SWG letterhead uploaded successfully!");
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById("swg-letterhead-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        onUploadSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to upload letterhead");
      }
    } catch (err) {
      console.error("Error uploading letterhead:", err);
      setError("An error occurred while uploading the letterhead");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    const fileInput = document.getElementById("swg-letterhead-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SWG Letterhead Upload</h3>
          <p className="text-sm text-gray-600">
            Upload the general admin letterhead that will be used when the toggle is enabled
          </p>
        </div>
        <div className="flex items-center">
          <svg className="w-6 h-6 text-[#014a2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
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
            id="swg-letterhead-upload"
            onChange={handleFileSelect}
            accept="image/jpeg"
            className="hidden"
          />
          <label
            htmlFor="swg-letterhead-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#014a2f] hover:bg-[#014a2f]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014a2f]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Select SWG Letterhead
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Upload a JPG image (max 5MB) to replace the current SWG letterhead
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
            {uploading ? "Uploading..." : "Upload SWG Letterhead"}
          </button>
        </div>
      </div>
    </div>
  );
} 