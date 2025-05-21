import MeetingCard from '../components/MeetingCard';
import { prisma } from '../lib/prisma';
import React from 'react';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';

export default async function Home() {
  const meetings = await prisma.meeting.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <main>
      <HeroSection />
      <StatsSection />
      
      <section id="meetings" className="py-16" style={{ 
          background: `url('/background-pattern.svg')`,
          backgroundSize: 'cover',
          position: 'relative',
        }}>
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
        <div className="container relative z-10">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-semibold">Upcoming Meetings</h2>
          <div className="text-gray-500">Showing {meetings.length} meetings</div>
        </div>
        
        {meetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No meetings scheduled yet</h3>
            <p className="text-gray-500 mb-6">Check back later or visit the admin dashboard to create a new meeting</p>
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
