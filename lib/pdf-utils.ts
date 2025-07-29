import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_FONTS,
  PDF_TABLE_STYLES,
  PDF_DOCUMENT_SETTINGS,
  PDF_HEADER_FOOTER,
  MEETING_PDF_CONFIG,
  PDF_IMAGE_SETTINGS,
  PDF_PAGE_BREAK,
  PDF_TEXT_FORMAT,
  getTableConfig,
  getDocumentConfig,
  getMeetingConfig,
  formatDateForPDF,
  formatTimeForPDF,
  formatDateTimeForPDF,
  calculateColumnWidths,
  truncateTextForPDF
} from './pdf-config';

// PDF Configuration Types
export interface PDFTableConfig {
  head: string[][];
  body: string[][];
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    headStyles?: {
      fillColor?: number[];
      textColor?: number[];
      fontStyle?: string;
    };
    bodyStyles?: {
      fillColor?: number[];
      textColor?: number[];
    };
  };
}

export interface PDFDocumentConfig {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'cm' | 'in' | 'pt';
  format?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Default PDF Styles (now using config)
export const defaultPDFStyles = PDF_TABLE_STYLES.default;

// Default Document Configuration (now using config)
export const defaultDocumentConfig: PDFDocumentConfig = {
  title: 'EasyMEET Report',
  ...PDF_DOCUMENT_SETTINGS.default
};

// PDF Generation Functions
export function createPDFDocument(config: PDFDocumentConfig = defaultDocumentConfig): jsPDF {
  const docConfig = getDocumentConfig('default');
  const doc = new jsPDF({
    orientation: config.orientation || docConfig.orientation,
    unit: config.unit || docConfig.unit,
    format: config.format || docConfig.format
  });

  const margins = config.margins || docConfig.margins;

  // Add title
  doc.setFontSize(PDF_FONTS.title.size);
  doc.setFont(PDF_FONTS.title.family, PDF_FONTS.title.style);
  doc.text(config.title, margins.left, margins.top);

  // Add subtitle if provided
  if (config.subtitle) {
    doc.setFontSize(PDF_FONTS.subtitle.size);
    doc.setFont(PDF_FONTS.subtitle.family, PDF_FONTS.subtitle.style);
    doc.text(config.subtitle, margins.left, margins.top + 10);
  }

  return doc;
}

export function addTableToPDF(
  doc: jsPDF,
  config: PDFTableConfig,
  startY: number = 40
): number {
  const tableStyle = getTableConfig('default');
  const tableConfig = {
    head: config.head,
    body: config.body,
    startY: startY,
    styles: {
      fontSize: config.styles?.fontSize || tableStyle.fontSize,
      cellPadding: config.styles?.cellPadding || tableStyle.cellPadding,
      headStyles: {
        fillColor: config.styles?.headStyles?.fillColor || tableStyle.headStyles.fillColor,
        textColor: config.styles?.headStyles?.textColor || tableStyle.headStyles.textColor,
        fontStyle: config.styles?.headStyles?.fontStyle || tableStyle.headStyles.fontStyle
      },
      bodyStyles: {
        fillColor: config.styles?.bodyStyles?.fillColor || tableStyle.bodyStyles.fillColor,
        textColor: config.styles?.bodyStyles?.textColor || tableStyle.bodyStyles.textColor
      }
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 }
  };

  // @ts-ignore - jsPDF autotable types
  doc.autoTable(tableConfig);

  // Return the Y position after the table
  // @ts-ignore - jsPDF autotable types
  return doc.lastAutoTable.finalY + 10;
}

export function addImageToPDF(
  doc: jsPDF,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        doc.addImage(img, 'JPEG', x, y, width, height);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

export function addHeaderToPDF(
  doc: jsPDF,
  title: string,
  subtitle?: string,
  logoUrl?: string
): Promise<number> {
  return new Promise(async (resolve) => {
    let currentY = PDF_HEADER_FOOTER.header.height;

    // Add logo if provided
    if (logoUrl) {
      try {
        const logoConfig = PDF_HEADER_FOOTER.header.logo;
        await addImageToPDF(doc, logoUrl, logoConfig.margin, currentY - logoConfig.height, logoConfig.width, logoConfig.height);
        currentY += logoConfig.height + logoConfig.margin;
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
      }
    }

    // Add title
    doc.setFontSize(PDF_HEADER_FOOTER.header.title.fontSize);
    doc.setFont(PDF_FONTS.title.family, PDF_FONTS.title.style);
    doc.text(title, PDF_DOCUMENT_SETTINGS.default.margins.left, currentY);
    currentY += PDF_HEADER_FOOTER.header.title.marginTop;

    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(PDF_HEADER_FOOTER.header.subtitle.fontSize);
      doc.setFont(PDF_FONTS.subtitle.family, PDF_FONTS.subtitle.style);
      doc.text(subtitle, PDF_DOCUMENT_SETTINGS.default.margins.left, currentY);
      currentY += PDF_HEADER_FOOTER.header.subtitle.marginTop;
    }

    resolve(currentY);
  });
}

export function addFooterToPDF(
  doc: jsPDF,
  text: string,
  pageNumber?: boolean
): void {
  const pageHeight = doc.internal.pageSize.height;
  const footerY = pageHeight - PDF_HEADER_FOOTER.footer.height;

  doc.setFontSize(PDF_HEADER_FOOTER.footer.fontSize);
  doc.setFont(PDF_FONTS.small.family, PDF_FONTS.small.style);
  doc.text(text, PDF_DOCUMENT_SETTINGS.default.margins.left, footerY);

  if (pageNumber) {
    const pageCount = doc.getNumberOfPages();
    const pageText = `Page ${pageCount}`;
    const pageWidth = doc.internal.pageSize.width;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - pageTextWidth - PDF_HEADER_FOOTER.footer.pageNumber.margin, footerY);
  }
}

