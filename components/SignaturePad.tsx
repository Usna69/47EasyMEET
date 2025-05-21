'use client';

import * as React from 'react';
const { forwardRef } = React;
import dynamic from 'next/dynamic';

// Import the signature canvas only on client side
const SignatureCanvas = dynamic(
  () => import('react-signature-canvas'),
  { ssr: false }
);

interface SignaturePadProps {
  onEnd: () => void;
}

const SignaturePad = forwardRef<any, SignaturePadProps>(({ onEnd }, ref) => {
  return (
    <div className="w-full h-48 border-b border-gray-200 bg-white">
      <SignatureCanvas
        ref={ref}
        canvasProps={{
          className: "w-full h-full",
          style: { width: '100%', height: '100%' }
        }}
        backgroundColor="white"
        onEnd={onEnd}
      />
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
