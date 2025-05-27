'use client';

import React, { useState, useEffect } from 'react';

export default function AttendeeManager({ meetingId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    
    const fetchAttendees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/meetings/${meetingId}/attendees`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch attendees: ${response.status}`);
        }
        
        const data = await response.json();
        setAttendees(data);
      } catch (error) {
        console.error('Error fetching attendees:', error);
        setError('Could not load attendees');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendees();
  }, [meetingId]);

  const handleDeleteClick = (attendeeId) => {
    setDeleteConfirm(attendeeId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const confirmDelete = async (attendeeId) => {
    if (!attendeeId || !meetingId) return;
    
    try {
      setDeleting(true);
      
      // Get auth token from session storage (this should be adapted to your auth system)
      const authState = sessionStorage.getItem('authState');
      let authToken = '';
      
      if (authState) {
        try {
          const parsedState = JSON.parse(authState);
          if (parsedState.isLoggedIn) {
            // In a real app, you'd have a proper JWT token here
            authToken = `Bearer ${parsedState.username}`;
          }
        } catch (e) {
          console.error('Error parsing auth state:', e);
        }
      }
      
      const response = await fetch(`/api/attendees?id=${attendeeId}&meetingId=${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete attendee');
      }
      
      // Remove the deleted attendee from the list
      setAttendees(attendees.filter(a => a.id !== attendeeId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting attendee:', error);
      setError(error.message || 'Failed to delete attendee');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#014a2f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-3">Manage Attendees</h3>
      
      {attendees.length === 0 ? (
        <p className="text-sm text-gray-500">No attendees registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{attendee.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{attendee.designation}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{attendee.organization || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{attendee.phoneNumber || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{attendee.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {deleteConfirm === attendee.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => confirmDelete(attendee.id)}
                          disabled={deleting}
                          className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-md text-xs px-2 py-1 disabled:bg-gray-300"
                        >
                          {deleting ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={cancelDelete}
                          disabled={deleting}
                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium rounded-md text-xs px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(attendee.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
