'use client';

import React from 'react';
const { useEffect, useState, useRef } = React;
import DualColorSpinner from './DualColorSpinner';

interface StatItemProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  className?: string; // Add optional className prop for custom styling
  style?: React.CSSProperties; // Add optional style prop for inline styles
  iconRight?: boolean; // Add optional prop to place icon on the right
}

const StatItem = ({ value, label, icon, className = '', style, iconRight = false }: StatItemProps) => (
  <div className={`bg-white rounded-lg shadow-md p-6 flex items-center transition-all duration-300 ${className}`} style={style}>
    {!iconRight && <div className="text-yellow-500 mr-4 text-3xl">{icon}</div>}
    <div className={iconRight ? 'mr-auto w-full' : ''}>
      <div className={`text-2xl font-bold text-gray-800 ${iconRight ? 'text-right' : 'text-left'}`}>{value}</div>
      <div className={`text-gray-500 text-sm ${iconRight ? 'text-right' : ''}`}>{label}</div>
    </div>
    {iconRight && <div className="text-yellow-500 ml-4 text-3xl">{icon}</div>}
  </div>
);

interface Stats {
  totalMeetings: number;
  totalAttendees: number;
  sectorsRepresented: number;
  upcomingMeetings: number;
  ongoingMeetings: number; // Add ongoing meetings count
  attendanceRate: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalMeetings: 0,
    totalAttendees: 0,
    sectorsRepresented: 0,
    upcomingMeetings: 0,
    ongoingMeetings: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create a ref for the section to adjust background image position if needed
  const sectionRef = useRef<HTMLElement>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching stats from API...');
      
      // Add a cache-busting parameter to avoid browser caching
      const timestamp = new Date().getTime();
      const url = `/api/stats?t=${timestamp}`;
      
      console.log('Fetching stats with URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received stats data:', data);
      
      if (data && typeof data === 'object' && 'totalMeetings' in data) {
        // Reset stats first to ensure UI updates
        setStats({
          totalMeetings: 0,
          totalAttendees: 0,
          sectorsRepresented: 0,
          upcomingMeetings: 0,
          ongoingMeetings: 0,
          attendanceRate: 0
        });
        
        // Then update with actual values after a short delay
        setTimeout(() => {
          setStats({
            totalMeetings: data.totalMeetings || 0,
            totalAttendees: data.totalAttendees || 0,
            sectorsRepresented: data.sectorsRepresented || 0,
            upcomingMeetings: data.upcomingMeetings || 0,
            ongoingMeetings: data.ongoingMeetings || 0,
            attendanceRate: data.attendanceRate || 0
          });
          console.log('Stats updated with values:', data);
        }, 100);
      } else {
        console.error('Invalid stats data format:', data);
        throw new Error('Invalid statistics format received from server');
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(`Could not load statistics: ${err?.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Function to manually refresh stats (can be called after data clearing)
  const refreshStats = () => {
    console.log('Manually refreshing statistics...');
    fetchStats();
  };
  
  // Expose the refresh method to the window so other components can trigger it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Adding custom method to window
      window.refreshStatsSection = refreshStats;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore - Cleanup
        delete window.refreshStatsSection;
      }
    };
  }, []);
  
  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up interval to refresh stats less frequently (every 60 seconds)
    // This is much less intrusive but still keeps data relatively fresh
    const intervalId = setInterval(() => {
      fetchStats();
    }, 60000); // Changed from 5 seconds to 60 seconds
    
    // Add event listener for custom events (only for important data changes)
    const handleDataChange = () => {
      console.log('Data change event detected, refreshing stats');
      // Single refresh is sufficient for most cases
      fetchStats();
    };
    
    // Listen for page visibility changes to refresh when user returns to the page
    // But only if they've been away for a while (reduces unnecessary refreshes)
    let lastVisibilityTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeAway = now - lastVisibilityTime;
        // Only refresh if user has been away for more than 5 minutes
        if (timeAway > 300000) { // 5 minutes in milliseconds
          console.log('Page became visible after being away, refreshing stats');
          fetchStats();
        }
      } else {
        lastVisibilityTime = Date.now();
      }
    };
    
    window.addEventListener('meetingDataChanged', handleDataChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up interval and event listeners on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('meetingDataChanged', handleDataChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gray-100 py-16 overflow-hidden"
      style={{
        position: 'relative',
      }}
    >
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `url('/pngegg.png')`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          opacity: 0.18,  // Increased background image opacity for better visibility
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Platform Statistics</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <DualColorSpinner size={50} className="mx-auto mb-2" />
            <p>Loading statistics...</p>
          </div>
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
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, white 0%, white 40%, rgba(255,255,255,0) 100%)'
              }}
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          
            <StatItem 
              value={stats.sectorsRepresented}
              label="Sectors Represented"
              className="relative overflow-hidden"
              iconRight={true}
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, white 60%, white 100%)'
              }}
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          
            {/* Upcoming Meetings */}
            <StatItem 
              value={stats.upcomingMeetings}
              label="Upcoming Meetings"
              iconRight={true}
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
            {/* Ongoing Meetings */}
            <StatItem 
              value={stats.ongoingMeetings}
              label="Ongoing Meetings"
              className="bg-gradient-to-r from-white to-yellow-50 border-l-4 border-yellow-500"
              icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            }
          />
          
            {/* Enhanced Attendance Rate Card with Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-4">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 mr-4 text-3xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Attendance Rate</h3>
                  <p className="text-sm text-gray-500">Actual vs. expected meeting attendance</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-3xl font-bold text-gray-800">{stats.attendanceRate}%</span>
                  <span className="text-sm font-medium text-gray-500">
                    {stats.attendanceRate >= 75 ? '🟢 Excellent' : 
                     stats.attendanceRate >= 50 ? '🟡 Good' : 
                     stats.attendanceRate > 0 ? '🔴 Needs improvement' : 'No past meetings yet'}
                  </span>
                </div>
                
                {/* Progress bar with color based on rate */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${stats.attendanceRate >= 75 ? 'bg-green-500' : 
                                                    stats.attendanceRate >= 50 ? 'bg-yellow-500' : 
                                                    'bg-red-500'}`} 
                    style={{ width: `${Math.max(stats.attendanceRate, 3)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600 mt-2">
                  {stats.attendanceRate > 0 ?
                    <p>The attendance rate shows how many invited attendees actually participated in meetings. Higher attendance indicates effective meeting organization and engagement.</p>
                    :
                    <p>No past meetings data available yet. The attendance rate will be calculated once meetings are completed.</p>
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
