'use client';

import React from 'react';
import DualColorSpinner from '../../../components/DualColorSpinner';
import Link from 'next/link';

export default function SpinnerDemo() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Dual-Color Spinner Demo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Small Spinner (40px)</h2>
          <DualColorSpinner size={40} />
          <p className="mt-4 text-gray-600 text-sm">Default size</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Medium Spinner (80px)</h2>
          <DualColorSpinner size={80} />
          <p className="mt-4 text-gray-600 text-sm">Good for loading indicators</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Large Spinner (120px)</h2>
          <DualColorSpinner size={120} />
          <p className="mt-4 text-gray-600 text-sm">For hero areas</p>
        </div>
      </div>

      <div className="mt-12 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Usage Example</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <code>{`import DualColorSpinner from '../components/DualColorSpinner';

// In your component:
<div className="flex justify-center">
  <DualColorSpinner size={60} />
</div>

// Use in a loading state:
{isLoading ? (
  <DualColorSpinner size={40} className="mx-auto" />
) : (
  <YourContent />
)}`}</code>
        </pre>
      </div>
    </div>
  );
}
