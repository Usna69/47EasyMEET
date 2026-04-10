// app/meetings/[id]/register/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { safeQuery } from "@/lib/db";
import RegForm from "../../../../components/RegForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface RegistrationPageParams {
  params: Promise<{ id: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateConsistent = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${mins}`;
};

const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RegistrationPage(props: RegistrationPageParams) {
  const { id } = await props.params;

  const { rows } = await safeQuery<MeetingRow>(
    `SELECT TOP 1
       id, title, description, date, location,
       creatorEmail, sector, creatorType, meetingId,
       meetingType, onlineMeetingUrl, registrationEnd,
       createdAt, updatedAt, customLetterhead, meetingCategory,
       organization, password, meetingLevel, restrictedAccess
     FROM dbo.Meeting
     WHERE id = $1`,
    [id],
  );

  const meeting = rows[0];

  if (!meeting) {
    notFound();
  }

  // Normalise bit field
  meeting.restrictedAccess = Boolean(meeting.restrictedAccess);

  console.log(meeting);

  // ── Registration window logic ──────────────────────────────────────────────
  const now = new Date();
  const meetingStartTime = new Date(meeting.date);
  const registrationEndTime = meeting.registrationEnd
    ? new Date(meeting.registrationEnd)
    : new Date(meetingStartTime.getTime() + 2 * 60 * 60 * 1000); // 2 h after start

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isMeetingEnded = meetingStartTime < yesterday;

  const isRegistrationOpen =
    now >= meetingStartTime && now <= registrationEndTime && !isMeetingEnded;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="py-8"
      style={{
        background: `url('/background-pattern.svg')`,
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-60 z-0" />
      <div className="container relative z-10">
        <div className="mb-6">
          <Link
            href={`/meetings/${meeting.id}`}
            className="text-[#014a2f] hover:text-[#014a2f]/80 flex items-center transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Meeting Details
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6 text-center text-[#014a2f]">
              Register for Meeting
            </h1>
            <h2 className="text-xl font-semibold mb-8 text-center text-gray-800">
              {meeting.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h3 className="text-sm font-medium text-[#014a2f]">Date</h3>
                <p className="text-lg">{formatDateConsistent(meeting.date)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h3 className="text-sm font-medium text-[#014a2f]">Time</h3>
                <p className="text-lg">
                  {new Date(meeting.date).toLocaleTimeString()}
                </p>
              </div>
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-100">
                <h3 className="text-sm font-medium text-[#014a2f]">Location</h3>
                <p className="text-lg">{meeting.location}</p>
              </div>
            </div>

            {isRegistrationOpen ? (
              <RegForm meetingprop={meeting} />
            ) : isMeetingEnded ? (
              <StatusBanner variant="red" heading="Meeting has ended">
                This meeting occurred on {formatDateConsistent(meeting.date)}{" "}
                and is no longer available for registration.
                <BackLink id={meeting.id} />
              </StatusBanner>
            ) : now < meetingStartTime ? (
              <StatusBanner
                variant="yellow"
                heading="Registration not yet open"
              >
                You can register for this meeting once it starts at{" "}
                {formatDateConsistent(meeting.date)}.
                <BackLink id={meeting.id} />
              </StatusBanner>
            ) : (
              <StatusBanner
                variant="red"
                heading="Registration period has ended"
              >
                Registration for this meeting closed at{" "}
                {registrationEndTime.toLocaleTimeString()} on{" "}
                {formatDateOnly(registrationEndTime)}.
                <BackLink id={meeting.id} />
              </StatusBanner>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function BackLink({ id }: { id: string }) {
  return (
    <p className="text-sm mt-3">
      <Link href={`/meetings/${id}`} className="font-medium underline">
        Return to meeting details
      </Link>
    </p>
  );
}

function StatusBanner({
  variant,
  heading,
  children,
}: {
  variant: "red" | "yellow";
  heading: string;
  children: React.ReactNode;
}) {
  const colours =
    variant === "yellow"
      ? {
          wrap: "bg-yellow-50 border-yellow-400",
          icon: "text-yellow-400",
          heading: "text-yellow-700 font-medium",
          body: "text-sm text-yellow-600 mt-1",
          // Warning triangle icon
          path: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
        }
      : {
          wrap: "bg-red-50 border-red-400",
          icon: "text-red-400",
          heading: "text-red-700 font-medium",
          body: "text-sm text-red-600 mt-1",
          // X-circle icon
          path: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
        };

  return (
    <div className={`border-l-4 p-4 rounded-md my-6 ${colours.wrap}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${colours.icon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d={colours.path} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className={colours.heading}>{heading}</p>
          <div className={colours.body}>{children}</div>
        </div>
      </div>
    </div>
  );
}
