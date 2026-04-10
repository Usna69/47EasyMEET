import React from "react";
import { safeQuery } from "../../../../../lib/db";
import Link from "next/link";
import MeetingForm from "../../../../../components/MeetingForm";
import { notFound } from "next/navigation";

interface EditMeetingPageParams {
  params: Promise<{
    id: string;
  }>;
}

// Type for meeting data from database
interface MeetingRow {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  creatorEmail: string | null;
  sector: string | null;
  creatorType: string | null;
  meetingId: string | null;
  meetingType: string;
  onlineMeetingUrl: string | null;
  registrationEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customLetterhead: string | null;
  meetingCategory: string | null;
  organization: string | null;
  password: string | null;
  meetingLevel: string;
  restrictedAccess: boolean;
}

export default async function EditMeetingPage(props: EditMeetingPageParams) {
  const params = await props.params;

  const query = `
    SELECT
      id, title, description, date, location,
      creatorEmail, sector, creatorType, meetingId,
      meetingType, onlineMeetingUrl, registrationEnd,
      createdAt, updatedAt, customLetterhead,
      meetingCategory, organization, password,
      meetingLevel, restrictedAccess
    FROM dbo.Meeting
    WHERE id = $1
  `;

  const { rows } = await safeQuery<MeetingRow>(query, [params.id]);

  if (rows.length === 0) {
    notFound();
  }

  const meeting = rows[0];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-primary hover:underline flex items-center"
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

      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-6">Edit Meeting</h1>
          <MeetingForm meeting={meeting} isEditing={true} />
        </div>
      </div>
    </div>
  );
}
