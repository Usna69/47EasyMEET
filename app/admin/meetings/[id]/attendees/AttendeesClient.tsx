"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AttendancePDFDocument from "@/components/AttendancePDFDocument";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  organization: string;
  signatureData?: string | null; // add this
  createdAt: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  sector?: string;
  meetingId?: string;
  meetingCategory?: string;
  creatorEmail?: string;
  customLetterhead?: string;
}

interface AttendeesClientProps {
  meeting: Meeting | null;
  attendees: Attendee[];
}

export default function AttendeesClient({
  meeting,
  attendees,
}: AttendeesClientProps) {
  // If the server didn't find the meeting
  if (!meeting) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/admin/meetings/${meeting.id}`}
          className="text-gray-700 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Meeting Details
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        {/* Header with meeting info & PDF button */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#014a2f]">Attendees</h1>
            <p className="text-gray-600 mt-1">
              Meeting: <span className="font-medium">{meeting.title}</span>
              {meeting.meetingId && (
                <span className="ml-2 bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2 py-0.5 rounded">
                  {meeting.meetingId}
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            {attendees.length > 0 && (
              <PDFDownloadLink
                document={
                  <AttendancePDFDocument
                    meeting={meeting}
                    attendees={attendees}
                  />
                }
                fileName={`${meeting.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-attendance.pdf`}
              >
                {({ loading }) => (
                  <button
                    className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Generating PDF..." : "Generate PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </div>

        {/* Attendees table */}
        {attendees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No attendees have registered for this meeting yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  {meeting.meetingCategory !== "INTERNAL" && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{attendee.name}</td>
                    <td className="px-4 py-3">{attendee.email}</td>
                    <td className="px-4 py-3">
                      {attendee.phoneNumber || "N/A"}
                    </td>
                    {meeting.meetingCategory !== "INTERNAL" && (
                      <td className="px-4 py-3">
                        {attendee.organization || "N/A"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {attendee.designation || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {attendee.signatureData ? (
                        <img
                          src={attendee.signatureData}
                          alt="Signature"
                          className="h-10 max-w-[100px] object-contain border border-gray-200 rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No signature
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(attendee.createdAt), "PPp")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
