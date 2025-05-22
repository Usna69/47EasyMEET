'use client';

import React from 'react';
import Link from 'next/link';

export default function RestrictedMeetingCreationPage() {
  return (
    <div className="py-16 px-4" style={{ 
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

        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100">
            <div className="text-[#014a2f] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Restricted Access</h1>
            <p className="text-gray-600 mb-8">
              Meeting creation is restricted to authorized administrators only. Please contact an administrator 
              or log in with appropriate credentials to create meetings.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/admin/login"
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Creator Login
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
