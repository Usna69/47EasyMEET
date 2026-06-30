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
import { Attendee } from "@/app/admin/meetings/[id]/attendees/AttendeesClient";

// =====================
// Font Registration
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

Font.register({
  family: "Poppins",
  fonts: [
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Poppins/Poppins-Regular.ttf`,
      fontWeight: 400,
    },
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Poppins/Poppins-Medium.ttf`,
      fontWeight: 500,
    },
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Poppins/Poppins-SemiBold.ttf`,
      fontWeight: 600,
    },
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Poppins/Poppins-Bold.ttf`,
      fontWeight: 700,
    },
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Poppins/Poppins-ExtraBold.ttf`,
      fontWeight: 800,
    },
  ],
});

Font.register({
  family: "Franklin",
  fonts: [
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Franklin/FranklinGothic.ttf`,
      fontWeight: 800,
    },
    {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/fonts/Franklin/FranklinGothicCondensed.ttf`,
      fontWeight: 500,
    },
  ],
});

// =====================
// Colors
// =====================
const COLORS = {
  primary: "#00431F",
  secondary: "#000000",
  border: "#CCCCCC",
  headerBg: "#F0F0F0",
  textMuted: "#595959",
};

// =====================
// Styles
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
    fontFamily: "Poppins",
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  website: {
    fontSize: 9,
    color: COLORS.primary,
    marginBottom: 6,
  },
  departmentName: {
    fontFamily: "Franklin",
    fontSize: 24,
    fontWeight: 800,
    color: COLORS.primary,
    textTransform: "uppercase",
    marginTop: 10,
    textAlign: "center",
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
    width: 80,
    height: 80,
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
    minHeight: 25,
    alignItems: "center",
  },
  rowEven: {
    backgroundColor: "#F8F8F8",
  },
  cell: {
    padding: 4,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  cellNumber: {
    textAlign: "center",
  },
  signatureImage: {
    width: 40,
    height: 20,
    objectFit: "contain",
  },
  signatureSection: {
    position: "absolute",
    bottom: 70,
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
    marginTop: 10,
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
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTagline: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontFamily: "Poppins",
    fontWeight: 400,
    color: COLORS.primary,
  },
  footerTextBold: {
    fontFamily: "Poppins",
    fontWeight: 800,
    color: COLORS.primary,
  },
  footerBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  footerBarText: {
    color: "#FFFFFF",
    fontSize: 8,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: 500,
  },
});

// =====================
// Column widths (now with numbering)
// =====================
const getColumnWidths = (isInternal: boolean) => {
  if (isInternal) {
    return {
      no: "5%",
      name: "24%",
      email: "27%",
      phone: "18%",
      designation: "16%",
      signature: "10%",
    };
  }
  // External meetings
  return {
    no: "5%",
    name: "14%",
    email: "17%",
    phone: "14%",
    organization: "17%",
    designation: "17%",
    signature: "16%",
  };
};

// =====================
// Types
// =====================

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  sector?: string;
  meetingId?: string;
  meetingCategory?: string;
  customLetterheadFooter?: string;
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

  // Headers with numbering
  const headers = isInternal
    ? ["No.", "Name", "Email", "Contact", "Designation", "Signature"]
    : [
        "No.",
        "Name",
        "Email",
        "Contact",
        "Organization",
        "Designation",
        "Signature",
      ];

  const colWidths = getColumnWidths(isInternal);
  const colOrder = isInternal
    ? ["no", "name", "email", "phone", "designation", "signature"]
    : [
        "no",
        "name",
        "email",
        "phone",
        "organization",
        "designation",
        "signature",
      ];

  const getCellStyle = (colKey: string) => ({
    width: colWidths[colKey as keyof typeof colWidths] || "auto",
    ...styles.cell,
    ...(colKey === "no" ? styles.cellNumber : {}),
  });

  const departmentName = meeting.sector
    ? getSectorName(meeting.sector).toUpperCase()
    : "DEPARTMENT NOT SPECIFIED";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark} fixed>
          LET&apos;S MAKE NAIROBI WORK
        </Text>

        {/* Mosaic */}
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/mosaic.png`}
          style={styles.mosaicPlaceholder}
        />

        {/* Date */}
        <View style={styles.dateHeader}>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Header */}
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

        {/* Meeting Details */}
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

        {/* Attendees Table */}
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
                    textAlign: colOrder[idx] === "no" ? "center" : "left",
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
              <Text style={getCellStyle("no")}>{idx + 1}</Text>
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
              <View style={getCellStyle("signature")}>
                {attendee.signatureData ? (
                  <Image
                    src={attendee.signatureData}
                    style={styles.signatureImage}
                  />
                ) : (
                  <Text>—</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Signature Section (certification) */}
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

        {/* Footer */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerTagline}>
            <Text style={styles.footerText}>LET’S MAKE </Text>
            <Text style={styles.footerTextBold}>NAIROBI</Text>
            <Text style={styles.footerText}> WORK</Text>
          </View>
          <View style={styles.footerBar}>
            <Text style={styles.footerBarText}>
              TELEPHONE: +254 725 624 489; +254 738 041 292 | EMAIL:
              INFO@NAIROBI.GO.KE | CITY HALL, CITY HALL WAY, P.O. BOX 30075
              00100, NAIROBI, KENYA
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
