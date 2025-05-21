'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import MeetingForm from '../../../../components/MeetingForm';
import { useAuth } from '../../../../lib/auth';
import { useRouter } from 'next/navigation';

export default function NewMeetingPage() {
  const auth = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push('/admin/login');
    }
  }, [auth.isLoggedIn, router]);
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-green-700 hover:text-green-900 flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border border-green-100">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Create New Meeting <span className="text-sm font-normal text-yellow-600 ml-2 bg-yellow-50 px-2 py-1 rounded">Admin</span></h1>
          <p className="text-gray-600 mb-6">
            As an administrator, you can create meetings with full control over all meeting properties including sector, creator type, and meeting ID.
          </p>
          <MeetingForm />
        </div>
      </div>
    </div>
  );
}
