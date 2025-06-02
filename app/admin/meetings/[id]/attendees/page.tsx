"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "../../../../../lib/auth";
import { useParams } from "next/navigation";
import { getSectorLetterhead } from "../../../../../lib/docx-to-pdf";
import { getSectorName } from "../../../../../utils/sectorUtils";

const { useState, useEffect } = React;

interface Attendee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  organization: string;
  signatureData?: string;
  createdAt: string;
  updatedAt: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  sector?: string;
  meetingId?: string;
  meetingCategory?: string;
  creatorEmail?: string;
  attendees?: Attendee[];
  _count?: {
    attendees: number;
  };
}

export default function AdminAttendeesList() {
  const params = useParams();
  const id = params.id as string;
  const auth = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Function to generate and download PDF using client-side import
  const generatePDF = async () => {
    if (!meeting || !attendees.length) return;

    try {
      setPdfGenerating(true);

      // Dynamically import jsPDF
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;

      // Import autoTable
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      // Create a new document - A4 size in portrait
      const doc = new jsPDF("portrait", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Check if sector has a custom letterhead
      const sectorLetterhead = await getSectorLetterhead(meeting.sector || "");

      // Get the letterhead image if available
      if (
        sectorLetterhead.hasLetterhead &&
        (meeting.sector === "OG" || meeting.sector === "DMC") &&
        sectorLetterhead.headerImageData
      ) {
        try {
          // Fetch the image and convert to blob
          const response = await fetch(sectorLetterhead.headerImageData);
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
          doc.addImage(imageData, "JPEG", 0, 0, pageWidth, pageHeight);
        } catch (imgError) {
          console.error("Error adding letterhead image:", imgError);
        }
      }

      // Create a white background for the content area positioned higher on the page
      const contentStartY = pageHeight * 0.22;
      const contentHeight = pageHeight * 0.58;
      const contentMargin = pageWidth * 0.1;

      // Add semi-transparent white rectangle for better text readability
      doc.setFillColor(255, 255, 255);
      doc.rect(
        contentMargin,
        contentStartY,
        pageWidth - contentMargin * 2,
        contentHeight,
        "F"
      );

      // Add title centered and in all caps at the top of the content area
      const titleY = contentStartY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(1, 74, 47);
      doc.text("MEETING ATTENDANCE FORM", pageWidth / 2, titleY, {
        align: "center",
      });

      // Meeting details
      const meetingTitle = meeting.title || "Untitled Meeting";
      const meetingDate = meeting.date
        ? format(new Date(meeting.date), "PPP p")
        : "No date specified";
      const meetingLocation = meeting.location || "No location specified";
      const attendeeCount = attendees.length.toString();
      const meetingId = meeting.meetingId || "N/A";
      const sectorName = meeting.sector ? getSectorName(meeting.sector) : "N/A";

      const detailsY = titleY + 8;
      const detailsX = contentMargin + 2;

      const meetingDetails = [
        ["Meeting:", meetingTitle],
        ["Date:", meetingDate],
        ["Location:", meetingLocation],
        ["Attendees:", attendeeCount],
        ["Meeting ID:", meetingId],
        ["Meeting Category:", meeting.meetingCategory || "N/A"], // Fixed typo: "Cartegory" -> "Category"
      ];

      if (meeting.sector) {
        meetingDetails.push(["Sector:", `${sectorName} (${meeting.sector})`]);
      }

      // Add meeting details table
      autoTable(doc, {
        startY: detailsY,
        head: [],
        body: meetingDetails,
        theme: "plain",
        styles: {
          cellPadding: 1.5,
          fontSize: 9,
          overflow: "linebreak",
          textColor: [89, 89, 89],
          minCellHeight: 4,
        },
        columnStyles: {
          0: {
            cellWidth: 40,
            fontStyle: "bold",
            textColor: [89, 89, 89],
            fontSize: 9,
          },
          1: {
            cellWidth: "auto",
            fontStyle: "normal",
            fontSize: 9,
            textColor: [89, 89, 89],
          },
        },
        margin: { left: detailsX, right: detailsX },
      });

      // Get the Y position after the details table
      const finalY = (doc as any).lastAutoTable.finalY + 1;

      // Prepare table headers - conditionally include Organization column
      const tableHeaders = [
        "Name",
        "Email",
        ...(meeting.meetingCategory !== "INTERNAL" ? ["Organization"] : []),
        "Designation",
        "Signature",
      ];

      // Prepare table rows with conditional organization column
      const tableRows = attendees.map((attendee: Attendee) => {
        const row = [
          attendee.name || "N/A",
          attendee.email || "N/A",
          ...(meeting.meetingCategory !== "INTERNAL"
            ? [attendee.organization || "N/A"]
            : []),
          attendee.designation || "N/A",
          attendee.signatureData ? "Signed" : "—", // Placeholder for signature
        ];
        return row;
      });

      // Add attendees table
      autoTable(doc, {
        startY: finalY + 1,
        head: [tableHeaders],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [1, 74, 47],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
          halign: "left",
          valign: "middle",
          cellPadding: 2,
        },
        styles: {
          cellPadding: 1.5,
          fontSize: 8,
          overflow: "linebreak",
          lineWidth: 0.1,
          lineColor: [220, 220, 220],
          textColor: [89, 89, 89],
        },
        columnStyles: {
          0: { fontStyle: "bold" },
          [meeting.meetingCategory !== "INTERNAL" ? 4 : 3]: {
            halign: "center",
          }, // Center signatures column
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: contentMargin, right: contentMargin },
      });

      // Position certification near the bottom of the page
      const certY = pageHeight - 45;

      // Add certification text
      doc.setFontSize(9);
      doc.setTextColor(89, 89, 89);
      doc.text(
        "I certify that this is an accurate record of attendance for the above meeting.",
        pageWidth / 2,
        certY,
        { align: "center" }
      );

      // Add signature lines
      const signLineY = certY + 12;
      const signWidth = 70;

      // Secretary signature line
      doc.setLineWidth(0.5);
      doc.line(25, signLineY, 25 + signWidth, signLineY);
      doc.setFontSize(8);
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

      setPdfGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setPdfGenerating(false);
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
            throw new Error("Failed to fetch meeting details");
          }
          const meetingData = await meetingResponse.json();
          setMeeting(meetingData);

          // Then fetch the attendees
          const attendeesResponse = await fetch(
            `/api/meetings/${id}/attendees`
          );
          if (attendeesResponse.ok) {
            const data = await attendeesResponse.json();
            setAttendees(data);
          } else {
            throw new Error("Failed to fetch attendees");
          }
        } catch (err) {
          console.error("Error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "An error occurred while fetching attendees"
          );
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
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">
            Admin Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the admin dashboard.
          </p>
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
        <Link
          href={`/admin/meetings/${id}`}
          className="text-gray-700 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
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
              onClick={generatePDF}
              className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              disabled={pdfGenerating}
            >
              {pdfGenerating
                ? "Generating PDF..."
                : "Generate PDF with Letterhead"}
            </button>
          </div>
        </div>

        {attendees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No attendees have registered for this meeting yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  {meeting?.meetingCategory !== "INTERNAL" && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendees.map((attendee: Attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{attendee.name}</td>
                    <td className="px-4 py-3">{attendee.email}</td>
                    <td className="px-4 py-3">
                      {attendee.phoneNumber || "N/A"}
                    </td>
                    {meeting?.meetingCategory !== "INTERNAL" && (
                      <td className="px-4 py-3">
                        {attendee.organization || "N/A"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {attendee.designation || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {attendee.createdAt
                        ? format(new Date(attendee.createdAt), "PPp")
                        : "N/A"}
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
