'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Import the signature canvas only on client side
const SignatureCanvas = dynamic(() => import('react-signature-canvas'),
  { ssr: false }
);

interface SignaturePadProps {
  onEnd?: () => void;
  onClear?: () => void;
}

const SignaturePad = React.forwardRef<any, SignaturePadProps>(({ onEnd, onClear }: SignaturePadProps, ref) => {
  const internalRef = React.useRef<any>(null);
  
  // Use the internal ref if no external ref is provided
  const canvasRef = ref || internalRef;

  const handleClear = () => {
    console.log('Clear button clicked');
    console.log('Canvas ref:', canvasRef);
    console.log('Canvas ref current:', (canvasRef as any)?.current);
    
    try {
      if (canvasRef && (canvasRef as any).current) {
        console.log('Clearing signature canvas');
        (canvasRef as any).current.clear();
        if (onClear) {
          console.log('Calling onClear callback');
          onClear();
        }
      } else {
        console.log('Ref or ref.current is not available');
      }
    } catch (error) {
      console.error('Error clearing signature:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full h-48 border border-gray-200 rounded-sm bg-white">
        <SignatureCanvas
          ref={canvasRef as any}
          canvasProps={{
            className: "w-full h-full",
            style: {
              width: '100%',
              height: '100%',
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
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">Sign above using finger or mouse</p>
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
