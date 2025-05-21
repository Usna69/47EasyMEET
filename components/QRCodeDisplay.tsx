'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-white p-3 rounded-lg shadow-md">
        <QRCodeSVG
          value={url}
          size={200}
          bgColor={'#ffffff'}
          fgColor={'#000000'}
          level={'L'}
          includeMargin={false}
        />
      </div>
    </div>
  );
}
