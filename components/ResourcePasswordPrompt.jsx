'use client';

import React, { useState } from 'react';

export default function ResourcePasswordPrompt({ resourceId, onValidated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setIsValidating(true);
    setError('');
    
    try {
      // Call the validation API with the password
      const response = await fetch(`/api/resources/${resourceId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate password');
      }
      
      // If successful, the API will return a token
      const { token } = data;
      
      // Store the token (for this session only)
      sessionStorage.setItem(`resource_token_${resourceId}`, token);
      
      // Call the callback with the token
      if (onValidated) {
        onValidated(token);
      }
      
    } catch (error) {
      console.error('Error validating password:', error);
      setError(error.message || 'Invalid password. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">Password Protected Resource</h2>
          <p className="text-gray-600 mt-1">
            This resource is password protected. Please enter the password to access it.
          </p>
        </div>
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="resource-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="resource-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onValidated(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isValidating}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isValidating ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              {isValidating ? 'Validating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
