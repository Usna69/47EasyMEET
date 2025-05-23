// 'use client';

// import * as React from 'react';
// import dynamic from 'next/dynamic';

// // Import the signature canvas only on client side
// const SignatureCanvas = dynamic(() => import('react-signature-canvas'),
//   { ssr: false }
// );

// // Define signature canvas reference type
// type SignatureCanvasRef = any; // Using any since we can't easily get the exact type from the dynamic import

// interface SignaturePadProps {
//   onEnd?: () => void;
// }

// const SignaturePad = React.forwardRef<SignatureCanvasRef, SignaturePadProps>(({ onEnd }: SignaturePadProps, ref: React.RefObject<SignatureCanvasRef>) => {
//   return (
//     <div className="w-full h-48 border-b border-gray-200 bg-white">
//       <SignatureCanvas
//         ref={ref}
//         canvasProps={{
//           className: "w-full h-full",
//           style: {
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'transparent'
//           }
//         }}
//         backgroundColor="rgba(255, 255, 255, 0)"
//         penColor="black"
//         dotSize={2}
//         minWidth={1.5}
//         maxWidth={3}
//         onEnd={onEnd}
//       />
//       <p className="text-xs text-gray-500 mt-1 text-center">Sign above using finger or mouse</p>
//     </div>
//   );
// });

// SignaturePad.displayName = 'SignaturePad';

// export default SignaturePad;
