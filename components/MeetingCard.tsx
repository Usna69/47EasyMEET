import Link from "next/link";
import React from "react";

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  meetingType?: string;
  onlineMeetingUrl?: string;
  status?: 'UPCOMING' | 'ONGOING' | 'CLOSED';
  _count?: {
    attendees: number;
    resources?: number;
  };
  resources?: Array<{
    id: string;
    fileName: string;
    fileType: string;
  }>;
}

// Consistent date formatting function to prevent hydration errors
const formatDateConsistent = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  // Calculate meeting status
  const getMeetingStatus = () => {
    const meetingDate = new Date(meeting.date);
    const endTime = new Date(meetingDate);
    endTime.setHours(endTime.getHours() + 2); // Assuming 2-hour meetings

    const now = new Date();

    if (now < meetingDate) {
      return "upcoming";
    } else if (now >= meetingDate && now <= endTime) {
      return "ongoing";
    } else {
      return "ended";
    }
  };

  // Calculate time until meeting
  const timeUntilMeeting = () => {
    const meetingDate = new Date(meeting.date);
    const now = new Date();
    const diffTime = meetingDate.getTime() - now.getTime();

    // If meeting has already happened
    if (diffTime <= 0) {
      return "";
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const status = getMeetingStatus();
  const timeUntil = timeUntilMeeting();

  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {meeting.title}
          </h3>

          {/* Status badge */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              status === "upcoming"
                ? "bg-green-100 text-green-800"
                : status === "ongoing"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status === "upcoming"
              ? "Upcoming"
              : status === "ongoing"
              ? "Ongoing"
              : "Ended"}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>

        <div className="space-y-3">
          {/* Date and time */}
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDateConsistent(meeting.date)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{meeting.location}</span>
          </div>

          {/* Meeting type */}
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {meeting.meetingType === "ONLINE" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              )}
            </svg>
            <span>
              {meeting.meetingType === "ONLINE"
                ? "Online Meeting"
                : "Physical Meeting"}
            </span>
          </div>

          {/* Resources indicator removed from here and moved to the top of the card */}

          {/* Attendees */}
          {meeting._count?.attendees !== undefined && (
            <div className="flex items-center text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                {meeting._count.attendees} attendee
                {meeting._count.attendees !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        {status === "upcoming" && timeUntil && (
          <span className="text-xs font-medium text-green-700">
            Starts in: {timeUntil}
          </span>
        )}
        {status === "ongoing" && (
          <span className="text-xs font-medium text-blue-700">
            Currently active
          </span>
        )}
        {status === "ended" && (
          <span className="text-xs font-medium text-gray-500">
            Meeting ended
          </span>
        )}

        <div className="flex space-x-2">
          <Link
            href={`/meetings/${meeting.id}`}
            className="text-sm font-medium bg-[#014a2f] text-white px-3 py-1 rounded hover:bg-[#014a2f]/90 transition-colors"
          >
            View Details
          </Link>

          {status === "ongoing" ? (
            <Link
              href={`/meetings/${meeting.id}/register`}
              className="text-sm font-medium bg-yellow-400 text-[#014a2f] px-3 py-1 rounded hover:bg-yellow-500 transition-colors"
            >
              Register
            </Link>
          ) : status === "upcoming" ? (
            <span className="text-sm font-medium bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed">
              Opens Soon
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
