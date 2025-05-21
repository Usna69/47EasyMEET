import React from 'react';

declare global {
  namespace React {
    interface ReactElement {}
  }
}

// Fix for React hooks
declare module 'react' {
  export = React;
  export function useState<T>(initialState: T): [T, (state: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
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