// Meeting-specific PDF functions
export function generateMeetingAttendancePDF(
  meeting: any,
  attendees: any[],
  logoUrl?: string
): Promise<jsPDF> {
  return new Promise(async (resolve) => {
    const meetingConfig = getMeetingConfig('attendance');
    const doc = createPDFDocument({
      title: meetingConfig.title,
      subtitle: `${meeting.title} - ${formatDateForPDF(meeting.date)}`
    });

    // Add header
    const headerY = await addHeaderToPDF(
      doc,
      meetingConfig.subtitle,
      meeting.title,
      logoUrl
    );

    // Create attendance table
    const tableConfig: PDFTableConfig = {
      head: [meetingConfig.columns.map(col => col.header)],
      body: attendees.map((attendee, index) => [
        (index + 1).toString(),
        truncateTextForPDF(attendee.name || '', 30),
        truncateTextForPDF(attendee.designation || '', 25),
        truncateTextForPDF(attendee.organization || '', 30),
        truncateTextForPDF(attendee.phoneNumber || '', 20),
        truncateTextForPDF(attendee.email || '', 35)
      ]),
      styles: meetingConfig.style
    };

    addTableToPDF(doc, tableConfig, headerY);

    // Add footer
    addFooterToPDF(
      doc,
      `Generated on ${formatDateTimeForPDF(new Date())}`,
      true
    );

    resolve(doc);
  });
}

export function generateMeetingSummaryPDF(
  meeting: any,
  attendees: any[],
  logoUrl?: string
): Promise<jsPDF> {
  return new Promise(async (resolve) => {
    const meetingConfig = getMeetingConfig('summary');
    const doc = createPDFDocument({
      title: meetingConfig.title,
      subtitle: meeting.title
    });

    // Add header
    const headerY = await addHeaderToPDF(
      doc,
      meetingConfig.subtitle,
      meeting.title,
      logoUrl
    );

    // Add meeting details
    doc.setFontSize(PDF_FONTS.heading.size);
    doc.setFont(PDF_FONTS.heading.family, PDF_FONTS.heading.style);
    doc.text('Meeting Details:', PDF_DOCUMENT_SETTINGS.default.margins.left, headerY);
    
    doc.setFontSize(PDF_FONTS.body.size);
    doc.setFont(PDF_FONTS.body.family, PDF_FONTS.body.style);
    doc.text(`Date: ${formatDateForPDF(meeting.date)}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 10);
    doc.text(`Time: ${formatTimeForPDF(meeting.date)}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 15);
    doc.text(`Location: ${meeting.location}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 20);
    doc.text(`Sector: ${meeting.sector}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 25);
    doc.text(`Category: ${meeting.meetingCategory}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 30);
    doc.text(`Type: ${meeting.meetingType}`, PDF_DOCUMENT_SETTINGS.default.margins.left, headerY + 35);

    // Add attendance summary
    const summaryY = headerY + 50;
    doc.setFontSize(PDF_FONTS.heading.size);
    doc.setFont(PDF_FONTS.heading.family, PDF_FONTS.heading.style);
    doc.text('Attendance Summary:', PDF_DOCUMENT_SETTINGS.default.margins.left, summaryY);
    
    doc.setFontSize(PDF_FONTS.body.size);
    doc.setFont(PDF_FONTS.body.family, PDF_FONTS.body.style);
    doc.text(`Total Attendees: ${attendees.length}`, PDF_DOCUMENT_SETTINGS.default.margins.left, summaryY + 10);

    // Add attendees table
    const tableConfig: PDFTableConfig = {
      head: [meetingConfig.columns.map(col => col.header)],
      body: attendees.map((attendee, index) => [
        (index + 1).toString(),
        truncateTextForPDF(attendee.name || '', 40),
        truncateTextForPDF(attendee.designation || '', 30),
        truncateTextForPDF(attendee.organization || '', 40)
      ]),
      styles: meetingConfig.style
    };

    addTableToPDF(doc, tableConfig, summaryY + 20);

    // Add footer
    addFooterToPDF(
      doc,
      `Generated on ${formatDateTimeForPDF(new Date())}`,
      true
    );

    resolve(doc);
  });
}

// Utility functions (now using config)
export function formatDate(date: string | Date): string {
  return formatDateForPDF(date);
}

export function formatTime(date: string | Date): string {
  return formatTimeForPDF(date);
}

export function truncateText(text: string, maxLength: number): string {
  return truncateTextForPDF(text, maxLength);
} 