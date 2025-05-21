'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../../../lib/auth';
import QRCodeDisplay from '../../../../components/QRCodeDisplay';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  creatorEmail: string;
  sector: string;
  creatorType: string;
  meetingId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
  };
}

export default function AdminMeetingDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const auth = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isLoggedIn) {
      const fetchMeeting = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/meetings/${id}`);
          if (response.ok) {
            const data = await response.json();
            setMeeting(data);
          } else {
            setError('Failed to fetch meeting details');
          }
        } catch (err) {
          setError('An error occurred while fetching meeting details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchMeeting();
    }
  }, [id, auth.isLoggedIn]);

  // Show authentication message if not logged in
  if (!auth.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Admin Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Link 
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-500">{error || 'Meeting not found'}</p>
          <Link 
            href="/admin"
            className="mt-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const meetingUrl = `${window.location.origin}/meetings/${meeting.id}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-gray-700 hover:text-gray-900 flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-semibold text-[#014a2f]">{meeting.title}</h1>
              <span className="bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                {meeting.meetingId || 'No ID'}
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{meeting.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                <p className="text-gray-800">{format(new Date(meeting.date), 'PPP p')}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-800">{meeting.location}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Sector</h3>
                <p className="text-gray-800">{meeting.sector || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Creator Type</h3>
                <p className="text-gray-800">{meeting.creatorType || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Creator Email</h3>
                <p className="text-gray-800">{meeting.creatorEmail || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Attendees</h3>
                <p className="text-gray-800">{meeting._count?.attendees || 0}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href={`/admin/meetings/${meeting.id}/edit`}
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Edit Meeting
              </Link>
              <Link 
                href={`/admin/meetings/${meeting.id}/attendees`}
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors"
              >
                View Attendees
              </Link>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-[#014a2f]">QR Code</h2>
            <p className="text-gray-600 mb-4">Scan this QR code to access the meeting details.</p>
            
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={meetingUrl} />
            </div>
            
            <div className="text-center">
              <Link 
                href={`/meetings/${meeting.id}/register`}
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors inline-block w-full"
              >
                Register for Meeting
              </Link>
            </div>
          </div>
          
          {/* Meeting card component removed */}
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-[#014a2f]">Meeting ID</h2>
            <p className="text-gray-600 mb-4">Use this ID for reference:</p>
            <div className="bg-gray-100 p-3 rounded-md text-center font-mono text-sm break-all">
              {meeting.meetingId || 'Not assigned'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
