import Link from 'next/link';
import React from 'react';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
}

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-2 text-[#014a2f]">{meeting.title}</h2>
      <p className="text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Date:</p>
          <p className="font-medium">{new Date(meeting.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Location:</p>
          <p className="font-medium">{meeting.location}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/meetings/${meeting.id}`}
          className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          View Details
        </Link>
        <Link
          href={`/meetings/${meeting.id}/register`}
          className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors"
        >
          Register
        </Link>
      </div>
    </article>
  );
}
