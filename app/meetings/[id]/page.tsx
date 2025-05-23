'use client';

import React from 'react';
import DualColorSpinner from '../../../components/DualColorSpinner';
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
      
      // Add Nairobi County logo centered at the top
      const nairobiLogoPath = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjA0NDAwIDIwNTkwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxTcGFjZT0icHJlc2VydmUiIHZlcnNpb249IjEuMSIgc2hhcGVSZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgdGV4dFJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZVJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsUnVsZT0iZXZlbm9kZCIgY2xpcFJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNGRkRDMDAiIGQ9Ik0xMDIyMDAgMjExMmM1NTY5MSwwIDEwMDgzOCw0NTE0NyAxMDA4MzgsMTAwODM4IDAsNTU2OTEgLTQ1MTQ3LDEwMDgzOCAtMTAwODM4LDEwMDgzOCAtNTU2OTEsMCAtMTAwODM4LC00NTE0NyAtMTAwODM4LC0xMDA4MzggMCwtNTU2OTEgNDUxNDcsLTEwMDgzOCAxMDA4MzgsLTEwMDgzOHptMCA0NTgxYzUzMTYxLDAgOTYyNTcsNDMwOTYgOTYyNTcsOTYyNTcgMCw1MzE2MSAtNDMwOTYsOTYyNTcgLTk2MjU3LDk2MjU3IC01MzE2MSwwIC05NjI1NywtNDMwOTYgLTk2MjU3LC05NjI1NyAwLC01MzE2MSA0MzA5NiwtOTYyNTcgOTYyNTcsLTk2MjU3em0tMTYzNyAxMzM4OTBjLTIyMjU4MywwIDIwMDg1MywwIDAsMHoiLz48Y2lyY2xlIGZpbGw9IndoaXRlIiBjeD0iMTAyOTc3IiBjeT0iMTAyMzc0IiByPSI4NTAzMSIvPjxwYXRoIGZpbGw9IiMwMDQzMUQiIGQ9Ik0xMDIyMDAgNjY5M2M1MzE2MSwwIDk2MjU3LDQzMDk2IDk2MjU3LDk2MjU3IDAsNTMxNjEgLTQzMDk2LDk2MjU3IC05NjI1Nyw5NjI1NyAtNTMxNjEsMCAtOTYyNTcsLTQzMDk2IC05NjI1NywtOTYyNTcgMCwtNTMxNjEgNDMwOTYsLTk2MjU3IDk2MjU3LC05NjI1N3ptNzcxNTAgOTYyNjBjMCwyMjMyMiAtOTQ2Niw0MjQ0NyAtMjQ2MTMsNTY1NDIgLTI1NiwyMzggMzI5MSwyNzY5IDI4NjMsNDQ5OCAtMjUwLDEwMTMgLTYxNSwxMTc0IC00MTAwLDU5MyA3MjEsMjMwMCAxMTg2LDE1NzggMTU1MSw0ODI4IDU1LDQ4MyA1NSwxNDc3IC0zNzAsMTkzNCAtNDA2LDQzNyAtMTIzMywzNTMgLTE0NjEsMTc2IC01ODQ0LC00NTM4IC05NDkwLC0zNDk2IC05ODQ1LC0zMjcyIC0xMTkxMCw3NTI3IC0yNjAyOCwxMTg3NiAtNDExNzUsMTE4NTEgLTE1Nzg3LC0yNyAtMzA0NjQsLTQ3NzYgLTQyNjg2LC0xMjkwNCAtMTg5LC0xMjYgLTMzOSwtMzk1IC01NjUsLTM4MCAtMTA2NzgsNzM1IC0xMTc1OSwtMjE1OSAtMTE0ODgsLTM0MDQgMzksLTE3OCA1MDg2LC0xNzgzIDQ5MzksLTE4OTkgLTM5MCwtMzA3IC0yMDQyLC0xMzY1IC0yNTg4LC0xNzEzIC0xMjE4LC03NzYgLTE0ODksLTg5NCAtMjI0OCwtMTYzNiAtMTcwLC0xNjYgLTM2NywtODA2IC0yNTEsLTEyNzIgMTIzLC00OTcgNTYyLC04MjAgMzg1LC0xMDAxIC0xMzcwOCwtMTM5MjUgLTIyNjcyLC0zMTg5NSAtMjI2NTAsLTUyOTQ0IDEwNCwtMTAxNTAyIDE1NDMwMiwtMTAxNDU1IDE1NDMwMiwzeiIvPjwvc3ZnPg==`;
      
      // No watermark - removed as requested

      // Add the logo centered at the top
      try {
        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Logo dimensions (keeping 1:1 aspect ratio)
        const logoSize = 30; // Size of logo in mm
        const logoX = (pageWidth - logoSize) / 2; // Center horizontally
        const logoY = 10; // Top margin
        
        // Try multiple formats to ensure the logo appears
        try {
          doc.addImage(nairobiLogoPath, 'SVG', logoX, logoY, logoSize, logoSize);
        } catch (svgErr) {
          console.warn('SVG format failed, trying PNG:', svgErr);
          // Convert to PNG format as a fallback
          doc.addImage(nairobiLogoPath, 'PNG', logoX, logoY, logoSize, logoSize);
        }
      } catch (logoErr) {
        console.error('Error adding logo:', logoErr);
        // Continue with the PDF even if logo fails
      }
      
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
          // Simplified signature handling - focus on reliability
          function() {
            try {
              // Check if we have signature data
              if (attendee.signatureData && attendee.signatureData.length > 100) {
                console.log(`Adding signature for ${attendee.name}`);
                // Return a simple object with just the required properties
                return {
                  image: attendee.signatureData,
                  width: 30, // Slightly larger for better visibility
                  height: 15
                };
              } else {
                console.log(`No signature for ${attendee.name}`);
                return ''; // Empty cell if no signature
              }
            } catch (sigErr) {
              console.error('Error rendering signature:', sigErr);
              return '';
            }
          }()
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
              'Nairobi County',
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
              'Nairobi County',
              data.settings.margin.left,
              doc.internal.pageSize.height - 10
            );
          }
        });
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.text(
        'Nairobi County',
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
        <DualColorSpinner size={60} className="mx-auto mb-4" />
        <p className="text-gray-600">Loading meeting details...</p>
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
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100" style={{ minHeight: "580px" }}>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-semibold text-[#014a2f]">{meeting.title}</h1>
              {meeting.meetingId && (
                <span className="bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                  {meeting.meetingId}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{meeting.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                <p className="text-gray-800">{format(new Date(meeting.date), 'PPP p')}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-800">{meeting.location}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting Type</h3>
                <p className="text-gray-800 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${meeting.meetingType === 'ONLINE' ? 'bg-blue-500' : meeting.meetingType === 'HYBRID' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                  {meeting.meetingType === 'ONLINE' ? 'Online Meeting' : meeting.meetingType === 'HYBRID' ? 'Hybrid Meeting' : 'Physical Meeting'}
                </p>
              </div>
              
              {/* Display online meeting link for online and hybrid meetings - matching admin style */}
              {((meeting.meetingType === "ONLINE" || meeting.meetingType === "HYBRID") && meeting.onlineMeetingUrl) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting URL</h3>
                  {new Date() >= new Date(meeting.date) ? (
                    <a 
                      href={meeting.onlineMeetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {meeting.onlineMeetingUrl}
                    </a>
                  ) : (
                    <p className="text-gray-500 italic">Link will be available when the meeting starts</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Attendees</h3>
                <p className="text-gray-800">{meeting._count?.attendees || meeting.attendees.length}</p>
              </div>
              {meeting.sector && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Sector</h3>
                  <p className="text-gray-800">{meeting.sector}</p>
                </div>
              )}
              {meeting.meetingCategory && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting Category</h3>
                  <p className="text-gray-800">
                    {meeting.meetingCategory === 'INTERNAL' ? 'Internal' : 
                     meeting.meetingCategory === 'EXTERNAL' ? 'External' : 
                     meeting.meetingCategory === 'STAKEHOLDER' ? 'Stakeholder' : 
                     meeting.meetingCategory}
                  </p>
                </div>
              )}
              {meeting.creatorEmail && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created By</h3>
                  <p className="text-gray-800">{meeting.creatorEmail}</p>
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
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100" style={{ minHeight: "580px", display: "flex", flexDirection: "column" }}>
            <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">Meeting QR Code</h2>
            <p className="text-gray-600 mb-4">Scan this QR code to register for the meeting</p>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meetings/${meeting.id}/register`} />
            </div>
            <div className="text-center space-y-3">
              {/* Check if meeting has started, hasn't completely ended, and registration period hasn't ended yet */}
              {(() => {
                  const now = new Date();
                  const meetingStartTime = new Date(meeting.date);
                  const registrationEndTime = meeting.registrationEnd 
                    ? new Date(meeting.registrationEnd) 
                    : new Date(meetingStartTime.getTime() + 2 * 60 * 60 * 1000);
                  
                  // Check if meeting is more than a day old (considered ended)
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const isMeetingEnded = meetingStartTime < yesterday;
                  
                  const isRegistrationAllowed = now >= meetingStartTime && 
                         now <= registrationEndTime && 
                         !isMeetingEnded;
                  
                  if (isRegistrationAllowed) {
                    return (
                      <Link 
                        href={`/meetings/${meeting.id}/register`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block w-full"
                      >
                        Register for this Meeting
                      </Link>
                    );
                  } else {
                    let statusMessage = "";
                    
                    if (meetingStartTime < yesterday) {
                      statusMessage = "Meeting has ended";
                    } else if (now < meetingStartTime) {
                      statusMessage = "Registration opens when meeting starts";
                    } else {
                      statusMessage = "Registration period has ended";
                    }
                    
                    return (
                      <div 
                        className="bg-gray-300 text-gray-600 px-6 py-3 rounded-md font-medium inline-block w-full cursor-not-allowed"
                      >
                        {statusMessage}
                      </div>
                    );
                  }
              })()}
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
                Download ATTENDANCE FORM
              </button>
            </div>
          </div>
          
          {/* Resources Section */}
          {meeting && meeting.resources && meeting.resources.length > 0 && (
            <div className="my-8">
              <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#014a2f] to-[#016a3f] px-6 py-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">Meeting Resources</h2>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-4">Download the following resources for this meeting:</p>
                  
                  <div className="space-y-4">
                    {meeting.resources.map((resource: any) => (
                      <div
                        key={resource.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center">
                          {/* File icon based on type */}
                          <div className="mr-4 bg-[#014a2f]/10 p-3 rounded-md">
                            {resource.fileType.includes('pdf') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#014a2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : resource.fileType.includes('image') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#014a2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : resource.fileType.includes('word') || resource.fileType.includes('doc') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#014a2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : resource.fileType.includes('excel') || resource.fileType.includes('sheet') || resource.fileType.includes('csv') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#014a2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#014a2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* File name and type */}
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">{resource.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {resource.fileType.replace('application/', '').toUpperCase()} 
                              {resource.fileSize && <span>({(resource.fileSize / 1024).toFixed(1)} KB)</span>}
                            </p>
                          </div>
                        </div>
                        
                        {/* Download button */}
                        <a 
                          href={resource.fileUrl ? resource.fileUrl : `/api/resources/${resource.id}`} 
                          download={resource.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-[#014a2f] rounded-md hover:bg-[#014a2f]/90 transition-colors shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download all button if multiple resources */}
                  {meeting.resources.length > 1 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Need all materials? Download each file individually using the buttons above.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
