"use client";

import React from "react";
import Link from "next/link";
import { useSessionAuth } from "../../lib/session-auth";
import { useRouter } from "next/navigation";

const { useState, useEffect } = React;

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  meetingType: string;
  onlineMeetingUrl?: string;
  registrationEnd?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
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

interface AuthState {
  isLoggedIn: boolean;
  username?: string;
  user?: {
    role: string;
    email: string;
    name: string;
  };
}

export default function Dashboard() {
  const auth = useSessionAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Define the fetch function outside the effect to avoid strict mode errors
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError("");
        
        if (!auth.user?.email) {
          setError("User email not available");
          return;
        }

        let url = `/api/meetings/recent?creatorEmail=${encodeURIComponent(
          auth.user.email
        )}`;

        console.log('Fetching recent meetings from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Recent meetings API response:', data);
        
        // Handle the new API response structure
        if (data.success && data.data) {
          setMeetings(data.data.meetings || []);
          setTotalMeetings(data.data.total || 0);
        } else if (data.meetings) {
          // Fallback for old response structure
          setMeetings(data.meetings);
          setTotalMeetings(data.total || 0);
        } else {
          console.warn('Unexpected API response structure:', data);
          setMeetings([]);
          setTotalMeetings(0);
        }
      } catch (err) {
        console.error('Error fetching recent meetings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
        setMeetings([]);
        setTotalMeetings(0);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isLoggedIn && auth.user?.email) {
      fetchMeetings();
    }
  }, [auth.isLoggedIn, auth.user?.email]);

  // Instead of redirecting, show login message
  if (!auth?.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the admin dashboard.
          </p>
          <a
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Admin dashboard content */}

      {/* Quick Management Links */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* User Management Card - Only visible to admins */}
        {auth.user?.role === "ADMIN" && (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#014a2f]">
                  User Management
                </h2>
                <p className="text-gray-600">
                  Create, view, and manage user accounts in the system.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/users"
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors inline-block"
              >
                Manage Users
              </Link>
            </div>
          </div>
        )}

        {/* Meetings Management Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
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
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#014a2f]">
                Meetings Management
              </h2>
              <p className="text-gray-600">
                Create, view, and manage all meetings in the system.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/meetings"
              className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors inline-block"
            >
              View All Meetings
            </Link>
            {(auth.user?.role === "ADMIN" || auth.user?.role === "CREATOR") && (
              <Link
                href="/admin/meetings/create"
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors inline-block"
              >
                Create Meeting
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
          Recent Meetings
        </h2>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            {auth.user?.role === "CREATOR" ? (
              <>
                <h3 className="text-xl font-medium text-gray-600 mb-4">
                  You haven&apos;t created any meetings yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first meeting to get started!
                </p>
                <Link
                  href="/admin/meetings/create"
                  className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
                >
                  Create Meeting
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-gray-600 mb-4">
                  No meetings found
                </h3>
                <p className="text-gray-500">
                  There are no meetings in the system yet.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting: Meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {meeting.title}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          meeting.meetingType === "ONLINE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {meeting.meetingType === "ONLINE"
                          ? "Online"
                          : "Physical"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {/* Format the date for better readability */}
                      {(() => {
                        const date = new Date(meeting.date);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}-${month}-${year} ${hours}:${minutes}`;
                      })()}
                    </td>
                    <td
                      className="px-4 py-2 truncate max-w-[150px]"
                      title={meeting.location}
                    >
                      {meeting.location}
                    </td>
                    <td className="px-4 py-2">
                      {meeting._count?.attendees || 0}
                    </td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/meetings/${meeting.id}`)
                        }
                        className="text-[#014a2f] hover:text-[#014a2f]/80 flex items-center cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>

                      {/* Only admins can edit meetings */}
                      {auth.user?.role === "ADMIN" && (
                        <Link
                          href={`/admin/meetings/${meeting.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-800 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </Link>
                      )}

                      {/* Creators can add resources to their meetings */}
                      {auth.user?.role === "CREATOR" && (
                        <Link
                          href={`/admin/meetings/${meeting.id}/resources`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Add Resources
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View all meetings link */}
        {meetings.length > 4 && (
          <div className="mt-4 text-right">
            <Link
              href="/admin/meetings"
              className="text-[#014a2f] hover:text-[#014a2f]/80 inline-flex items-center"
            >
              View all {totalMeetings} meetings
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
