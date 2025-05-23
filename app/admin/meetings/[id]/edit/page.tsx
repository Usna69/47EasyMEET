import React from 'react';
import { prisma } from '../../../../../lib/prisma';
import Link from 'next/link';
import MeetingForm from '../../../../../components/MeetingForm';
import { notFound } from 'next/navigation';

interface EditMeetingPageParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMeetingPage(props: EditMeetingPageParams) {
  const params = await props.params;
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
        <Link href="/admin" className="text-primary hover:underline flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-6">Edit Meeting</h1>
          <MeetingForm meeting={meeting} isEditing={true} />
        </div>
      </div>
    </div>
  );
}
