// PDF Configuration Constants and Settings

// Color Schemes
export const PDF_COLORS = {
  primary: [1, 74, 47], // #014a2f - EasyMEET green
  secondary: [255, 193, 7], // #ffc107 - Yellow
  white: [255, 255, 255],
  black: [0, 0, 0],
  gray: [128, 128, 128],
  lightGray: [240, 240, 240],
  red: [220, 53, 69],
  green: [40, 167, 69],
  blue: [0, 123, 255]
};

// Font Settings
export const PDF_FONTS = {
  title: {
    family: 'helvetica',
    style: 'bold',
    size: 18
  },
  subtitle: {
    family: 'helvetica',
    style: 'bold',
    size: 14
  },
  heading: {
    family: 'helvetica',
    style: 'bold',
    size: 12
  },
  body: {
    family: 'helvetica',
    style: 'normal',
    size: 10
  },
  small: {
    family: 'helvetica',
    style: 'normal',
    size: 8
  }
};

// Table Styles
export const PDF_TABLE_STYLES = {
  default: {
    fontSize: 10,
    cellPadding: 5,
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.white,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: PDF_COLORS.white,
      textColor: PDF_COLORS.black
    },
    alternateRowStyles: {
      fillColor: PDF_COLORS.lightGray
    }
  },
  compact: {
    fontSize: 8,
    cellPadding: 3,
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.white,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: PDF_COLORS.white,
      textColor: PDF_COLORS.black
    }
  },
  attendance: {
    fontSize: 9,
    cellPadding: 4,
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.white,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: PDF_COLORS.white,
      textColor: PDF_COLORS.black
    }
  }
};

// Document Settings
export const PDF_DOCUMENT_SETTINGS = {
  default: {
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  landscape: {
    orientation: 'landscape' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  compact: {
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    }
  }
};

// Header and Footer Settings
export const PDF_HEADER_FOOTER = {
  header: {
    height: 30,
    logo: {
      width: 30,
      height: 15,
      margin: 5
    },
    title: {
      fontSize: 16,
      marginTop: 5
    },
    subtitle: {
      fontSize: 12,
      marginTop: 2
    }
  },
  footer: {
    height: 15,
    fontSize: 8,
    pageNumber: {
      fontSize: 8,
      margin: 5
    }
  }
};

// Meeting-specific Configurations
export const MEETING_PDF_CONFIG = {
  attendance: {
    title: 'Meeting Attendance Report',
    subtitle: 'EasyMEET Attendance Report',
    columns: [
      { header: 'No.', width: 15 },
      { header: 'Name', width: 60 },
      { header: 'Designation', width: 50 },
      { header: 'Organization', width: 60 },
      { header: 'Contact', width: 40 },
      { header: 'Email', width: 70 }
    ],
    style: PDF_TABLE_STYLES.attendance
  },
  summary: {
    title: 'Meeting Summary Report',
    subtitle: 'EasyMEET Summary Report',
    columns: [
      { header: 'No.', width: 15 },
      { header: 'Name', width: 80 },
      { header: 'Designation', width: 60 },
      { header: 'Organization', width: 80 }
    ],
    style: PDF_TABLE_STYLES.default
  }
};

// Image Settings
export const PDF_IMAGE_SETTINGS = {
  logo: {
    maxWidth: 30,
    maxHeight: 15,
    quality: 0.8
  },
  signature: {
    maxWidth: 50,
    maxHeight: 25,
    quality: 0.9
  },
  letterhead: {
    maxWidth: 180,
    maxHeight: 40,
    quality: 0.8
  }
};

// Page Break Settings
export const PDF_PAGE_BREAK = {
  tableRowHeight: 8,
  marginBeforeBreak: 20,
  minRowsOnPage: 3
};

// Text Formatting
export const PDF_TEXT_FORMAT = {
  date: {
    format: 'dd/MM/yyyy',
    locale: 'en-US'
  },
  time: {
    format: 'HH:mm',
    locale: 'en-US'
  },
  datetime: {
    format: 'dd/MM/yyyy HH:mm',
    locale: 'en-US'
  }
};

// Utility Functions for PDF Configuration
export function getTableConfig(style: keyof typeof PDF_TABLE_STYLES = 'default') {
  return PDF_TABLE_STYLES[style];
}

export function getDocumentConfig(type: keyof typeof PDF_DOCUMENT_SETTINGS = 'default') {
  return PDF_DOCUMENT_SETTINGS[type];
}

export function getMeetingConfig(type: keyof typeof MEETING_PDF_CONFIG) {
  return MEETING_PDF_CONFIG[type];
}

export function formatDateForPDF(date: Date | string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}

export function formatTimeForPDF(date: Date | string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString(PDF_TEXT_FORMAT.time.locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTimeForPDF(date: Date | string): string {
  const dateObj = new Date(date);
  return `${formatDateForPDF(dateObj)} ${formatTimeForPDF(dateObj)}`;
}

// Column Width Calculator
export function calculateColumnWidths(
  totalWidth: number,
  columns: Array<{ header: string; width?: number }>
): number[] {
  const totalDefinedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const remainingWidth = totalWidth - totalDefinedWidth;
  const undefinedColumns = columns.filter(col => !col.width).length;
  const defaultWidth = remainingWidth / undefinedColumns;

  return columns.map(col => col.width || defaultWidth);
}

// Text Truncation
export function truncateTextForPDF(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Color Utilities
export function getColorArray(hexColor: string): number[] {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return [r, g, b];
}

export function getHexColor(colorArray: number[]): string {
  const [r, g, b] = colorArray;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
} 