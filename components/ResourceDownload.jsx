"use client";

import { useState } from "react";

export default function ResourceDownload({ resourceId, fileName }) {
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState("");

  // Function to initiate download process - shows password modal
  const initiateDownload = () => {
    setDownloadError("");
    setDownloadPassword("");
    setShowPasswordModal(true);
    console.log("Download initiated for resource:", resourceId);
  };

  // Function to handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    performDownload(downloadPassword);
  };

  // Function to handle the actual download with password
  const performDownload = async (password) => {
    try {
      setIsDownloading(true);
      setDownloadError("");

      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download resource");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "resource";
      link.click();
      URL.revokeObjectURL(url);

      // Close modal and reset form on success
      setShowPasswordModal(false);
      setDownloadPassword("");
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message || "Failed to download resource");
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to close modal and reset state
  const closeModal = () => {
    setShowPasswordModal(false);
    setDownloadPassword("");
    setDownloadError("");
    setIsDownloading(false);
  };

  return (
    <>
      <div>
        <button
          onClick={initiateDownload}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
        {downloadError && !showPasswordModal && (
          <p className="text-red-600 text-xs mt-1">{downloadError}</p>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Password Required
            </h3>
            <p className="mb-4 text-gray-600">
              This meeting's resources are password protected. Please enter the
              meeting password to download.
            </p>

            {downloadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                <p>{downloadError}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={downloadPassword}
                  onChange={(e) => setDownloadPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isDownloading}
                  placeholder="Enter password"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDownloading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isDownloading || !downloadPassword.trim()}
                >
                  {isDownloading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  <span>{isDownloading ? "Downloading..." : "Download"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
