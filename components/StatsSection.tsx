"use client";

import React, { useEffect, useRef, useState } from "react";
import DualColorSpinner from "./DualColorSpinner";

interface StatItemProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  iconRight?: boolean;
}

const StatItem = ({
  value,
  label,
  icon,
  className = "",
  style,
  iconRight = false,
}: StatItemProps) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 flex items-center transition-all duration-300 ${className}`}
    style={style}
  >
    {!iconRight && <div className="text-yellow-500 mr-4 text-3xl">{icon}</div>}

    <div className={iconRight ? "mr-auto w-full" : ""}>
      <div
        className={`text-2xl font-bold text-gray-800 ${
          iconRight ? "text-right" : "text-left"
        }`}
      >
        {value}
      </div>
      <div className={`text-gray-500 text-sm ${iconRight ? "text-right" : ""}`}>
        {label}
      </div>
    </div>

    {iconRight && <div className="text-yellow-500 ml-4 text-3xl">{icon}</div>}
  </div>
);

interface Stats {
  totalMeetings: number;
  totalAttendees: number;
  sectorsRepresented: number;
  upcomingMeetings: number;
  ongoingMeetings: number;
  attendanceRate: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalMeetings: 0,
    totalAttendees: 0,
    sectorsRepresented: 0,
    upcomingMeetings: 0,
    ongoingMeetings: 0,
    attendanceRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sectionRef = useRef<HTMLElement>(null);
  const fetchingRef = useRef(false);

  const fetchStats = async () => {
    if (fetchingRef.current) return; // prevent overlapping requests
    fetchingRef.current = true;

    try {
      setError("");

      const url = `/api/stats?t=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid statistics format received from server");
      }

      setStats({
        totalMeetings: data.totalMeetings || 0,
        totalAttendees: data.totalAttendees || 0,
        sectorsRepresented: data.sectorsRepresented || 0,
        upcomingMeetings: data.upcomingMeetings || 0,
        ongoingMeetings: data.ongoingMeetings || 0,
        attendanceRate: data.attendanceRate || 0,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.refreshStatsSection = refreshStats;
    }

    return () => {
      if (typeof window !== "undefined") {
        // @ts-ignore
        delete window.refreshStatsSection;
      }
    };
  }, []);

  useEffect(() => {
    fetchStats();

    const intervalId = setInterval(() => {
      fetchStats();
    }, 60000);

    let lastHiddenTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const timeAway = now - lastHiddenTime;

        if (timeAway > 300000) {
          fetchStats();
        }
      } else {
        lastHiddenTime = Date.now();
      }
    };

    const handleDataChange = () => {
      fetchStats();
    };

    window.addEventListener("meetingDataChanged", handleDataChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("meetingDataChanged", handleDataChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gray-100 py-16 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/pngegg.png')`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: 0.18,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
          Platform Statistics
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <DualColorSpinner size={50} className="mx-auto mb-2" />
            <p>Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatItem
              value={stats.totalMeetings}
              label="Total Meetings"
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <StatItem
              value={stats.totalAttendees}
              label="Total Attendees"
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />

            <StatItem
              value={stats.sectorsRepresented}
              label="Sectors Represented"
              iconRight
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />

            <StatItem
              value={stats.upcomingMeetings}
              label="Upcoming Meetings"
              iconRight
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <StatItem
              value={stats.ongoingMeetings}
              label="Ongoing Meetings"
              className="bg-gradient-to-r from-white to-yellow-50 border-l-4 border-yellow-500"
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
