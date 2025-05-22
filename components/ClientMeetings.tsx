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

  // Function to fetch meetings with the sector filter
  const fetchMeetings = async (sector?: string) => {
    setIsLoading(true);
    try {
      const url = sector 
        ? `/api/meetings?sector=${encodeURIComponent(sector)}` 
        : '/api/meetings';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for sector filter changes from the HomeSectorFilter component
  useEffect(() => {
    const handleSectorFilterChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ sector: string }>;
      const newSector = customEvent.detail.sector;
      setSectorFilter(newSector || undefined);
      fetchMeetings(newSector || undefined);
      
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
        fetchMeetings(sectorToUse);
        
        // Also update sessionStorage if getting from URL
        if (sectorFromUrl) {
          sessionStorage.setItem('selectedSector', sectorFromUrl);
        }
      }
    }

    return () => {
      window.removeEventListener('sectorfilterchange', handleSectorFilterChange as EventListener);
    };
  }, []);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold">
          {sectorFilter ? `${getSectorName(sectorFilter)} Meetings` : 'Upcoming Meetings'}
        </h2>
        <div className="text-gray-500">
          {isLoading ? (
            <div className="flex items-center">
              <DualColorSpinner size={20} />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            `Showing ${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`
          )}
        </div>
      </div>
      
      {/* Sector filter component is placed in the parent component */}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <DualColorSpinner size={60} className="mb-4" />
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting: Meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-4">No meetings scheduled yet</h3>
          <p className="text-gray-500 mb-6">Please check back later or contact an administrator for more information.</p>
        </div>
      )}
    </div>
  );
}
