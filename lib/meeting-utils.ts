// Meeting-related utilities

export type MeetingStatus = 'UPCOMING' | 'ONGOING' | 'CLOSED';

export interface MeetingWithStatus {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
  [key: string]: any;
}

// Calculate meeting status based on date
export const calculateMeetingStatus = (meetingDate: string | Date): MeetingStatus => {
  const date = typeof meetingDate === 'string' ? new Date(meetingDate) : meetingDate;
  const now = new Date();
  const twoHoursAfterStart = new Date(date.getTime() + (2 * 60 * 60 * 1000));

  if (date > now) {
    return 'UPCOMING';
  } else if (now <= twoHoursAfterStart) {
    return 'ONGOING';
  } else {
    return 'CLOSED';
  }
};

// Add status to meetings array
export const addStatusToMeetings = (meetings: any[]): MeetingWithStatus[] => {
  return meetings.map(meeting => ({
    ...meeting,
    status: calculateMeetingStatus(meeting.date)
  }));
};

// Check if meeting registration is open
export const isRegistrationOpen = (meetingDate: string | Date): boolean => {
  return calculateMeetingStatus(meetingDate) === 'ONGOING';
};

// Check if meeting has ended (more than 2 hours after start)
export const hasMeetingEnded = (meetingDate: string | Date): boolean => {
  const date = typeof meetingDate === 'string' ? new Date(meetingDate) : meetingDate;
  const now = new Date();
  const twoHoursAfterStart = new Date(date.getTime() + (2 * 60 * 60 * 1000));
  
  return now > twoHoursAfterStart;
};

// Get meeting date range for filtering
export const getMeetingDateRange = (filterType: 'upcoming' | 'ongoing' | 'past') => {
  const now = new Date();
  
  switch (filterType) {
    case 'upcoming':
      return {
        gte: now.toISOString()
      };
    case 'ongoing':
      // For ongoing meetings: meetings that have started (in the past) but are still within 2 hours of start time
      // This means the meeting date is in the past, but not more than 2 hours ago
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      return {
        gte: twoHoursAgo.toISOString(),
        lt: now.toISOString()
      };
    case 'past':
      // Past meetings: meetings that started more than 2 hours ago
      const twoHoursAgoForPast = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      return {
        lt: twoHoursAgoForPast.toISOString()
      };
    default:
      return {};
  }
};

// Generate meeting ID
export const generateMeetingId = (
  sector: string,
  meetingCategory: string,
  date: Date
): string => {
  // Format date as DDMMYYYY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const datePart = `${day}${month}${year}`;

  // Format time as HHMM in 24-hour format
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const timePart = `${hours}${minutes}`;

  // Create meeting ID in format: 047/SECTOR_CODE/MEETING_TYPE/DDMMYYYY-HHMM
  const meetingTypeCode =
    meetingCategory === "INTERNAL"
      ? "INT"
      : meetingCategory === "EXTERNAL"
      ? "DPT"
      : meetingCategory === "STAKEHOLDER"
      ? "STK"
      : "INT";

  return `047/${sector}/${meetingTypeCode}/${datePart}-${timePart}`;
};

// Validate meeting data
export const validateMeetingData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Meeting title is required');
  }
  
  if (!data.date) {
    errors.push('Meeting date is required');
  } else if (new Date(data.date) < new Date()) {
    errors.push('Meeting date cannot be in the past');
  }
  
  if (!data.location?.trim()) {
    errors.push('Meeting location is required');
  }
  
  if (!data.sector) {
    errors.push('Sector is required');
  }
  
  if (!data.meetingCategory) {
    errors.push('Meeting category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format meeting for display
export const formatMeetingForDisplay = (meeting: any) => {
  const date = new Date(meeting.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return {
    ...meeting,
    status: calculateMeetingStatus(meeting.date),
    formattedDate: `${day}-${month}-${year}`,
    formattedTime: new Date(meeting.date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

// Check if user can edit meeting
export const canUserEditMeeting = (
  meeting: any,
  userEmail: string,
  userRole: string
): boolean => {
  // Admins can edit any meeting
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Users can only edit their own meetings
  return meeting.creatorEmail === userEmail;
};

// Get meeting statistics
export const getMeetingStats = (meetings: any[]) => {
  const now = new Date();
  
  return {
    total: meetings.length,
    upcoming: meetings.filter(m => calculateMeetingStatus(m.date) === 'UPCOMING').length,
    ongoing: meetings.filter(m => calculateMeetingStatus(m.date) === 'ONGOING').length,
    closed: meetings.filter(m => calculateMeetingStatus(m.date) === 'CLOSED').length
  };
}; 