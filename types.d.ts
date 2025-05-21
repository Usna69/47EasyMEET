// Type definitions for the Nairobi Meeting Attendance App

// Meeting model
interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  attendees?: Attendee[];
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    attendees: number;
  };
}

// Attendee model
interface Attendee {
  id: string;
  meetingId: string;
  meeting?: Meeting;
  name: string;
  email: string;
  designation: string;
  createdAt?: Date;
}

// Extend Next.js request and response types
declare module 'next/server' {
  interface NextRequest extends Request {
    json: () => Promise<any>;
  }

  interface NextResponse extends Response {
    json: (body: any, init?: ResponseInit) => NextResponse;
  }
}

// Fix React module declaration
declare module 'react' {
  interface JSX {
    IntrinsicElements: any;
  }
}

// Fix qrcode.react module declaration
declare module 'qrcode.react' {
  export interface QRCodeSVGProps {
    value: string;
    size?: number;
    level?: string;
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate: boolean;
      x?: number;
      y?: number;
    };
  }

  export const QRCodeSVG: React.FC<QRCodeSVGProps>;
  export const QRCodeCanvas: React.FC<QRCodeSVGProps>;
}
