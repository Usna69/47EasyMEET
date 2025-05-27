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
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  absolute?: boolean; // If true, assumes url is complete, otherwise prepends origin
}

export default function QRCodeDisplay({
  url,
  size = 200,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'L',
  includeMargin = false,
  absolute = false
}: QRCodeDisplayProps) {
  // Generate a full URL based on the provided URL
  const getFullUrl = () => {
    // If we're in the browser and the URL is not absolute
    if (typeof window !== 'undefined' && 
        !absolute && 
        !url.startsWith('http://') && 
        !url.startsWith('https://')) {
      // For paths that start with /, append to origin
      if (url.startsWith('/')) {
        return `${window.location.origin}${url}`;
      } else {
        // For relative URLs, derive from current path
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        return `${window.location.origin}${basePath}/${url}`;
      }
    }
    // Return the original URL for absolute URLs or when on server
    return url;
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white p-3 rounded-lg shadow-md">
        <QRCodeSVG
          value={getFullUrl()}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
        />
      </div>
    </div>
  );
}
