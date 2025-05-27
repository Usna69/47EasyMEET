'use client';

import React, { useState } from 'react';
import DocumentPasswordProtection from './DocumentPasswordProtection';
import LetterheadUploader from './LetterheadUploader';
import AttendeeManager from './AttendeeManager';

export default function MeetingAdminPanel({ meeting }) {
  const [activeTab, setActiveTab] = useState('letterhead');
  const [showPanel, setShowPanel] = useState(false);

  if (!meeting) return null;

  return (
    <div className="mt-8 border rounded-lg border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Meeting Management</h2>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-sm text-[#014a2f] hover:text-[#014a2f]/80 flex items-center"
          >
            {showPanel ? 'Hide Panel' : 'Show Panel'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-5 w-5 transition-transform ${showPanel ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {showPanel && (
        <div className="p-4">
          <div className="mb-4 border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('letterhead')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'letterhead' ? 'border-[#014a2f] text-[#014a2f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Letterhead
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-[#014a2f] text-[#014a2f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Document Password
              </button>
              <button
                onClick={() => setActiveTab('attendees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendees' ? 'border-[#014a2f] text-[#014a2f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Manage Attendees
              </button>
            </nav>
          </div>
          
          <div className="py-2">
            {activeTab === 'letterhead' && (
              <LetterheadUploader 
                meetingId={meeting.id} 
                onUploadSuccess={(path) => {
                  console.log('Letterhead uploaded:', path);
                  // You could refresh the meeting data here if needed
                }}
              />
            )}
            
            {activeTab === 'password' && (
              <DocumentPasswordProtection 
                meetingId={meeting.id} 
                currentSecretCode={meeting.documentSecretCode}
                onSave={(code) => {
                  console.log('Secret code saved:', code);
                  // You could refresh the meeting data here if needed
                }}
              />
            )}
            
            {activeTab === 'attendees' && (
              <AttendeeManager 
                meetingId={meeting.id}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
