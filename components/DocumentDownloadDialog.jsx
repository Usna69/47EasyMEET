"use client";

import { useState } from "react";

export default function DocumentDownloadDialog({
  isOpen,
  onClose,
  onDownload,
  resourceName,
  resourceId,
  hasPasswordProtection,
}) {
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasPasswordProtection) {
      // If no password protection, proceed directly
      onDownload();
      return;
    }

    if (!secretCode.trim()) {
      setError("Please enter the secret code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate the secret code with the API
      const response = await fetch(`/api/validate-document-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: secretCode,
          resourceId: resourceId, // Use the actual resource ID for validation
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid secret code");
      }

      // If validation succeeds, proceed with download
      onDownload();
      onClose();
    } catch (error) {
      console.error("Error validating code:", error);
      setError(error.message || "Invalid secret code");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Download Document
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            {hasPasswordProtection
              ? "This document is password protected. Please enter the secret code to download."
              : "Click the button below to download this document."}
          </p>

          <form onSubmit={handleSubmit}>
            {hasPasswordProtection && (
              <div className="mb-4">
                <label
                  htmlFor="secretCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Secret Code
                </label>
                <input
                  type="password"
                  id="secretCode"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]"
                  placeholder="Enter the secret code"
                  required
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#014a2f] rounded-md hover:bg-[#014a2f]/90 disabled:bg-gray-400"
              >
                {loading ? "Verifying..." : "Download"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
