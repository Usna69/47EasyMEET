import MeetingCard from "../components/MeetingCard";
import { prisma } from "../lib/prisma";
import React from "react";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import { getSectorName } from "../utils/sectorUtils";
import HomeSectorFilter from "../components/HomeSectorFilter";
import ClientMeetings from "@/components/ClientMeetings";
import { Metadata } from "next";

export default async function Home() {
  let dbMeetings: any[] = [];
  
  try {
    // Get only upcoming meetings for initial render
    const now = new Date();
    dbMeetings = await prisma.meeting.findMany({
      where: {
        date: {
          gte: now.toISOString()
        }
      },
      orderBy: {
        date: "asc", // Show nearest upcoming meetings first
      },
      include: {
        _count: {
          select: {
            attendees: true,
            resources: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    // Return empty array if database connection fails
    dbMeetings = [];
  }

  // Transform database meetings to the expected format for MeetingCard
  const meetings = dbMeetings.map((meeting) => ({
    ...meeting,
    onlineMeetingUrl: meeting.onlineMeetingUrl || undefined,
    meetingType: meeting.meetingType || undefined,
    _count: meeting._count,
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
        <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
        <div className="container relative z-10">
          {/* Add sector filter component */}
          <HomeSectorFilter />

          {/* Client-side meetings list with filtering */}
          <ClientMeetings initialMeetings={meetings} />
        </div>
      </section>
    </main>
  );
}
