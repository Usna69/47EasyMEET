import React from 'react';
import { prisma } from '../../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RegistrationForm from '../../../../components/RegistrationForm';

interface RegistrationPageParams {
  params: {
    id: string;
  };
}

export default async function RegistrationPage({ params }: RegistrationPageParams) {
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!meeting) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href={`/meetings/${meeting.id}`} className="text-primary hover:underline flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Meeting Details
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-6 text-center">Register for Meeting</h1>
          <h2 className="text-xl text-gray-700 mb-8 text-center">{meeting.title}</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-lg">{new Date(meeting.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time</h3>
              <p className="text-lg">{new Date(meeting.date).toLocaleTimeString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="text-lg">{meeting.location}</p>
            </div>
          </div>

          <RegistrationForm meetingId={meeting.id} />
        </div>
      </div>
    </div>
  );
}
