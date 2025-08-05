/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

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

declare module 'react-signature-canvas' {
  import { Component } from 'react';
  
  interface SignatureCanvasProps {
    canvasProps?: any;
    backgroundColor?: string;
    penColor?: string;
    dotSize?: number;
    minWidth?: number;
    maxWidth?: number;
    onEnd?: () => void;
    onBegin?: () => void;
    ref?: any;
  }
  
  class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(): string;
    fromDataURL(dataURL: string): void;
  }
  
  export default SignatureCanvas;
}
