import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-20 text-center">
      <div className="max-w-xl mx-auto">
        <div className="text-primary mb-6">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary px-6 py-3">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
