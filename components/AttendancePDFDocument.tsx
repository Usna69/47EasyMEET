"use client";

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { getSectorName } from "@/utils/sectorUtils";

// =====================
// Font Registration (same as customer service report)
// =====================
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZg.ttf",
      fontWeight: 700,
    },
  ],
});

// =====================
// Colors (Nairobi City County theme)
// =====================
const COLORS = {
  primary: "#00431F", // Nairobi green
  secondary: "#000000",
  border: "#CCCCCC",
  headerBg: "#F0F0F0",
  textMuted: "#595959",
};

// =====================
// Styles (based on customer service report)
// =====================
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Inter",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 60,
    color: "rgba(0, 67, 31, 0.05)",
    fontWeight: 700,
    transform: "rotate(-45deg)",
    textAlign: "center",
    width: "70%",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
  },
  countyName: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  website: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  departmentName: {
    fontSize: 20, // bigger like the image
    fontWeight: 700, // bold
    color: COLORS.primary, // Nairobi green
    textTransform: "uppercase",
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 1, // adds that clean spacing feel
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.secondary,
    marginTop: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  note: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 15,
    textAlign: "center",
  },
  logo: {
    width: 105,
    height: 100,
    marginBottom: 10,
    alignSelf: "center",
  },
  dateHeader: {
    position: "absolute",
    top: 10,
    right: 30,
    fontSize: 10,
    color: COLORS.secondary,
  },
  mosaicPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 212,
    height: 196,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Meeting details card (similar to summaryContainer in customer report)
  meetingDetailsCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
  },
  detailItem: {
    width: "33%",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: 500,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.secondary,
  },
  // Table styles
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "left",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowEven: {
    backgroundColor: "#F8F8F8",
  },
  cell: {
    padding: 6,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  // Footer image (absolute, bottom)
  footerImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 90,
  },
  // Signature section (placed above footer image)
  signatureSection: {
    position: "absolute",
    bottom: 100, // above footer image (90px height + 10px margin)
    left: 30,
    right: 30,
    textAlign: "center",
  },
  certification: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  signatureLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureItem: {
    width: "45%",
    alignItems: "center",
  },
  line: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.textMuted,
    width: "100%",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  // Text footer and page number
  textFooter: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.secondary,
    fontWeight: 500,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    paddingTop: 8,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.secondary,
  },
});

// =====================
// Helper for column widths
// =====================
const getColumnWidths = (isInternal: boolean) => {
  if (isInternal) {
    return {
      name: "22%",
      email: "25%",
      phone: "18%",
      designation: "20%",
      signature: "15%",
    };
  }
  return {
    name: "18%",
    email: "20%",
    phone: "15%",
    organization: "17%",
    designation: "18%",
    signature: "12%",
  };
};

// =====================
// Types
// =====================
interface Attendee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  organization: string;
  signatureData?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  sector?: string;
  meetingId?: string;
  meetingCategory?: string;
  customLetterheadFooter?: string; // footer image
}

interface Props {
  meeting: Meeting;
  attendees: Attendee[];
}

