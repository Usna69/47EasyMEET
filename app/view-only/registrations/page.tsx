"use client";

import React from "react";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DualColorSpinner from "@/components/DualColorSpinner";

interface Registration {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingLocation: string;
  registrationDate: string;
  status: string;
}

export default function ViewOnlyRegistrations() {
  const auth = useSessionAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  // Fetch registrations
  React.useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError("");
        
        if (!auth.user?.email) {
          setError("User email not available");
          return;
        }

        // Fetch real registrations from the database
        const response = await fetch(`/api/attendees?userEmail=${encodeURIComponent(auth.user.email)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform the data to match our interface
          const userRegistrations = data.data.map((attendee: any) => ({
            id: attendee.id,
            meetingId: attendee.meetingId,
            meetingTitle: attendee.meeting?.title || "Unknown Meeting",
            meetingDate: attendee.meeting?.date || new Date().toISOString(),
            meetingLocation: attendee.meeting?.location || "TBD",
            registrationDate: attendee.createdAt,
            status: "Confirmed" // Default status since it's not in the schema
          }));
          
          setRegistrations(userRegistrations);
        } else {
          setRegistrations([]);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isLoggedIn && auth.user?.email) {
      fetchRegistrations();
    }
  }, [auth.isLoggedIn, auth.user?.email]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#014a2f] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              My Registrations
            </h1>
            <p className="text-lg opacity-90 mb-6">
              View your meeting registrations and attendance history
            </p>
            
            {/* Back Button */}
            <div className="flex justify-center">
              <Link
                href="/view-only"
                className="text-white hover:text-white/80 font-medium transition-colors"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="py-8"
        style={{
          background: `url('/background-pattern.svg')`,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <DualColorSpinner />
              <p className="text-gray-600 mt-4">Loading your registrations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Registrations Found</h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t registered for any meetings yet. Browse available meetings to get started.
              </p>
              <Link
                href="/view-only"
                className="bg-[#014a2f] hover:bg-[#013d28] text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Browse Meetings
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Meeting Registrations ({registrations.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {registration.meetingTitle}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Meeting Date:</span>
                              <br />
                              {formatDate(registration.meetingDate)}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>
                              <br />
                              {registration.meetingLocation}
                            </div>
                            <div>
                              <span className="font-medium">Registration Date:</span>
                              <br />
                              {formatDate(registration.registrationDate)}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <br />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                registration.status === "Confirmed" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {registration.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6">
                          <Link
                            href={`/meetings/${registration.meetingId}`}
                            className="bg-[#014a2f] hover:bg-[#013d28] text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                          >
                            View Meeting
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
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