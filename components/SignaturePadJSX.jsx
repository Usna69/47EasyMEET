'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import the signature canvas only on client side
const SignatureCanvas = dynamic(() => import('react-signature-canvas'),
  { ssr: false }
);

const SignaturePadJSX = forwardRef(({ onEnd }, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileDevices.test(userAgent) || window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`w-full ${isMobile ? 'mobile-signature-wrapper' : ''}`}>
      <SignatureCanvas
        ref={ref}
        canvasProps={{
          className: `signature-canvas w-full ${isMobile ? 'h-48' : 'h-40'} border border-gray-200 rounded-sm`,
          style: {
            backgroundColor: 'transparent',
            touchAction: 'none' // Prevents scrolling while signing on mobile
          }
        }}
        backgroundColor="rgba(255, 255, 255, 0)"
        penColor="black"
        dotSize={isMobile ? 3 : 2} // Slightly thicker lines on mobile
        minWidth={1.5}
        maxWidth={3}
        onEnd={onEnd}
      />
    </div>
  );
});

SignaturePadJSX.displayName = 'SignaturePadJSX';

export default SignaturePadJSX;
