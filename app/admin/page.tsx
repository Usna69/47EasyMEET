'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../lib/auth';

const { useState, useEffect } = React;

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  meetingType: string;
  onlineMeetingUrl?: string;
  registrationEnd?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  _count?: {
    attendees: number;
    resources?: number;
  };
  resources?: Array<{
    id: string;
    fileName: string;
    fileType: string;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordResetRequested: boolean;
  passwordResetRequestedAt?: string;
}

export default function Dashboard() {
  const auth = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPasswordResetNotification, setShowPasswordResetNotification] = useState(true);

  // Function to fetch users with password reset requests (admin only)
  const fetchPasswordResetRequests = async () => {
    if (auth.user?.role !== 'ADMIN') return;
    
    try {
      const response = await fetch('/api/users/password-reset-requests');
      if (response.ok) {
        const data = await response.json();
        setPasswordResetRequests(data);
      }
    } catch (err) {
      console.error('Error fetching password reset requests:', err);
    }
  };

  const handleDismissNotification = () => {
    setShowPasswordResetNotification(false);
  };

  useEffect(() => {
    // Only fetch data if user is logged in
    if (auth.isLoggedIn) {
      // Define the fetch function outside the effect to avoid strict mode errors
      const fetchMeetings = async () => {
        try {
          setLoading(true);
          let url = '/api/meetings';
          
          // For creators, only fetch their own meetings
          if (auth.user?.role === 'CREATOR') {
            url = `/api/meetings?createdBy=${auth.user.id}`;
          }
          
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setMeetings(data);
          } else {
            setError('Failed to fetch meetings');
          }
        } catch (err) {
          setError('An error occurred while fetching meetings');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMeetings();
      
      // For admin users, also fetch password reset requests
      if (auth.user?.role === 'ADMIN') {
        fetchPasswordResetRequests();
      }
    }
  }, [auth.isLoggedIn, auth.user]);

  // Show authentication message if not logged in
  if (!auth.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Password reset notification for admins */}
      {auth.user?.role === 'ADMIN' && showPasswordResetNotification && passwordResetRequests.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  You have {passwordResetRequests.length} pending password reset {passwordResetRequests.length === 1 ? 'request' : 'requests'}
                </p>
                <div className="mt-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
                    {passwordResetRequests.map((user: User) => (
                      <li key={user.id}>
                        {user.name} ({user.email}) - Requested {user.passwordResetRequestedAt ? new Date(user.passwordResetRequestedAt).toLocaleString() : 'recently'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Go to User Management
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="text-yellow-500 hover:text-yellow-700"
              onClick={handleDismissNotification}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Request password reset button for creators */}
      {auth.user?.role === 'CREATOR' && (
        <div className="mb-6 text-right">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/users/request-password-reset', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email: auth.user.email }),
                });
                
                if (response.ok) {
                  alert('Password reset request sent successfully. An admin will reset your password soon.');
                } else {
                  alert('Failed to request password reset. Please try again later.');
                }
              } catch (err) {
                console.error('Error requesting password reset:', err);
                alert('An error occurred while requesting password reset.');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Request Password Reset
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        {auth.user?.role === 'ADMIN' ? (
          <h1 className="text-3xl font-semibold text-[#014a2f]">Admin Dashboard</h1>
        ) : (
          <div>
            <h1 className="text-3xl font-semibold text-[#014a2f]">Hi there, {auth.user?.name}</h1>
            <p className="text-gray-600 mt-1">You're logged in as a Meeting Creator</p>
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          {auth.user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin/meetings"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Meetings Dashboard
              </Link>
              <Link
                href="/admin/meetings/create"
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Meeting
              </Link>
              <Link
                href="/admin/users"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </Link>
            </>
          )}
          
          {auth.user?.role === 'CREATOR' && (
            <>
              <Link
                href="/admin/meetings/create"
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Meeting
              </Link>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/users/${auth.user?.id}/request-reset`, {
                      method: 'POST',
                    });
                    
                    if (response.ok) {
                      alert('Password reset request sent to admin');
                    } else {
                      alert('Failed to request password reset');
                    }
                  } catch (err) {
                    console.error('Error requesting password reset:', err);
                    alert('An error occurred while requesting password reset');
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Request Password Reset
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">Recent Meetings</h2>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : meetings.length === 0 ? (
          <p className="text-center py-4">No meetings found. Create your first meeting!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Attendees</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.slice(0, 5).map((meeting: Meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{meeting.title}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meeting.meetingType === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {meeting.meetingType === 'ONLINE' ? 'Online' : 'Physical'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{format(new Date(meeting.date), 'PPP')}</td>
                    <td className="px-4 py-2 truncate max-w-[150px]" title={meeting.location}>{meeting.location}</td>
                    <td className="px-4 py-2">{meeting._count?.attendees || 0}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <Link
                        href={`/admin/meetings/${meeting.id}`}
                        className="text-[#014a2f] hover:text-[#014a2f]/80 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      
                      {/* Only admins can edit meetings */}
                      {auth.user?.role === 'ADMIN' && (
                        <Link
                          href={`/admin/meetings/${meeting.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                      )}
                      
                      {/* Creators can add resources to their meetings */}
                      {auth.user?.role === 'CREATOR' && (
                        <Link
                          href={`/admin/meetings/${meeting.id}/resources`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Add Resources
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* View all meetings link */}
        {meetings.length > 5 && (
          <div className="mt-4 text-right">
            <Link 
              href="/admin/meetings"
              className="text-[#014a2f] hover:text-[#014a2f]/80 inline-flex items-center"
            >
              View all {meetings.length} meetings
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