// =====================
// Component
// =====================
export default function AttendancePDFDocument({ meeting, attendees }: Props) {
  const isInternal = meeting.meetingCategory === "INTERNAL";

  const headers = isInternal
    ? ["Name", "Email", "Contact", "Designation", "Signature"]
    : ["Name", "Email", "Contact", "Organization", "Designation", "Signature"];

  const colWidths = getColumnWidths(isInternal);
  const colOrder = isInternal
    ? ["name", "email", "phone", "designation", "signature"]
    : ["name", "email", "phone", "organization", "designation", "signature"];

  const getCellStyle = (colKey: string) => ({
    width: colWidths[colKey as keyof typeof colWidths] || "auto",
    ...styles.cell,
  });

  // Derive department name from sector (uppercase, replace spaces with underscores if needed)
  const departmentName = meeting.sector
    ? getSectorName(meeting.sector).toUpperCase()
    : "DEPARTMENT NOT SPECIFIED";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= WATERMARK ================= */}
        <Text style={styles.watermark} fixed>
          LET&apos;S MAKE NAIROBI WORK
        </Text>

        {/* ================= MOSAIC PLACEHOLDER ================= */}

        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/mosaic.png`}
          style={styles.mosaicPlaceholder}
        />

        {/* ================= DATE HEADER ================= */}
        <View style={styles.dateHeader}>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* ================= HEADER CONTENT ================= */}
        <View style={styles.header}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/county.png`}
            style={styles.logo}
          />
          <Text style={styles.countyName}>NAIROBI CITY COUNTY</Text>
          <Text style={styles.website}>www.nairobi.go.ke</Text>
          <Text style={styles.departmentName}>{departmentName}</Text>
          <Text style={styles.reportTitle}>MEETING ATTENDANCE REPORT</Text>
          <Text style={styles.note}>
            Note: This report contains official attendance records for the
            meeting.
          </Text>
        </View>

        {/* ================= MEETING DETAILS CARD ================= */}
        <View style={styles.meetingDetailsCard}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Meeting Title</Text>
            <Text style={styles.detailValue}>
              {meeting.title || "Untitled"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {meeting.date
                ? format(new Date(meeting.date), "PPP p")
                : "Not set"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {meeting.location || "Not specified"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Meeting ID</Text>
            <Text style={styles.detailValue}>{meeting.meetingId || "N/A"}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Sector</Text>
            <Text style={styles.detailValue}>
              {meeting.sector ? getSectorName(meeting.sector) : "N/A"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Attendees</Text>
            <Text style={styles.detailValue}>{attendees.length}</Text>
          </View>
        </View>

        {/* ================= ATTENDEES TABLE ================= */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {headers.map((header, idx) => (
              <Text
                key={idx}
                style={[
                  styles.headerCell,
                  {
                    width:
                      colWidths[colOrder[idx] as keyof typeof colWidths] ||
                      "auto",
                  },
                ]}
              >
                {header}
              </Text>
            ))}
          </View>

          {attendees.map((attendee, idx) => (
            <View
              key={attendee.id}
              style={[styles.row, idx % 2 === 1 ? styles.rowEven : {}]}
            >
              <Text style={getCellStyle("name")}>{attendee.name || "N/A"}</Text>
              <Text style={getCellStyle("email")}>
                {attendee.email || "N/A"}
              </Text>
              <Text style={getCellStyle("phone")}>
                {attendee.phoneNumber || "N/A"}
              </Text>
              {!isInternal && (
                <Text style={getCellStyle("organization")}>
                  {attendee.organization || "N/A"}
                </Text>
              )}
              <Text style={getCellStyle("designation")}>
                {attendee.designation || "N/A"}
              </Text>
              <Text style={getCellStyle("signature")}>
                {attendee.signatureData ? "Signed" : "—"}
              </Text>
            </View>
          ))}
        </View>

        {/* ================= FOOTER IMAGE (custom letterhead) ================= */}
        <Image
          src={meeting.customLetterheadFooter || "/letterheads/footer.jpg"}
          style={styles.footerImage}
          fixed
        />

        {/* ================= SIGNATURE SECTION ================= */}
        <View style={styles.signatureSection} fixed>
          <Text style={styles.certification}>
            I certify that this is an accurate record of attendance for the
            above meeting.
          </Text>
          <View style={styles.signatureLine}>
            <View style={styles.signatureItem}>
              <View style={styles.line} />
              <Text style={styles.signatureLabel}>Meeting Secretary</Text>
            </View>
            <View style={styles.signatureItem}>
              <View style={styles.line} />
              <Text style={styles.signatureLabel}>Chairperson</Text>
            </View>
          </View>
        </View>

        {/* ================= TEXT FOOTER ================= */}
        {/*<View style={styles.textFooter}>
          <Text>Generated: {new Date().toLocaleString()}</Text>
          <Text>EasyMEET Attendance System</Text>
        </View>*/}

        {/* ================= PAGE NUMBER ================= */}
        {/*<Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />*/}
      </Page>
    </Document>
  );
}
