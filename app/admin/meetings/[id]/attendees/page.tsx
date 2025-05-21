'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../../../../lib/auth';

// We'll use direct imports within the function for better reliability

interface Attendee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  organization: string;
  createdAt: string;
  updatedAt: string;
}

interface Meeting {
  id: string;
  title: string;
  meetingId?: string;
}

export default function AdminAttendeesList({ params }: { params: { id: string } }) {
  const { id } = params;
  const auth = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to generate and download PDF using client-side import
  const generatePDF = async () => {
    if (!meeting || !attendees.length) return;
    
    try {
      // Dynamically import jsPDF only when the function is called
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Import autoTable only when needed
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add header with meeting information
      doc.setFontSize(18);
      doc.setTextColor(1, 74, 47); // #014a2f
      doc.text('EasyMEET - Attendance Form', 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Meeting: ${meeting.title}`, 14, 30);
      doc.text(`Date: ${format(new Date(), 'PPP')}`, 14, 36);
      doc.text(`Total Attendees: ${attendees.length}`, 14, 42);
      if (meeting.meetingId) {
        doc.text(`Meeting ID: ${meeting.meetingId}`, 14, 48);
      }
      
      // Create table with attendees
      const tableColumn = ['Name', 'Email', 'Phone', 'Organization', 'Designation'];
      const tableRows = attendees.map((attendee: Attendee) => [
        attendee.name,
        attendee.email,
        attendee.phoneNumber || 'N/A',
        attendee.organization || 'N/A',
        attendee.designation || 'N/A'
      ]);
      
      // Add signature column to the table
      tableColumn.push('Signature');
      tableRows.forEach((row: any[]) => row.push(''));
      
      // Generate the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [1, 74, 47] }, // #014a2f
        didDrawPage: function(data: any) {
          // Footer
          doc.setFontSize(10);
          doc.text(
            'Nairobi County Meeting Attendance System',
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });
      
      // Save the PDF
      doc.save(`attendance-${meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  useEffect(() => {
    if (auth.isLoggedIn) {
      const fetchAttendees = async () => {
        try {
          setLoading(true);
          
          // First fetch the meeting details
          const meetingResponse = await fetch(`/api/meetings/${id}`);
          if (!meetingResponse.ok) {
            throw new Error('Failed to fetch meeting details');
          }
          const meetingData = await meetingResponse.json();
          setMeeting(meetingData);
          
          // Then fetch the attendees
          const attendeesResponse = await fetch(`/api/meetings/${id}/attendees`);
          if (attendeesResponse.ok) {
            const data = await attendeesResponse.json();
            setAttendees(data);
          } else {
            throw new Error('Failed to fetch attendees');
          }
        } catch (err) {
          console.error('Error:', err);
          setError(err instanceof Error ? err.message : 'An error occurred while fetching attendees');
        } finally {
          setLoading(false);
        }
      };

      fetchAttendees();
    }
  }, [id, auth.isLoggedIn]);

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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading attendees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link 
            href="/admin"
            className="mt-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/admin/meetings/${id}`} className="text-gray-700 hover:text-gray-900 flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Meeting Details
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#014a2f]">Attendees</h1>
            {meeting && (
              <p className="text-gray-600 mt-1">
                Meeting: <span className="font-medium">{meeting.title}</span>
                {meeting.meetingId && (
                  <span className="ml-2 bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2 py-0.5 rounded">
                    {meeting.meetingId}
                  </span>
                )}
              </p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => window.print()}
              className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors mr-2"
            >
              Print List
            </button>
            <button
              onClick={() => {
                try {
                  generatePDF();
                } catch (err) {
                  console.error('Error calling generatePDF:', err);
                  alert('Failed to generate PDF. Please try again.');
                }
              }}
              className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors mr-2"
            >
              Download PDF Form
            </button>
            <Link
              href={`/api/meetings/${id}/attendees/export`}
              className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md font-medium transition-colors"
            >
              Export CSV
            </Link>
          </div>
        </div>

        {attendees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No attendees have registered for this meeting yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{attendee.name}</td>
                    <td className="px-4 py-3">{attendee.email}</td>
                    <td className="px-4 py-3">{attendee.phoneNumber || 'N/A'}</td>
                    <td className="px-4 py-3">{attendee.organization || 'N/A'}</td>
                    <td className="px-4 py-3">{attendee.designation || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {attendee.createdAt ? format(new Date(attendee.createdAt), 'PPp') : 'N/A'}
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
