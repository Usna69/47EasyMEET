"use client";

import React from "react";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DualColorSpinner from "@/components/DualColorSpinner";

export default function HighLevelDashboard() {
  const auth = useSessionAuth();
  const router = useRouter();

  // Show loading while auth is being determined
  if (auth.isLoggedIn === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DualColorSpinner />
      </div>
    );
  }

  // Redirect if not logged in
  if (!auth.isLoggedIn) {
    router.push("/admin/login");
    return null;
  }

  // Redirect VIEW_ONLY users to their specialized page
  if (auth.user?.role === "VIEW_ONLY") {
    router.push("/view-only");
    return null;
  }

  // Redirect if not a high-level user
  if (!auth.user?.userLevel || auth.user.userLevel === "REGULAR") {
    router.push("/admin");
    return null;
  }

  const getUserLevelDisplay = () => {
    switch (auth.user?.userLevel) {
      case "BOARD_MEMBER":
        return "Board Member";
      case "GOVERNOR_OFFICE":
        return "Office of the Governor";
      case "CABINET":
        return "Cabinet Member";
      default:
        return "High-Level User";
    }
  };

  const getWelcomeMessage = () => {
    switch (auth.user?.userLevel) {
      case "BOARD_MEMBER":
        return "Welcome to the Board Members Portal. Here you can view and register for board meetings and high-level governance sessions.";
      case "GOVERNOR_OFFICE":
        return "Welcome to the Office of the Governor Portal. Access meetings and events related to gubernatorial activities and executive functions.";
      case "CABINET":
        return "Welcome to the Cabinet Members Portal. Manage and participate in cabinet meetings and executive decision-making sessions.";
      default:
        return "Welcome to the High-Level User Portal.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#014a2f] mb-4">
              <span className="text-yellow-500">Easy</span>MEET
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {getUserLevelDisplay()} Portal
            </h2>
            <p className="text-gray-600 text-lg">{getWelcomeMessage()}</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Logged in as:</strong> {auth.user?.name} (
                {auth.user?.email})
              </p>
              {auth.user?.customRole && (
                <p className="text-blue-700 mt-1">
                  <strong>Role:</strong> {auth.user?.customRole}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                View Meetings
              </h3>
              <p className="text-gray-600 mb-4">
                Browse available meetings and events for your level
              </p>
              <Link
                href="/high-level/meetings"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                View Meetings
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Create Meeting
              </h3>
              <p className="text-gray-600 mb-4">
                Schedule a new high-level meeting or event
              </p>
              <Link
                href="/high-level/meetings/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Create Meeting
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                My Registrations
              </h3>
              <p className="text-gray-600 mb-4">
                View your meeting registrations and attendance
              </p>
              <Link
                href="/high-level/registrations"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                View Registrations
              </Link>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-[#014a2f] mb-6">
            Portal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">
                Access Level
              </h4>
              <p className="text-gray-600 mb-4">
                As a {getUserLevelDisplay().toLowerCase()}, you have access to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>High-level meetings and events</li>
                <li>Restricted access meetings</li>
                <li>Meeting creation capabilities</li>
                <li>Priority registration for events</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">
                Quick Tips
              </h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Check the meetings page regularly for new events</li>
                <li>Register early for important meetings</li>
                <li>Use the create meeting feature for scheduling</li>
                <li>Contact support if you need assistance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              // Handle logout
              await auth.logout();
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
