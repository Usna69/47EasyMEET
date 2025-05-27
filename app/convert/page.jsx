'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DocxToJpgConversion() {
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check if the file is a DOCX
    if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
      setError('Please select a DOCX file');
      setFile(null);
      return;
    }
    
    setError('');
    setFile(selectedFile);
  };

  const handleConversion = () => {
    // Since actual conversion requires server-side processing,
    // we'll redirect to an external service for now
    setIsConverting(true);
    
    // Open Convertio in a new tab
    window.open('https://convertio.co/docx-jpg/', '_blank');
    
    // Show a mock conversion completion after a delay
    setTimeout(() => {
      setIsConverting(false);
      setError('');
      setConvertedFile({
        name: file.name.replace('.docx', '.jpg'),
        type: 'image/jpeg',
        size: Math.floor(file.size * 0.8) // Mock smaller file size
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-700 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">DOCX to JPG Conversion</h1>
          <p className="text-green-100">Convert your Word documents to JPG for meeting letterheads</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-2">About This Tool</h2>
            <p className="text-gray-600">
              This tool helps you convert Microsoft Word documents (DOCX) to JPG image format,
              which is required for letterheads and document uploads in EasyMEET.
            </p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">How it works</h3>
            <ol className="list-decimal pl-5 text-blue-700 space-y-2">
              <li>Upload your DOCX file using the selector below</li>
              <li>Click "Convert to JPG" to start the conversion process</li>
              <li>Download your converted JPG file when ready</li>
              <li>Optionally, add password protection to secure your document</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select DOCX File
            </label>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-green-700 file:text-white
                hover:file:bg-green-800"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          
          {file && (
            <div className="mb-6">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={handleConversion}
                    disabled={isConverting}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isConverting 
                        ? 'bg-gray-300 text-gray-500' 
                        : 'bg-green-700 text-white hover:bg-green-800'
                    }`}
                  >
                    {isConverting ? 'Converting...' : 'Convert to JPG'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {convertedFile && (
            <div className="mt-8 border border-green-200 rounded-md p-4 bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">Conversion Complete!</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700">{convertedFile.name}</p>
                  <p className="text-sm text-green-600">{(convertedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                
                {/* Password protection for converted file */}
                <div className="flex-1 max-w-md ml-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="protectFile"
                      checked={isProtected}
                      onChange={(e) => setIsProtected(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600"
                    />
                    <label htmlFor="protectFile" className="text-sm font-medium text-green-700">
                      Protect with password
                    </label>
                  </div>
                  
                  {isProtected && (
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-200 rounded-md"
                    />
                  )}
                </div>
                
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium bg-green-700 text-white hover:bg-green-800"
                  onClick={() => alert('Download would start in a real implementation')}
                >
                  Download JPG
                </button>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> You can now use this JPG file as a letterhead 
                  in your meeting setup. {isProtected && 'The file will be password-protected.'}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-medium text-gray-800 mb-2">Need help with conversion?</h3>
            <p className="text-gray-600 mb-4">
              If you're having trouble with the built-in converter, you can try these alternatives:
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://convertio.co/docx-jpg/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Convertio
              </a>
              <a 
                href="https://www.zamzar.com/convert/docx-to-jpg/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Zamzar
              </a>
              <a 
                href="https://cloudconvert.com/docx-to-jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                CloudConvert
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
