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
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center border-t-4 border-accent font-poppins">
          <div className="mb-6 text-secondary">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold mb-2 text-primary">Registration Successful!</h1>
          <p className="text-dark mb-6">
            You have successfully registered for the meeting: <span className="font-medium text-secondary">{meeting.title}</span>
          </p>
          <div className="bg-green-50 p-5 rounded-md mb-8 mx-auto max-w-xl border border-green-100">
            <p className="text-dark">
              The meeting will take place on <span className="font-medium">{new Date(meeting.date).toLocaleDateString()}</span> at <span className="font-medium">{new Date(meeting.date).toLocaleTimeString()}</span> in <span className="font-medium">{meeting.location}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={`/meetings/${meeting.id}`} className="btn-primary">
              View Meeting Details
            </Link>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
