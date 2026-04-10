// app/page.tsx  (Home page — server component)
// Replaces the Prisma-based data fetch with the MSSQL action.

import React from "react";
import { Metadata } from "next";

import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import HomeSectorFilter from "../components/HomeSectorFilter";
import MeetingsWithAuth from "@/components/MeetingsWithAuth";

import { getUpcomingMeetings } from "@/lib/actions/meetings";

export const metadata: Metadata = {
  title: "EasyMeet",
  description: "Manage meetings and track attendee participation in NCCG",
};

export default async function Home() {
  let meetings: Awaited<ReturnType<typeof getUpcomingMeetings>> = [];

  try {
    meetings = await getUpcomingMeetings();
  } catch (error) {
    // Surface a warning in server logs but let the page render with an empty list.
    // The client-side ClientMeetings component will retry via the API route.
    console.error("Home: failed to pre-fetch meetings:", error);
    meetings = [];
  }

  // Normalise to the shape MeetingCard / ClientMeetings expects
  const initialMeetings = meetings.map((m) => ({
    ...m,
    onlineMeetingUrl: m.onlineMeetingUrl ?? undefined,
    meetingType: m.meetingType ?? undefined,
  }));

  return (
    <main>
      <HeroSection />
      <StatsSection />

      <section
        id="meetings"
        className="py-16"
        style={{
          background: `url('/background-pattern.svg')`,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0" />

        <div className="container relative z-10">
          {/* Sector dropdown — fires a custom DOM event picked up by ClientMeetings */}
          <HomeSectorFilter />

          {/* Client shell: injects session auth then delegates to ClientMeetings */}
          <MeetingsWithAuth initialMeetings={initialMeetings} />
        </div>
      </section>
    </main>
  );
}
