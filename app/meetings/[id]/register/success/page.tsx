import React from 'react';
import { prisma } from '../../../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface SuccessPageParams {
  params: {
    id: string;
  };
}

export default async function SuccessPage({ params }: SuccessPageParams) {
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!meeting) {
    notFound();
  }

  return (
    <div className="py-16 px-4" style={{ 
        background: `url('/background-pattern.svg')`,
        backgroundSize: 'cover',
        position: 'relative',
      }}>
      <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
      <div className="container mx-auto relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100">
          <div className="text-[#014a2f] mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#014a2f] mb-4">Registration Successful!</h1>
          <p className="text-gray-600 mb-8">
            You have successfully registered for the meeting: <span className="font-medium">{meeting.title}</span>.
            The meeting will take place on {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString()} in {meeting.location}.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link 
              href={`/meetings/${meeting.id}`}
              className="bg-[#FFC107] hover:bg-[#E0A800] text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors"
            >
              View Meeting Details
            </Link>
            <Link 
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
