"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ---------- Types ----------
interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  meetingType: string;
  onlineMeetingUrl?: string;
  status?: "UPCOMING" | "ONGOING" | "CLOSED";
  _count: {
    attendees: number;
    resources?: number;
  };
  resources: Array<{
    id: string;
    fileName: string;
    fileType: string;
  }>;
}

export default function MeetingsClient({ user }: { user: UserRecord }) {
  const router = useRouter();

  // State
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showActive, setShowActive] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showDepartmentMeetings, setShowDepartmentMeetings] = useState(true);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // ----- Helpers -----
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${d}-${m}-${y} ${hh}:${mm}`;
  };

  const getMeetingStatus = (dateString: string, durationHrs = 2) => {
    const start = new Date(dateString);
    const end = new Date(start);
    end.setHours(end.getHours() + durationHrs);
    const now = new Date();

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "ended";
  };

  const timeUntilMeeting = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const diff = meetingDate.getTime() - Date.now();
    if (diff <= 0) return "Meeting has already occurred";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const hasEndedOverDay = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const end = new Date(meetingDate);
    end.setHours(end.getHours() + 2); // assume 2‑hour meeting
    const oneDayAfter = new Date(end);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    return new Date() > oneDayAfter;
  };

  // ----- Fetch meetings -----
  const fetchMeetings = async (pageNum = 0, append = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setError("");
      } else {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "9",
        active: showActive.toString(),
      });

      if (user.role === "ADMIN") {
        params.set("isAdmin", "true");
      } else if (user.role === "CREATOR") {
        if (showDepartmentMeetings && user.department) {
          params.set("sameDepartment", "true");
          params.set("department", user.department);
        } else {
          params.set("creatorEmail", user.email);
        }
      }

      const res = await fetch(`/api/meetings?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let newMeetings: Meeting[] = [];

      if (data.success && Array.isArray(data.data)) {
        newMeetings = data.data;
      } else if (Array.isArray(data)) {
        newMeetings = data;
      } else if (data.meetings && Array.isArray(data.meetings)) {
        newMeetings = data.meetings;
      }

      // Add missing status field based on date
      newMeetings = newMeetings.map((m) => ({
        ...m,
        status:
          m.status ||
          (getMeetingStatus(m.date) === "upcoming"
            ? "UPCOMING"
            : getMeetingStatus(m.date) === "ongoing"
              ? "ONGOING"
              : "CLOSED"),
      }));

      // Filter out very old meetings for non‑admin roles (if desired)
      if (user.role !== "ADMIN") {
        newMeetings = newMeetings.filter((m) => !hasEndedOverDay(m.date));
      }

      setMeetings((prev) => (append ? [...prev, ...newMeetings] : newMeetings));
      setHasMore(data.pagination?.hasMore ?? newMeetings.length === 9);
      setPage(pageNum);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load meetings");
      if (!append) setMeetings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch & filter changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setMeetings([]);
    fetchMeetings(0, false);
  }, [showActive, showDepartmentMeetings, user.email]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMeetings(page + 1, true);
        }
      },
      { threshold: 0.5 },
    );

    const el = observerTarget.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadingMore, loading, page]);

  // ---------- Render ----------
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/admin"
            className="text-gray-700 hover:text-gray-900 flex items-center mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-[#014a2f]">
            Meetings Management
          </h1>
          {user && (
            <p className="text-gray-600 mt-1">
              {getTimeOfDay()}, {user.name}! Here are your meetings.
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <Link
            href="/admin/meetings/create"
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Meeting
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={showActive}
            onChange={() => setShowActive(!showActive)}
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#014a2f]"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">
            Show Only Active Meetings
          </span>
        </label>

        {user.role === "CREATOR" && user.department && (
          <button
            onClick={() => {
              setShowDepartmentMeetings(!showDepartmentMeetings);
              setPage(0);
              fetchMeetings(0, false);
            }}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              showDepartmentMeetings
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {showDepartmentMeetings
              ? "Department Meetings"
              : "My Meetings Only"}
          </button>
        )}

        <button
          onClick={() => fetchMeetings(0, false)}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Loading state (initial) */}
      {loading && page === 0 && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && meetings.length === 0 && (
        <div className="text-center p-4">
          <p className="text-gray-500">No meetings found</p>
          <p className="text-sm text-gray-500">
            {showActive
              ? "There are no active meetings scheduled."
              : "No meetings have been created yet."}
          </p>
        </div>
      )}

      {/* Meetings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
              meeting.status === "UPCOMING"
                ? "border-[#014a2f]/20"
                : meeting.status === "ONGOING"
                  ? "border-blue-400/30"
                  : "border-gray-200"
            }`}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold truncate">
                  {meeting.title}
                </h2>
                <div className="flex space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      meeting.meetingType === "ONLINE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {meeting.meetingType === "ONLINE" ? "Online" : "Physical"}
                  </span>
                  {meeting.status === "UPCOMING" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Upcoming
                    </span>
                  )}
                  {meeting.status === "ONGOING" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                      Ongoing
                    </span>
                  )}
                  {meeting.status === "CLOSED" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      Ended
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {meeting.description}
              </p>

              <div className="space-y-2">
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
                  <span>{formatDate(meeting.date)}</span>
                </div>

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

                {meeting.resources?.length > 0 && (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>
                      {meeting.resources.length} resource
                      {meeting.resources.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

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
              </div>
            </div>

            {/* Footer with actions */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <span
                className={`text-xs font-medium ${
                  meeting.status === "UPCOMING"
                    ? "text-[#014a2f]"
                    : meeting.status === "ONGOING"
                      ? "text-blue-600"
                      : "text-gray-500"
                }`}
              >
                {meeting.status === "UPCOMING" && (
                  <>Starts in: {timeUntilMeeting(meeting.date)}</>
                )}
                {meeting.status === "ONGOING" && <>Currently active</>}
                {meeting.status === "CLOSED" &&
                  (hasEndedOverDay(meeting.date)
                    ? "Ended over 24h ago"
                    : "Registration closed")}
              </span>

              <div className="flex space-x-2">
                <Link
                  href={`/admin/meetings/${meeting.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Link>

                {/* Edit only for upcoming meetings – exactly as requested */}
                {meeting.status === "UPCOMING" && (
                  <Link
                    href={`/admin/meetings/${meeting.id}/edit`}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-4">
          {loadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
    </div>
  );
}
