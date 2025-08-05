'use client';

import React from 'react';
import { useSessionAuth } from '@/lib/session-auth';
import ClientMeetings from './ClientMeetings';

interface MeetingsWithAuthProps {
  initialMeetings: any[];
}

export default function MeetingsWithAuth({ initialMeetings }: MeetingsWithAuthProps) {
  const auth = useSessionAuth();

  return (
    <ClientMeetings 
      initialMeetings={initialMeetings}
      userEmail={auth.user?.email}
      userLevel={auth.user?.userLevel}
    />
  );
} 