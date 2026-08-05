"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ResourceDownload from "@/components/ResourceDownload";
import { cancelMeetingAction } from "@/lib/actions/cancelMeeting";
import { Meeting } from "./page";

// ─── Updated interface with cancellation fields ───

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MeetingDetailsClientProps {
  meeting: Meeting | null;
  user: UserRecord;
  baseUrl: string;
}

export default function MeetingDetailsClient({
  meeting,
  user,
  baseUrl,
}: MeetingDetailsClientProps) {
  const router = useRouter();
  const [meetingUrl, setMeetingUrl] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meeting) {
      setMeetingUrl(`${baseUrl}/meetings/${meeting.id}/register`);
    }
  }, [meeting, baseUrl]);

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      await cancelMeetingAction(meeting!.id, cancelReason);
      // Refresh server data without full page reload
      router.refresh();
      // Close modal and reset state
      setShowCancelModal(false);
      setCancelReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel meeting");
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Not Found State ──
  if (!meeting) {
    return (
      <div className="container mx-auto py-6 sm:py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">
            Meeting Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The meeting you are looking for does not exist.
          </p>
          <Link
            href="/admin"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Content ──
  return (
    <div className="container mx-auto py-6 sm:py-8 px-4">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-gray-700 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 mb-6">
            {/* Title & Cancellation Badge */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#014a2f]">
                  {meeting.title}
                </h1>
                {meeting.isCancelled && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    Cancelled
                  </span>
                )}
              </div>
              <span className="bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                {meeting.meetingId || "No ID"}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>

            {/* Info Grid (unchanged) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Date & Time
                </h3>
                <p className="text-gray-800">
                  {format(new Date(meeting.date), "PPP p")}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Meeting Type
                </h3>
                <p className="text-gray-800 flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      meeting.meetingType === "ONLINE"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  />
                  {meeting.meetingType === "ONLINE"
                    ? "Online Meeting"
                    : "Physical Meeting"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Location
                </h3>
                <p className="text-gray-800">{meeting.location}</p>
              </div>
              {meeting.meetingType === "ONLINE" && meeting.onlineMeetingUrl && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Meeting URL
                  </h3>
                  <a
                    href={meeting.onlineMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {meeting.onlineMeetingUrl}
                  </a>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Registration Closes
                </h3>
                <p className="text-gray-800">
                  {meeting.registrationEnd
                    ? format(new Date(meeting.registrationEnd), "PPP p")
                    : "2 hours after meeting starts"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Sector
                </h3>
                <p className="text-gray-800">
                  {meeting.sector || "Not specified"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Creator Type
                </h3>
                <p className="text-gray-800">
                  {meeting.creatorType || "Not specified"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Creator Email
                </h3>
                <p className="text-gray-800">
                  {meeting.creatorEmail || "Not specified"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Attendees
                </h3>
                <p className="text-gray-800">
                  {meeting._count?.attendees || 0}
                </p>
              </div>
            </div>

            {/* Resources (unchanged) */}
            {meeting.resources && meeting.resources.length > 0 && (
              <div className="mt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Meeting Resources
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {meeting.resources.map((resource) => (
                      <li
                        key={resource.id}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50"
                      >
                        <div className="flex flex-wrap gap-2">
                          {/* File type icon – same as before */}
                          {resource.fileType.includes("pdf") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          ) : resource.fileType.includes("image") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4-4 4 4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              />
                            </svg>
                          ) : resource.fileType.includes("word") ||
                            resource.fileType.includes("document") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-blue-500"
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
                          ) : resource.fileType.includes("sheet") ||
                            resource.fileType.includes("excel") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          ) : resource.fileType.includes("presentation") ||
                            resource.fileType.includes("powerpoint") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-orange-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-500"
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
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {resource.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(resource.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <ResourceDownload
                          fileName={resource.fileName}
                          resourceId={resource.id}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons – now with !meeting.isCancelled checks */}
            <div className="flex flex-wrap gap-3">
              {(user.role === "ADMIN" || user.role === "CREATOR") &&
                new Date(meeting.date) > new Date() &&
                !meeting.isCancelled && (
                  <Link
                    href={`/admin/meetings/${meeting.id}/edit`}
                    className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Edit Meeting
                  </Link>
                )}
              {user.role === "CREATOR" && !meeting.isCancelled && (
                <Link
                  href={`/admin/meetings/${meeting.id}/resources`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Add Resources
                </Link>
              )}
              <Link
                href={`/admin/meetings/${meeting.id}/attendees`}
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors"
              >
                View Attendees
              </Link>
              <Link
                href="/admin/meetings"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
              >
                All Meetings
              </Link>
              {/* Cancel button – only if upcoming and not cancelled */}
              {(user.role === "ADMIN" || user.role === "CREATOR") &&
                !meeting.isCancelled &&
                new Date(meeting.date) > new Date() && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Cancel Meeting
                  </button>
                )}
            </div>
          </div>

          {/* Cancellation details box */}
          {meeting.isCancelled && meeting.cancelledAt && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium">
                This meeting has been cancelled.
              </p>
              {meeting.cancellationReason && (
                <p className="text-red-600 text-sm mt-1">
                  Reason: {meeting.cancellationReason}
                </p>
              )}
              <p className="text-xs text-red-500 mt-1">
                Cancelled on {format(new Date(meeting.cancelledAt), "PPP p")}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#014a2f]">
              QR Code
            </h2>
            <p className="text-gray-600 mb-4">
              Scan this QR code to access the meeting details.
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={meetingUrl} />
            </div>
            {new Date(meeting.date) > new Date() && !meeting.isCancelled && (
              <div className="text-center">
                <Link
                  href={`/meetings/${meeting.id}/register`}
                  className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors inline-block w-full"
                >
                  Register for Meeting
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 mt-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#014a2f]">
              Meeting ID
            </h2>
            <p className="text-gray-600 mb-4">Use this ID for reference:</p>
            <div className="bg-gray-100 p-3 rounded-md text-center font-mono text-sm break-all">
              {meeting.meetingId || "Not assigned"}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cancellation Confirmation Modal ─── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Cancel Meeting</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel <strong>{meeting.title}</strong>?
            </p>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={isCancelling}
            />
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isCancelling}
              >
                No, keep it
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
