"use client";

import React from "react";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import MeetingsWithAuth from "@/components/MeetingsWithAuth";

import DualColorSpinner from "@/components/DualColorSpinner";

export default function ViewOnlyDashboard() {
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

  // Redirect if not a VIEW_ONLY user
  if (auth.user?.role !== "VIEW_ONLY") {
    // Redirect based on user level instead of always going to admin
    if (auth.user?.userLevel && auth.user.userLevel !== "REGULAR") {
      router.push("/high-level");
    } else {
      router.push("/admin");
    }
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
      {/* Hero Section */}
      <div className="bg-[#014a2f] text-white py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-[#FFC107]">Easy</span>MEET
            </h1>
            <h2 className="text-2xl font-semibold mb-4">
              {getUserLevelDisplay()} Portal
            </h2>
            <p className="text-xl mb-8 opacity-90">{getWelcomeMessage()}</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
              <Link
                href="#meetings"
                className="bg-[#FFC107] hover:bg-[#E0A800] text-[#014a2f] font-medium px-8 py-3 rounded-md transition-colors"
              >
                Browse Meetings
              </Link>
              <Link
                href="/view-only/registrations"
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-md transition-colors"
              >
                My Registrations
              </Link>
            </div>

            {/* Logout Button - Below Action Buttons */}
            <div className="flex justify-center mt-4">
              <button
                onClick={async () => {
                  await auth.logout();
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-white font-medium px-8 py-3 rounded-md transition-colors border border-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings Section */}
      <section
        id="meetings"
        className="py-16"
        style={{
          background: `url('/background-pattern.svg')`,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#014a2f] mb-4">
              Available Meetings
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through available meetings and events. Click on any meeting
              to view details and register for attendance.
            </p>
          </div>

          {/* Client-side meetings list */}
          <MeetingsWithAuth initialMeetings={[]} />
        </div>
      </section>
    </div>
  );
}
