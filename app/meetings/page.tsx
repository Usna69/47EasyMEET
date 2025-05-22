'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../lib/auth';
import SectorFilter from '../../components/SectorFilter';

const { useState, useEffect } = React;

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  meetingType: string;
  meetingId?: string; // Add meetingId field for sector filtering
  sector?: string;
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
  }>;
}

// Define the sector interface to match our updated format
interface Sector {
  name: string;
  code: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActive, setShowActive] = useState(false);
  // Get sector from URL parameter instead of local state
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || '');
  
  // List of sectors with their codes (matching the admin sector list)
  const sectors: Sector[] = [
    { name: 'Finance and Economic Planning Affairs', code: 'F&EPA' },
    { name: 'Innovation and Digital Economy', code: 'IDE' },
    { name: 'Talents, Skills Development and Care', code: 'TS&DC' },
    { name: 'Mobility and Works', code: 'M&W' },
    { name: 'Built Environment and Urban Planning Sector', code: 'BE&UP' },
    { name: 'Boroughs Administration and Personnel', code: 'BA&P' },
    { name: 'Business and Hustler Opportunities', code: 'B&HO' },
    { name: 'Green Nairobi (Environment, Water, Food and Agriculture)', code: 'GN' },
    { name: 'Health Wellness and Nutrition', code: 'HW&N' },
    { name: 'Inclusivity, Public Participation and Customer Service Sector', code: 'IPP&CS' }
  ];

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (showActive) queryParams.set('active', 'true');
      
      // If sector is selected, add it to the API query rather than filtering client-side
      if (selectedSector) {
        queryParams.set('department', selectedSector);
      }
      
      const queryString = queryParams.toString();
      const response = await fetch(`/api/meetings${queryString ? `?${queryString}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await response.json();
      
      // Filter out meetings that ended more than 24 hours ago
      const activeFilteredMeetings = data.filter((meeting: Meeting) => !hasEndedOverDay(meeting.date));
      setMeetings(activeFilteredMeetings);
      setFilteredMeetings(activeFilteredMeetings);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply sector filtering based on the selected sector
  const applyFilters = (meetingsToFilter: Meeting[]) => {
    if (!selectedSector) {
      // If no sector selected, show all meetings
      setFilteredMeetings(meetingsToFilter);
    } else {
      // Filter meetings by the selected sector
      const sectorFiltered = meetingsToFilter.filter((meeting: Meeting) => {
        // Check if meeting's sector code is in the meeting ID
        return meeting.meetingId?.includes(`/${selectedSector}/`);
      });
      setFilteredMeetings(sectorFiltered);
    }
  };
  
  // Handle sector selection change
  const handleSectorChange = (sectorCode: string) => {
    setSelectedSector(sectorCode);
  };

  // Fetch meetings on component mount and when showActive changes
  useEffect(() => {
    fetchMeetings();
  }, [showActive]);
  
  // Re-apply sector filtering when selectedSector changes
  useEffect(() => {
    if (meetings.length > 0) {
      applyFilters(meetings);
    }
  }, [selectedSector]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upcoming Meetings</h1>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setShowActive(!showActive)}
            className={`px-4 py-2 rounded mr-2 ${showActive ? 'bg-[#014a2f] text-white' : 'bg-white text-[#014a2f] border border-[#014a2f]'}`}
          >
            {showActive ? 'Showing Active Meetings' : 'Show Active Meetings'}
          </button>
        </div>
        
        {/* Sector filter dropdown */}
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Sector</label>
          <SectorFilter 
            selectedSector={selectedSector} 
            onSectorChange={handleSectorChange} 
            sectors={sectors} 
            className="w-full"
          />
        </div>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014a2f]"></div>
          <span className="ml-2">Loading meetings...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No meetings available.</p>
        </div>
      ) : filteredMeetings.length === 0 && selectedSector ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No meetings found in the selected sector.</p>
          <button 
            onClick={() => setSelectedSector('')} 
            className="mt-2 text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting: Meeting) => (
            <div
              key={meeting.id}
              className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative
                ${getMeetingStatus(meeting.date) === 'upcoming' ? 'border-[#014a2f]/20' : 
                  getMeetingStatus(meeting.date) === 'ongoing' ? 'border-blue-400/30' : 
                  'border-gray-200'}`}
            >
              {/* Resources badge (if available) */}
              {meeting._count?.resources && meeting._count.resources > 0 && (
                <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {meeting._count.resources} Resource{meeting._count.resources !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
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
                  
                  {meeting.meetingType === 'ONLINE' && meeting.onlineMeetingUrl && (
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <a 
                        href={meeting.onlineMeetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Join Online Meeting
                      </a>
                    </div>
                  )}
                  
                  {(meeting.resources && meeting.resources.length > 0) || (meeting._count?.resources && meeting._count.resources > 0) ? (
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{(meeting.resources && meeting.resources.length) || meeting._count?.resources || 0} resource{((meeting.resources && meeting.resources.length) || meeting._count?.resources || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  ) : null}
                  
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{meeting._count?.attendees || 0} attendee{meeting._count?.attendees !== 1 ? 's' : ''}</span>
                  </div>
                </div>
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
                  ) : (
                    <>Recently ended</>
                  )}
                </span>
                
                <div className="flex space-x-2">
                  <Link 
                    href={`/meetings/${meeting.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                  
                  {getMeetingStatus(meeting.date) === 'ongoing' ? (
                    <Link 
                      href={`/meetings/${meeting.id}/register`}
                      className="text-sm text-[#014a2f] hover:text-[#014a2f]/80"
                    >
                      Register
                    </Link>
                  ) : getMeetingStatus(meeting.date) === 'upcoming' ? (
                    <span className="text-sm text-gray-400 cursor-not-allowed">
                      Registration Pending
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
