/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix for qrcode.react
declare module 'qrcode.react' {
  export interface QRCodeSVGProps {
    value: string;
    size?: number;
    level?: string;
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
  }
  export const QRCodeSVG: React.FC<QRCodeSVGProps>;
  export const QRCodeCanvas: React.FC<QRCodeSVGProps>;
}

// Fix for jspdf
declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    addPage(): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(fontName: string, style?: string): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    setFillColor(r: number, g: number, b: number): jsPDF;
    setDrawColor(r: number, g: number, b: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    rect(x: number, y: number, w: number, h: number, style?: string): jsPDF;
    addImage(imageData: string | HTMLImageElement, format: string, x: number, y: number, width: number, height: number): jsPDF;
    getNumberOfPages(): number;
    getTextWidth(text: string): number;
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth(): number;
        getHeight(): number;
      };
    };
    save(filename: string): void;
  }
}
