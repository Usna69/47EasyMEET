// Script to clear all meeting data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearMeetingData() {
  console.log('Starting data cleanup...');

  try {
    // First delete attendees (child records)
    const deletedAttendees = await prisma.attendee.deleteMany({});
    console.log(`Deleted ${deletedAttendees.count} attendees`);

    // Then delete meeting resources (child records)
    const deletedResources = await prisma.meetingResource.deleteMany({});
    console.log(`Deleted ${deletedResources.count} meeting resources`);

    // Finally delete meetings (parent records)
    const deletedMeetings = await prisma.meeting.deleteMany({});
    console.log(`Deleted ${deletedMeetings.count} meetings`);

    console.log('All meeting data cleared successfully!');
  } catch (error) {
    console.error('Error clearing meeting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearMeetingData();
