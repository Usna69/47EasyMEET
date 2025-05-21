'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import QRCodeDisplay from '../../../components/QRCodeDisplay';
import { format } from 'date-fns';

// We won't use dynamic imports for jsPDF to ensure it's available immediately when needed

interface MeetingDetailsParams {
  params: {
    id: string;
  };
}

export default function MeetingDetails({ params }: MeetingDetailsParams) {
  const [meeting, setMeeting] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Function to generate and download PDF using client-side import
  const generatePDF = async () => {
    if (!meeting) return;
    
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
      doc.text(`Date: ${format(new Date(meeting.date), 'PPP')}`, 14, 36);
      doc.text(`Location: ${meeting.location}`, 14, 42);
      doc.text(`Total Attendees: ${meeting._count?.attendees || meeting.attendees.length}`, 14, 48);
      if (meeting.meetingId) {
        doc.text(`Meeting ID: ${meeting.meetingId}`, 14, 54);
      }
      
      // Create table with attendees if there are any
      if (meeting.attendees && meeting.attendees.length > 0) {
        // Create table with attendees
        const tableColumn = ['Name', 'Email', 'Phone', 'Organization', 'Designation', 'Signature'];
        const tableRows = meeting.attendees.map((attendee: any) => [
          attendee.name,
          attendee.email,
          attendee.phoneNumber || 'N/A',
          attendee.organization || 'N/A',
          attendee.designation || 'N/A',
          '' // Empty signature column
        ]);
        
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
      } else {
        // If no attendees, add empty rows for signature
        doc.text('Attendee Registration', 14, 65);
        doc.line(14, 67, 196, 67); // Horizontal line
        
        // Create table with empty rows
        const tableColumn = ['Name', 'Email', 'Phone', 'Organization', 'Designation', 'Signature'];
        const tableRows = [];
        
        // Add 10 empty rows
        for (let i = 0; i < 10; i++) {
          tableRows.push(['', '', '', '', '', '']);
        }
        
        // Generate the table
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 70,
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
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.text(
        'Nairobi County Meeting Attendance System',
        14,
        doc.internal.pageSize.height - 10
      );
      
      // Save the PDF
      doc.save(`attendance-${meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  React.useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/meetings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setMeeting(data);
        } else {
          setError('Failed to fetch meeting details');
        }
      } catch (err) {
        setError('An error occurred while fetching meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading meeting details...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">{error || 'Meeting not found'}</p>
        <Link href="/" className="mt-4 inline-block bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-4 py-2 rounded-md">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!meeting) {
    notFound();
  }

  return (
    <div className="py-8" style={{ 
        background: `url('/background-pattern.svg')`,
        backgroundSize: 'cover',
        position: 'relative',
      }}>
      <div className="absolute inset-0 bg-white bg-opacity-60 z-0"></div>
      <div className="container relative z-10">
      <div className="mb-6">
        <Link href="/" className="text-gray-800 hover:text-[#014a2f] flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to All Meetings
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-semibold text-[#014a2f]">{meeting.title}</h1>
              {meeting.meetingId && (
                <span className="bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                  {meeting.meetingId}
                </span>
              )}
            </div>
            <p className="text-gray-700 mb-6">{meeting.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-lg">{new Date(meeting.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="text-lg">{new Date(meeting.date).toLocaleTimeString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-lg">{meeting.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Attendees</h3>
                <p className="text-lg">{meeting._count?.attendees || meeting.attendees.length}</p>
              </div>
              {meeting.sector && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sector</h3>
                  <p className="text-lg">{meeting.sector}</p>
                </div>
              )}
              {meeting.creatorType && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Meeting Category</h3>
                  <p className="text-lg">{meeting.creatorType}</p>
                </div>
              )}
              {meeting.creatorEmail && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                  <p className="text-lg">{meeting.creatorEmail}</p>
                </div>
              )}
            </div>
          </div>

          {meeting.attendees.length > 0 && (
            <div className="card mt-8">
              <h2 className="text-xl font-semibold mb-4">Attendees</h2>
              <ul className="attendee-list">
                {meeting.attendees.map((attendee: any) => (
                  <li key={attendee.id} className="attendee-item">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{attendee.name}</h3>
                        <p className="text-gray-600">{attendee.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">{attendee.designation}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">Meeting QR Code</h2>
            <p className="text-gray-600 mb-4">Scan this QR code to register for the meeting</p>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meetings/${meeting.id}/register`} />
            </div>
            <div className="text-center space-y-3">
              <Link 
                href={`/meetings/${meeting.id}/register`}
                className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block w-full"
              >
                Register for this Meeting
              </Link>
              <button
                onClick={() => {
                  try {
                    generatePDF();
                  } catch (err) {
                    console.error('Error calling generatePDF:', err);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block w-full"
              >
                Download Attendance Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
