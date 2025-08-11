"use client";

import React from "react";
import DualColorSpinner from "../../../components/DualColorSpinner";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import QRCodeDisplay from "../../../components/QRCodeDisplay";
import { format } from "date-fns";
import { getSectorName } from "../../../utils/sectorUtils";
import ResourceDownload from "../../../components/ResourceDownload";
import { useSessionAuth } from "@/lib/session-auth";

// Define types for better type safety
interface Attendee {
  id: string;
  name: string;
  email: string;
  designation?: string;
  organization?: string;
  signatureData?: string;
  phoneNumber?: string;
}

interface Resource {
  id: string;
  fileName: string;
  name: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  sector?: string;
  onlineMeetingUrl?: string;
  meetingId?: string;
  meetingCategory?: string;
  creatorEmail?: string;
  customLetterhead?: string;
  registrationEnd?: string;
  attendees: Attendee[];
  resources?: Resource[];
  _count?: {
    attendees: number;
  };
}

export default function MeetingDetails() {
  const params = useParams();
  const id = params.id as string;
  const auth = useSessionAuth();
  const [meeting, setMeeting] = React.useState<Meeting | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [pdfGenerating, setPdfGenerating] = React.useState(false);

  // Determine the appropriate back link based on user context
  const getBackLink = () => {
    if (!auth.user) return "/#meetings";
    
    if (auth.user.role === "VIEW_ONLY") {
      return "/view-only#meetings";
    } else if (auth.user.userLevel && auth.user.userLevel !== "REGULAR") {
      return "/high-level#meetings";
    } else if (auth.user.role === "ADMIN") {
      return "/admin/meetings";
    } else {
      return "/#meetings";
    }
  };

  // Function to generate PDF with jsPDF
  const generatePDF = async () => {
    if (!meeting) return;

    try {
      // Show loading indicator
      setPdfGenerating(true);

      // Dynamically import jsPDF to ensure it's only loaded when needed
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;

      // Import autoTable
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      // Create a new document - A4 size in portrait
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Check if meeting has a custom letterhead
      const letterheadPath = meeting.customLetterhead;
      console.log('PDF: meeting.customLetterhead:', letterheadPath);
      
      // Only use custom letterhead if available
      if (letterheadPath && letterheadPath.trim() !== "") {
        const letterheadUrl = letterheadPath.startsWith('http') 
          ? letterheadPath 
          : `/api/letterhead-image?path=${encodeURIComponent(letterheadPath)}`;
        
        try {
          console.log('PDF: Fetching letterhead image from:', letterheadUrl);
          // Fetch the image and convert to blob
          const response = await fetch(letterheadUrl);
          console.log('PDF: Fetch response status:', response.status);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch letterhead image: ${response.status}`
            );
          }

          const blob = await response.blob();

          // Convert blob to data URL
          const reader = new FileReader();
          const imageDataPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const imageData = await imageDataPromise;

          // Add the letterhead as background for the entire page
          doc.addImage(
            imageData,
            "JPEG", // format
            0, // x position
            0, // y position
            pageWidth, // width - full page width
            pageHeight // height - full page height
          );
        } catch (imgError) {
          console.error("Error adding letterhead image:", imgError);
        }
      }

      // Create a white background for the content area positioned higher on the page
      // This will ensure text is readable on top of the letterhead image
      const contentStartY = pageHeight * 0.22; // Start content area at 22% from the top (moved even higher)
      const contentHeight = pageHeight * 0.58; // Content area takes up 58% of the page height
      const contentMargin = pageWidth * 0.1; // 10% margin on both sides

      // Add semi-transparent white rectangle for better text readability
      doc.setFillColor(255, 255, 255); // Pure white
      doc.rect(
        contentMargin,
        contentStartY,
        pageWidth - contentMargin * 2,
        contentHeight,
        "F"
      );

      // No border around content area

      // Add title centered and in all caps at the top of the content area
      const titleY = contentStartY + 6; // 6mm from the top of content area (reduced from 10mm)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14); // Slightly smaller title
      doc.setTextColor(1, 74, 47); // Green text for title (#014a2f)
      doc.text("MEETING ATTENDANCE FORM", pageWidth / 2, titleY, {
        align: "center",
      }); // Centered and all caps

      // Add meeting details in a compact, left-aligned format with dark gray text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(89, 89, 89); // Dark gray text (#595959)

      const detailsY = titleY + 5; // Further reduced spacing between title and details
      const detailsX = contentMargin + 2; // Align with title, closer to left margin

      // Meeting details as a simple table with better formatting
      // First extract the data we need to display
      const meetingTitle = meeting.title || "Untitled Meeting";
      const meetingDate = format(new Date(meeting.date), "PPPP"); // Full date format
      const meetingLocation = meeting.location || "No location specified";
      const attendeeCount = (
        meeting._count?.attendees || meeting.attendees.length
      ).toString();
      const meetingId = meeting.meetingId || "N/A";

      // Meeting details as a simple table with clear formatting
      const meetingDetails = [
        ["Meeting:", meetingTitle],
        ["Date:", meetingDate],
        ["Location:", meetingLocation],
        ["Attendees:", attendeeCount],
        ["Meeting ID:", meetingId],
      ];

      // Elegant meeting details styling with green text
      doc.setDrawColor(220, 220, 220); // Light gray for borders

      // Add meeting details table with compact, elegant styling
      autoTable(doc, {
        startY: detailsY,
        head: [],
        body: meetingDetails,
        theme: "plain",
        styles: {
          cellPadding: 1.5, // Even further reduced padding
          fontSize: 9, // Smaller font size
          overflow: "linebreak",
          textColor: [89, 89, 89], // Dark gray text (#595959)
          minCellHeight: 4, // Even smaller row height
        },
        columnStyles: {
          0: {
            cellWidth: 40, // Narrower label column
            fontStyle: "bold",
            textColor: [89, 89, 89], // Dark gray text for labels (#595959)
            fontSize: 9, // Consistent size
          },
          1: {
            cellWidth: "auto",
            fontStyle: "normal",
            fontSize: 9, // Consistent size
            textColor: [89, 89, 89], // Dark gray text (#595959)
          },
        },
        margin: { left: detailsX, right: detailsX },
        // No cell border drawing
      });

      // Get the Y position after the details table
      const finalY = (doc as any).lastAutoTable.finalY + 1; // Minimal spacing

      // Removed the 'Attendee List' heading as requested

      // Add attendees table with signatures - FIXED: Correct column headers and data mapping
      const tableHeaders = [
        [
          "Name",
          "Email",
          "Contact",
          ...(meeting.meetingCategory !== "INTERNAL" ? ["Organization"] : []),
          "Designation",
          "Signature",
        ],
      ];

      const tableRows = meeting.attendees.map((attendee: Attendee) => {
        const row = [
          attendee.name || "N/A",
          attendee.email || "N/A",
          attendee.phoneNumber || "N/A",
          ...(meeting.meetingCategory !== "INTERNAL"
            ? [attendee.organization || "N/A"]
            : []),
          attendee.designation || "N/A",
          attendee.signatureData ? "Signed" : "—", // Placeholder for signature
        ];
        return row;
      });

      // Add attendees table with improved styling and minimal spacing
      autoTable(doc, {
        startY: finalY + 1, // Almost no spacing
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [1, 74, 47], // #014a2f Green header background
          textColor: 255, // White text for headers
          fontSize: 8, // Smaller header text
          fontStyle: "bold",
          halign: "left",
          valign: "middle",
          cellPadding: 2, // Less padding
        },
        styles: {
          cellPadding: 1.5, // Minimal padding
          fontSize: 8, // Smaller text
          overflow: "linebreak",
          lineWidth: 0.1, // Even thinner grid lines
          lineColor: [220, 220, 220], // Light gray grid lines
          textColor: [89, 89, 89], // Dark gray text for all cells (#595959)
        },
        columnStyles: {
          0: { fontStyle: "bold" }, // Bold names
          [meeting.meetingCategory !== "INTERNAL" ? 4 : 3]: {
            halign: "center",
          }, // Center signatures column (adjust index based on whether organization column exists)
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248], // Light gray for alternate rows
        },
        margin: { left: contentMargin, right: contentMargin },
      });

      // Position certification near the bottom of the page but not too far down
      const certY = pageHeight - 45; // 45mm from bottom of page (moved up slightly)

      // Add certification text
      doc.setFontSize(9); // Smaller font
      doc.setTextColor(89, 89, 89); // Dark gray text for certification (#595959)
      doc.text(
        "I certify that this is an accurate record of attendance for the above meeting.",
        pageWidth / 2,
        certY,
        { align: "center" }
      );

      // Add signature lines
      const signLineY = certY + 12; // Slightly closer to certification text
      const signWidth = 70;

      // Secretary signature line
      doc.setLineWidth(0.5);
      doc.line(25, signLineY, 25 + signWidth, signLineY);
      doc.setFontSize(8); // Smaller font
      doc.text("Meeting Secretary", 25 + signWidth / 2, signLineY + 5, {
        align: "center",
      });

      // Chairperson signature line
      doc.line(
        pageWidth - 25 - signWidth,
        signLineY,
        pageWidth - 25,
        signLineY
      );
      doc.text("Chairperson", pageWidth - 25 - signWidth / 2, signLineY + 5, {
        align: "center",
      });

      // Save the PDF with a meaningful filename
      const filename = `${meeting.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-attendance.pdf`;
      doc.save(filename);

      // Hide loading indicator
      setPdfGenerating(false);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
      setPdfGenerating(false);
    }
  };

  // Fetch meeting data
  const fetchMeeting = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meetings/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`Failed to fetch meeting: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Meeting data:", data);
      console.log("Meeting resources:", data.resources);
      setMeeting(data);
    } catch (err) {
      console.error("Error fetching meeting:", err);
      setError("Failed to load meeting details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load meeting data on mount
  React.useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DualColorSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchMeeting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No meeting found
  if (!meeting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Meeting not found.</p>
          <Link href="/meetings" className="text-blue-500 hover:underline">
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div
      className="py-8"
      style={{
        background: `url('/background-pattern.svg')`,
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href={getBackLink()}
            className="text-[#014a2f] hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to {auth.user?.role === "VIEW_ONLY" ? "Portal" : auth.user?.userLevel && auth.user.userLevel !== "REGULAR" ? "High-Level Portal" : "Upcoming Meetings"}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#014a2f]">
                  {meeting.title}
                </h1>
                {meeting.meetingId && (
                  <span className="bg-yellow-100 text-[#014a2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                    {meeting.meetingId}
                  </span>
                )}
              </div>

              {meeting.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-[#014a2f]">
                    Description
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {meeting.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {meeting.sector && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Sector
                    </h3>
                    <p className="text-gray-800">
                      {getSectorName(meeting.sector)}
                      <span className="text-xs text-gray-500 ml-2">
                        ({meeting.sector})
                      </span>
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Date & Time
                  </h3>
                  <p className="text-gray-800">
                    {format(new Date(meeting.date), "PPP p")}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Location
                  </h3>
                  <p className="text-gray-800">{meeting.location}</p>
                </div>

                {meeting.onlineMeetingUrl && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Meeting Link
                    </h3>
                    <p className="text-gray-800 truncate">
                      <a
                        href={meeting.onlineMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {meeting.onlineMeetingUrl}
                      </a>
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Attendees
                  </h3>
                  <p className="text-gray-800">
                    {meeting._count?.attendees || meeting.attendees.length}
                  </p>
                </div>

                {meeting.meetingCategory && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Meeting Category
                    </h3>
                    <p className="text-gray-800">
                      {meeting.meetingCategory === "INTERNAL"
                        ? "Internal"
                        : meeting.meetingCategory === "EXTERNAL"
                        ? "External"
                        : meeting.meetingCategory === "STAKEHOLDER"
                        ? "Stakeholder"
                        : meeting.meetingCategory}
                    </p>
                  </div>
                )}

                {meeting.creatorEmail && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Created By
                    </h3>
                    <p className="text-gray-800">{meeting.creatorEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {meeting.attendees.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
                  Attendees
                </h2>
                <ul className="divide-y divide-gray-200">
                  {meeting.attendees.map((attendee: Attendee) => (
                    <li key={attendee.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{attendee.name}</h3>
                          <p className="text-gray-600">{attendee.email}</p>
                          {attendee.organization && (
                            <p className="text-gray-500 text-sm">
                              {attendee.organization}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {attendee.designation}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div
              className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
                Meeting QR Code
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Scan this QR code to register for the meeting
              </p>
              <div className="flex justify-center mb-4">
                {/* More flexible QR code that automatically handles URL conversion */}
                <QRCodeDisplay
                  url={`/meetings/${meeting.id}/register`}
                  size={180}
                />
              </div>
              <div className="text-center space-y-3 mt-auto">
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

                  const isRegistrationAllowed =
                    now >= meetingStartTime &&
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
                      <div className="bg-gray-300 text-gray-600 px-6 py-3 rounded-md font-medium inline-block w-full cursor-not-allowed">
                        {statusMessage}
                      </div>
                    );
                  }
                })()}

                <button
                  onClick={generatePDF}
                  className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block w-full"
                  disabled={pdfGenerating}
                >
                  {pdfGenerating
                    ? "Generating PDF..."
                    : "Generate PDF with Letterhead"}
                </button>
              </div>
            </div>

            {/* Meeting Resources Section */}
            {meeting.resources && meeting.resources.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
                  Meeting Resources
                </h2>
                <ul className="divide-y divide-gray-200">
                  {meeting.resources.map((resource: Resource) => (
                    <li key={resource.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{resource.fileName}</h3>
                        </div>
                        <div>
                          <ResourceDownload
                            fileName={resource.name}
                            resourceId={resource.id}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
