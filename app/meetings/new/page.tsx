'use client';

import React from 'react';
import Link from 'next/link';
import PublicMeetingForm from '../../../components/PublicMeetingForm';

export default function NewPublicMeetingPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [meetingId, setMeetingId] = React.useState('');

  const handleSuccess = (id: string) => {
    setMeetingId(id);
    setSubmitted(true);
  };

  // Show success screen after submission
  if (submitted) {
    return (
      <div className="py-16 px-4" style={{ 
        background: `url('/background-pattern.svg')`,
        backgroundSize: 'cover',
        position: 'relative',
      }}>
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100">
              <div className="text-[#014a2f] mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting Created Successfully!</h1>
              <p className="text-gray-600 mb-8">Your meeting has been successfully created. You can now view its details or return to the home page.</p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href={`/meetings/${meetingId}`}
                  className="bg-[#FFC107] hover:bg-[#E0A800] text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors"
                >
                  View Meeting Details
                </Link>
                <Link 
                  href="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the form if not yet submitted
  return (
    <div className="py-8 px-4" style={{ 
        background: `url('/background-pattern.svg')`,
        backgroundSize: 'cover',
        position: 'relative',
      }}>
      <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
      <div className="container mx-auto relative z-10">
        <div className="mb-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900 flex items-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Create New Meeting</h1>
            <p className="text-gray-600 mb-6">
              Fill out the form below to create a new meeting. You'll receive a confirmation once your meeting has been created.
            </p>
            <PublicMeetingForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
