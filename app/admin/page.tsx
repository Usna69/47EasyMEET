'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../lib/auth';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
  };
}

export default function AdminDashboard() {
  const auth = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Only fetch meetings if user is logged in
    if (auth.isLoggedIn) {
      // Define the fetch function outside the effect to avoid strict mode errors
      const fetchMeetings = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/meetings');
          if (response.ok) {
            const data = await response.json();
            setMeetings(data);
          } else {
            setError('Failed to fetch meetings');
          }
        } catch (err) {
          setError('An error occurred while fetching meetings');
          console.error(err);
        } finally {
        setLoading(false);
        }
      }
      
      fetchMeetings();
    }
  }, [auth.isLoggedIn]);

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        const response = await fetch(`/api/meetings/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the deleted meeting from state
          setMeetings(meetings.filter(meeting => meeting.id !== id));
        } else {
          alert('Failed to delete meeting');
        }
      } catch (err) {
        console.error('Error deleting meeting:', err);
        alert('An error occurred while deleting the meeting');
      }
    }
  };

  // Show authentication message if not logged in
  if (!auth.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Admin Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Link 
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-green-800">Admin Dashboard</h1>
        <Link
          href="/admin/meetings/new"
          className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Create New Meeting
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-green-100">
        <h2 className="text-xl font-semibold mb-4 text-green-800">All Meetings</h2>

        {loading ? (
          <p className="text-center py-4">Loading meetings...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : meetings.length === 0 ? (
          <p className="text-center py-4">No meetings found. Create your first meeting!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Attendees</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting: Meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{meeting.title}</td>
                    <td className="px-4 py-2">{format(new Date(meeting.date), 'PPP')}</td>
                    <td className="px-4 py-2">{meeting.location}</td>
                    <td className="px-4 py-2">{meeting._count?.attendees || 0}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <Link
                        href={`/admin/meetings/${meeting.id}`}
                        className="text-[#014a2f] hover:text-[#014a2f]/80"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/meetings/${meeting.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
