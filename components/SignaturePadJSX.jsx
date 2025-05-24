'use client';

import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Import the signature canvas only on client side
const SignatureCanvas = dynamic(() => import('react-signature-canvas'),
  { ssr: false }
);

const SignaturePadJSX = forwardRef(({ onEnd }, ref) => {
  return (
    <div className="w-full">
      <SignatureCanvas
        ref={ref}
        canvasProps={{
          className: 'signature-canvas w-full h-40 border border-gray-200 rounded-sm',
          style: {
            backgroundColor: 'transparent'
          }
        }}
        backgroundColor="rgba(255, 255, 255, 0)"
        penColor="black"
        dotSize={2}
        minWidth={1.5}
        maxWidth={3}
        onEnd={onEnd}
      />
    </div>
  );
});

SignaturePadJSX.displayName = 'SignaturePadJSX';

export default SignaturePadJSX;
