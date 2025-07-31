import React from "react";
import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import RegForm from "../../../../components/RegForm";

// Disable caching for this route to ensure fresh meeting data is always used
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RegistrationPageParams {
  params: Promise<{
    id: string;
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

export default async function RegistrationPage(props: RegistrationPageParams) {
  const params = await props.params;
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!meeting) {
    notFound();
  }

  // Check if registration is allowed based on meeting time
  const now = new Date();
  const meetingStartTime = new Date(meeting.date);
  const registrationEndTime = meeting.registrationEnd
    ? new Date(meeting.registrationEnd)
    : new Date(new Date(meeting.date).getTime() + 2 * 60 * 60 * 1000); // 2 hours after start

  // Check if meeting is more than a day old (considered ended)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isMeetingEnded = meetingStartTime < yesterday;

  const isRegistrationOpen =
    now >= meetingStartTime && now <= registrationEndTime && !isMeetingEnded;

  console.log(meeting);

  return (
    <div
      className="py-8"
      style={{
        background: `url('/background-pattern.svg')`,
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
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
                <p className="text-lg">
                  {formatDateConsistent(meeting.date)}
                </p>
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
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">
                      Meeting has ended
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      This meeting occurred on{" "}
                      {formatDateConsistent(meeting.date)} and is no
                      longer available for registration.
                    </p>
                    <p className="text-sm text-red-600 mt-3">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="font-medium underline"
                      >
                        Return to meeting details
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : now < meetingStartTime ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-yellow-700 font-medium">
                      Registration not yet open
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      You can register for this meeting once it starts at{" "}
                      {formatDateConsistent(meeting.date)}.
                    </p>
                    <p className="text-sm text-yellow-600 mt-3">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="font-medium underline"
                      >
                        Return to meeting details
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">
                      Registration period has ended
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Registration for this meeting closed at{" "}
                      {registrationEndTime.toLocaleTimeString()} on{" "}
                      {registrationEndTime.toLocaleDateString()}.
                    </p>
                    <p className="text-sm text-red-600 mt-3">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="font-medium underline"
                      >
                        Return to meeting details
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
