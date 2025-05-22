'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSessionAuth } from '../../../../lib/session-auth';
import QRCodeDisplay from '../../../../components/QRCodeDisplay';

const { useState, useEffect } = React;

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
  meetingType: string;
  onlineMeetingUrl?: string;
  registrationEnd?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
    resources?: number;
  };
  resources?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
  }>;
}

export default function AdminMeetingDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const auth = useSessionAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetingUrl, setMeetingUrl] = useState<string>('');

  // First useEffect to fetch meeting data
  // Use console to debug parameters
  console.log('Meeting ID:', id);
  
  useEffect(() => {
    if (auth.isLoggedIn && id) {
      const fetchMeeting = async () => {
        try {
          setLoading(true);
          // Ensure API endpoint exists and is working correctly
          console.log(`Fetching meeting data from /api/meetings/${id}`);
          
          // Removed mock data section to ensure real meeting data is always displayed
          
          const response = await fetch(`/api/meetings/${id}`);
          if (response.ok) {
            const data = await response.json();
            setMeeting(data);
          } else {
            console.error('API response not OK:', response.status);
            setError('Failed to fetch meeting details');
          }
        } catch (err) {
          console.error('Error fetching meeting:', err);
          setError('An error occurred while fetching meeting details');
        } finally {
          setLoading(false);
        }
      };

      fetchMeeting();
    }
  }, [id, auth.isLoggedIn]);
  
  // Second useEffect to set meeting URL safely on the client side
  useEffect(() => {
    if (meeting) {
      setMeetingUrl(`${window.location.origin}/meetings/${meeting.id}/register`);
    }
  }, [meeting]);

  // Instead of redirecting, show login message
  if (!auth?.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to view meeting details.</p>
          <a 
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </a>
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

  // URL is now set in the useEffect hook above

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
                <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting Type</h3>
                <p className="text-gray-800 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${meeting.meetingType === 'ONLINE' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                  {meeting.meetingType === 'ONLINE' ? 'Online Meeting' : 'Physical Meeting'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-800">{meeting.location}</p>
              </div>
              
              {meeting.meetingType === 'ONLINE' && meeting.onlineMeetingUrl && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting URL</h3>
                  <a 
                    href={meeting.onlineMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {meeting.onlineMeetingUrl}
                  </a>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Registration Closes</h3>
                <p className="text-gray-800">{meeting.registrationEnd ? format(new Date(meeting.registrationEnd), 'PPP p') : '2 hours after meeting starts'}</p>
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
            
            {/* Resources section */}
            {meeting.resources && meeting.resources.length > 0 && (
              <div className="mt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Meeting Resources</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {meeting.resources.map((resource: { id: string; fileName: string; fileType: string; fileUrl: string; fileSize: number; }) => (
                      <li key={resource.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-gray-200 rounded-md p-2 mr-3">
                            {resource.fileType.includes('pdf') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : resource.fileType.includes('image') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : resource.fileType.includes('word') || resource.fileType.includes('document') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : resource.fileType.includes('sheet') || resource.fileType.includes('excel') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : resource.fileType.includes('presentation') || resource.fileType.includes('powerpoint') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">{resource.fileName}</p>
                            <p className="text-xs text-gray-500">{(resource.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <a 
                          href={resource.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center hover:underline transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {auth.user?.role === 'ADMIN' && (
                <Link 
                  href={`/admin/meetings/${meeting.id}/edit`}
                  className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Edit Meeting
                </Link>
              )}
              {auth.user?.role === 'CREATOR' && (
                <Link 
                  href={`/admin/meetings/${meeting.id}/resources`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Add Resources
                </Link>
              )}
              <Link 
                href={`/admin/meetings/${meeting.id}/attendees`}
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors"
              >
                View Attendees
              </Link>
              <Link 
                href={`/admin/meetings`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
              >
                All Meetings
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
