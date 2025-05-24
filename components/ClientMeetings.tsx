'use client';

import React from 'react';
const { useState, useEffect } = React;
import MeetingCard from './MeetingCard';
import DualColorSpinner from './DualColorSpinner';
import { getSectorName } from '../utils/sectorUtils';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  sector: string | null;
  meetingType?: string;
  onlineMeetingUrl?: string;
  _count?: {
    attendees: number;
    resources?: number;
  };
}

export default function ClientMeetings({ initialMeetings }: { initialMeetings: Meeting[] }) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [sectorFilter, setSectorFilter] = useState<string | undefined>(
    typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('sector') || undefined 
      : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'upcoming' | 'ongoing'>('upcoming');

  // Function to fetch meetings with the sector filter and view mode
  const fetchMeetings = async (sector?: string, mode: 'upcoming' | 'ongoing' = viewMode) => {
    setIsLoading(true);
    try {
      // Build URL based on view mode
      // For upcoming: meetings that haven't started yet
      // For ongoing: meetings that are currently happening (started but not ended)
      let url = '/api/meetings';
      
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      
      if (mode === 'upcoming') {
        // Upcoming meetings are in the future
        url += '?active=true';
      } else {
        // Ongoing meetings have started but are still within registration window (started but < 2 hours ago)
        url += '?ongoing=true';
      }
      
      if (sector) {
        url += `&department=${encodeURIComponent(sector)}`;
      }
      
      // Add a cache-busting parameter to avoid stale data
      const timestamp = new Date().getTime();
      url += `&t=${timestamp}`;
      
      console.log('Fetching meetings from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Meetings API response:', data);
      
      // Extract meetings array from the response
      if (data && data.meetings) {
        console.log(`Found ${data.meetings.length} meetings in API response`);
        setMeetings(data.meetings);
      } else {
        console.warn('No meetings found in API response or invalid response structure');
        setMeetings([]);
      }
      
      // Log current state after setting
      setTimeout(() => {
        console.log('Current meetings state after update:', meetings);
      }, 100);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use a separate useEffect for the initial data load to avoid race conditions
  useEffect(() => {
    console.log('Initial loading of meetings with initial data:', initialMeetings.length);
    setMeetings(initialMeetings);
  }, []);

  // Listen for sector filter changes from the HomeSectorFilter component
  useEffect(() => {
    const handleSectorFilterChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ sector: string }>;
      const newSector = customEvent.detail.sector;
      setSectorFilter(newSector || undefined);
      fetchMeetings(newSector || undefined, viewMode);
      
      // Save the current filter to sessionStorage
      if (newSector) {
        sessionStorage.setItem('selectedSector', newSector);
      } else {
        sessionStorage.removeItem('selectedSector');
      }
    };

    window.addEventListener('sectorfilterchange', handleSectorFilterChange as EventListener);
    
    // Initial setup - check sessionStorage first, then URL
    if (typeof window !== 'undefined') {
      // First try to get from sessionStorage (preserves through navigation)
      const savedSector = sessionStorage.getItem('selectedSector');
      
      // Then check URL parameters (for direct links)
      const urlParams = new URLSearchParams(window.location.search);
      const sectorFromUrl = urlParams.get('sector');
      
      // Use saved sector or URL sector, with URL taking precedence
      const sectorToUse = sectorFromUrl || savedSector || undefined;
      
      if (sectorToUse) {
        setSectorFilter(sectorToUse);
        fetchMeetings(sectorToUse, viewMode);
        
        // Also update sessionStorage if getting from URL
        if (sectorFromUrl) {
          sessionStorage.setItem('selectedSector', sectorFromUrl);
        }
      } else {
        // Always fetch fresh meetings when no sector filter is present
        // This ensures we get meetings even without a sector filter
        console.log(`No sector filter, fetching all ${viewMode} meetings`);
        fetchMeetings(undefined, viewMode);
      }
    }
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('sectorfilterchange', handleSectorFilterChange as EventListener);
    };

    return () => {
      window.removeEventListener('sectorfilterchange', handleSectorFilterChange as EventListener);
    };
  }, []);
  
  // Toggle view mode between upcoming and ongoing meetings
  const toggleViewMode = () => {
    const newMode = viewMode === 'upcoming' ? 'ongoing' : 'upcoming';
    setViewMode(newMode);
    fetchMeetings(sectorFilter, newMode);
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-3xl font-semibold">
          {sectorFilter ? `${getSectorName(sectorFilter)} Meetings` : viewMode === 'upcoming' ? 'Upcoming Meetings' : 'Ongoing Meetings'}
        </h2>
        
        {/* Toggle Switch */}
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${viewMode === 'upcoming' ? 'text-[#014a2f]' : 'text-gray-500'}`}>Upcoming</span>
          <button 
            onClick={toggleViewMode}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            style={{ backgroundColor: viewMode === 'upcoming' ? '#014a2f' : '#aa8700' }}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === 'upcoming' ? 'translate-x-1' : 'translate-x-6'}`}
            />
          </button>
          <span className={`text-sm font-medium ${viewMode === 'ongoing' ? 'text-[#aa8700]' : 'text-gray-500'}`}>Ongoing</span>
          
          <div className="ml-4 text-gray-500">
            {isLoading ? (
              <div className="flex items-center">
                <DualColorSpinner size={20} />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <span className="text-sm">{`${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Sector filter component is placed in the parent component */}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <DualColorSpinner size={60} className="mb-4" />
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      ) : meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting: Meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-4">No meetings scheduled yet</h3>
          <p className="text-gray-500 mb-6">Please check back later or contact an administrator for more information.</p>
          <button 
            onClick={() => fetchMeetings(sectorFilter)} 
            className="px-4 py-2 bg-yellow-400 text-[#014a2f] rounded hover:bg-yellow-500 transition-colors"
          >
            Retry Loading Meetings
          </button>
        </div>
      )}
    </div>
  );
}
