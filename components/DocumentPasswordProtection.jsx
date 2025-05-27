'use client';

import React, { useState } from 'react';

export default function DocumentPasswordProtection({ meetingId, currentSecretCode, onSave }) {
  const [secretCode, setSecretCode] = useState(currentSecretCode || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!meetingId) return;
    
    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess(false);
      
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentSecretCode: secretCode.trim() || null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save secret code');
      }
      
      if (onSave) {
        onSave(secretCode);
      }
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving secret code:', error);
      setSaveError(error.message || 'Failed to save secret code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-2">Document Password Protection</h3>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          Set a secret code that attendees must enter to download documents
        </p>
        
        <div className="flex flex-col space-y-3">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                type={showPassword ? 'text' : 'password'}
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter secret code"
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/20 focus:border-[#014a2f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#014a2f] text-white font-medium rounded-r-md hover:bg-[#014a2f]/90 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          
          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          
          {saveSuccess && (
            <p className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Secret code saved successfully
            </p>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            <p>Leave blank to remove password protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
