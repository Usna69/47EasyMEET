import React from 'react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function DualColorSpinner({ size = 40, className = '' }: SpinnerProps) {
  return (
    <div className={`dual-color-spinner ${className}`} style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      
        @keyframes spin2 {
          0% {
            stroke-dasharray: 1, 800;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 400, 400;
            stroke-dashoffset: -200px;
          }
          100% {
            stroke-dasharray: 800, 1;
            stroke-dashoffset: -800px;
          }
        }
      
        .spin2 {
          transform-origin: center;
          animation: spin2 1.5s ease-in-out infinite,
            spin 2s linear infinite;
          animation-direction: alternate;
        }
      `}} />
      
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <linearGradient id="yellow-green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#FFC107' }} />
            <stop offset="50%" style={{ stopColor: '#FFC107' }} />
            <stop offset="50%" style={{ stopColor: '#014a2f' }} />
            <stop offset="100%" style={{ stopColor: '#014a2f' }} />
          </linearGradient>
        </defs>
        <circle 
          className="spin2" 
          cx="400" 
          cy="400" 
          fill="none"
          r="200" 
          strokeWidth="50" 
          stroke="url(#yellow-green-gradient)"
          strokeDasharray="700 1400"
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}
