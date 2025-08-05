'use client';

import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';

const SignaturePadJSX = forwardRef(({ onEnd, onClear }, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clear: () => {
      clearCanvas();
    },
    isEmpty: () => {
      return !hasSignature;
    },
    toDataURL: () => {
      return canvasRef.current ? canvasRef.current.toDataURL() : '';
    }
  }));
  
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

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set drawing styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = isMobile ? 3 : 2;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isMobile]);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear the canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      setHasSignature(false);
      
      if (onClear) {
        onClear();
      }
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    
    if (hasSignature && onEnd) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onEnd(signatureData);
    }
  };

  const handleClear = () => {
    console.log('Clear button clicked');
    clearCanvas();
  };


  
  return (
    <div className={`w-full ${isMobile ? 'mobile-signature-wrapper' : ''}`}>
      <canvas
        ref={canvasRef}
        className={`signature-canvas w-full ${isMobile ? 'h-48' : 'h-40'} border border-gray-200 rounded-sm bg-white`}
        style={{
          touchAction: 'none' // Prevents scrolling while signing on mobile
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
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

SignaturePadJSX.displayName = 'SignaturePadJSX';

export default SignaturePadJSX;
