'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionAuth } from '../../../lib/session-auth';
import Link from 'next/link';

// Using React hooks directly from React import
const { useState, useEffect } = React;

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  meetingType: string;
  onlineMeetingUrl?: string;
  _count: {
    attendees: number;
    resources?: number;
  };
  resources: Array<{
    id: string;
    fileName: string;
    fileType: string;
  }>;
}

export default function MeetingsPage() {
  const router = useRouter();
  const auth = useSessionAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActive, setShowActive] = useState(false);

  // No redirection in useEffect, we'll handle this in the render logic instead

  // Authorized roles for meeting management
  const authorizedRoles = ['ADMIN', 'CREATOR'];

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      // Use different API endpoints based on user role
      let url = '/api/meetings';
      
      // For creators, only show meetings they created
      if (auth.user?.role === 'CREATOR' && auth.user?.email) {
        url = `/api/meetings?creatorEmail=${encodeURIComponent(auth.user.email)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // If the user is not an admin, filter out meetings that ended more than 24 hours ago
        if (!auth.isAuthorized(['ADMIN', 'DIRECTOR', 'ASSISTANT_DIRECTOR'])) {
          const filteredMeetings = data.filter((meeting: Meeting) => !hasEndedOverDay(meeting.date));
          setMeetings(filteredMeetings);
        } else {
          // For admins, show all meetings
          setMeetings(data);
        }
      } else {
        setError('Failed to fetch meetings');
        setMeetings([]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meetings on component mount and when showActive changes
  useEffect(() => {
    if (auth.isLoggedIn) {
      fetchMeetings();
    }
  }, [auth.isLoggedIn, showActive]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine meeting status (upcoming, ongoing, or ended)
  const getMeetingStatus = (dateString: string, durationHours: number = 2) => {
    const meetingDate = new Date(dateString);
    const endTime = new Date(meetingDate);
    endTime.setHours(endTime.getHours() + durationHours);
    
    const now = new Date();
    
    if (now < meetingDate) {
      return 'upcoming';
    } else if (now >= meetingDate && now <= endTime) {
      return 'ongoing';
    } else {
      return 'ended';
    }
  };
  
  // Check if a meeting is upcoming (in the future)
  const isUpcoming = (dateString: string) => {
    return getMeetingStatus(dateString) === 'upcoming';
  };
  
  // Check if a meeting has ended more than 24 hours ago
  const hasEndedOverDay = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const meetingEndTime = new Date(meetingDate);
    meetingEndTime.setHours(meetingEndTime.getHours() + 2); // Assuming 2-hour meetings
    
    const oneDayAfterEnd = new Date(meetingEndTime);
    oneDayAfterEnd.setHours(oneDayAfterEnd.getHours() + 24);
    
    const now = new Date();
    return now > oneDayAfterEnd;
  };

  // Calculate time until meeting starts
  const timeUntilMeeting = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const now = new Date();
    const diffTime = meetingDate.getTime() - now.getTime();
    
    // If meeting has already happened
    if (diffTime <= 0) {
      return 'Meeting has already occurred';
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
  };

  // If not logged in, show login message instead of redirecting
  if (!auth?.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to view meetings.</p>
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-gray-700 hover:text-gray-900 flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-[#014a2f]">Meetings Management</h1>
        </div>
        
        <div className="flex space-x-3">
          <Link 
            href="/admin/meetings/create" 
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Meeting
          </Link>
        </div>
      </div>

      {!auth.isLoggedIn ? (
        <div className="bg-yellow-100 p-4 rounded-md">Please log in to view meetings</div>
      ) : !auth.isAuthorized(authorizedRoles) ? (
        <div className="bg-red-100 p-4 rounded-md">You do not have permission to manage meetings</div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
          )}

          <div className="mb-4 flex items-center">
            <label className="inline-flex items-center cursor-pointer mr-4">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={showActive}
                onChange={() => setShowActive(!showActive)}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#014a2f]"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">Show Only Active Meetings</span>
            </label>
            
            <button 
              onClick={fetchMeetings}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-600 mb-2">No meetings found</p>
              <p className="text-sm text-gray-500">
                {showActive ? 'There are no active meetings scheduled.' : 'No meetings have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting: Meeting) => (
                <div 
                  key={meeting.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow 
                    ${getMeetingStatus(meeting.date) === 'upcoming' ? 'border-[#014a2f]/20' : 
                      getMeetingStatus(meeting.date) === 'ongoing' ? 'border-blue-400/30' : 
                      'border-gray-200'}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold truncate">{meeting.title}</h2>
                      <div className="flex space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${meeting.meetingType === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {meeting.meetingType === 'ONLINE' ? 'Online' : 'Physical'}
                        </span>
                        {getMeetingStatus(meeting.date) === 'upcoming' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            Upcoming
                          </span>
                        )}
                        {getMeetingStatus(meeting.date) === 'ongoing' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                            Ongoing
                          </span>
                        )}
                        {getMeetingStatus(meeting.date) === 'ended' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meeting.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{meeting.location}</span>
                      </div>
                      
                      {meeting.resources && meeting.resources.length > 0 && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{meeting.resources.length} resource{meeting.resources.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{meeting._count.attendees} attendee{meeting._count.attendees !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {isUpcoming(meeting.date) && (
                      <div className="mt-3 text-xs text-gray-500">
                        Starts in: {timeUntilMeeting(meeting.date)}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <span className={`text-xs font-medium 
                      ${getMeetingStatus(meeting.date) === 'upcoming' ? 'text-[#014a2f]' : 
                        getMeetingStatus(meeting.date) === 'ongoing' ? 'text-blue-600' : 
                        'text-gray-500'}`}
                    >
                      {getMeetingStatus(meeting.date) === 'upcoming' ? (
                        <>Starts in: {timeUntilMeeting(meeting.date)}</>
                      ) : getMeetingStatus(meeting.date) === 'ongoing' ? (
                        <>Currently active</>
                      ) : hasEndedOverDay(meeting.date) ? (
                        <>Ended over 24h ago</>
                      ) : (
                        <>Recently ended</>
                      )}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.location.href = `/admin/meetings/${meeting.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View Details
                      </button>
                      
                      {isUpcoming(meeting.date) && (
                        <Link 
                          href={`/admin/meetings/${meeting.id}/edit`}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
