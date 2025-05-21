'use client';

import * as React from 'react';
const { useEffect, useState } = React;

interface StatItemProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
}

const StatItem = ({ value, label, icon }: StatItemProps) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
    <div className="text-yellow-500 mr-4 text-3xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  </div>
);

interface Stats {
  totalMeetings: number;
  totalAttendees: number;
  sectorsRepresented: number;
  upcomingMeetings: number;
  attendanceRate: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalMeetings: 0,
    totalAttendees: 0,
    sectorsRepresented: 0,
    upcomingMeetings: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching stats from API...');
      const response = await fetch('/api/stats');
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch statistics: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Stats data received:', data);
      setStats(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(`Could not load statistics: ${err?.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up interval to refresh stats every 30 seconds
    const intervalId = setInterval(() => {
      fetchStats();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Platform Statistics</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading statistics...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatItem 
              value={stats.totalMeetings}
              label="Total Meetings"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          
            <StatItem 
              value={stats.totalAttendees}
              label="Total Attendees"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          
            <StatItem 
              value={stats.sectorsRepresented}
              label="Sectors Represented"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          
            <StatItem 
              value={stats.upcomingMeetings}
              label="Upcoming Meetings"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
            <StatItem 
              value={`${stats.attendanceRate}%`}
              label="Attendance Rate"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          </div>
        )}
      </div>
    </section>
  );
}
