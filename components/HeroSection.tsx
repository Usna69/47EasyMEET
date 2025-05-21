'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HeroSection() {
  const router = useRouter();
  const [meetPosition, setMeetPosition] = React.useState({ x: 0, y: 0 });
  const [isEscaping, setIsEscaping] = React.useState(false);
  const logoRef = React.useRef<HTMLSpanElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  
  // Reset position when mouse leaves the area
  const handleMouseLeave = () => {
    setMeetPosition({ x: 0, y: 0 });
    setIsEscaping(false);
  };
  
  // Handle mouse movement to make the MEET text escape
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!logoRef.current) return;
    
    // Get logo position and dimensions
    const logoRect = logoRef.current.getBoundingClientRect();
    const logoCenter = {
      x: logoRect.left + logoRect.width / 2,
      y: logoRect.top + logoRect.height / 2
    };
    
    // Get mouse position relative to logo
    const mousePos = { x: e.clientX, y: e.clientY };
    
    // Calculate distance between mouse and logo
    const distance = Math.sqrt(
      Math.pow(mousePos.x - logoCenter.x, 2) + 
      Math.pow(mousePos.y - logoCenter.y, 2)
    );
    
    // If mouse is close enough, make the text escape
    if (distance < 150) {
      // Calculate escape direction (away from mouse)
      const angle = Math.atan2(logoCenter.y - mousePos.y, logoCenter.x - mousePos.x);
      const escapeDistance = Math.max(0, (150 - distance) / 8);
      
      // Set new position
      setMeetPosition({
        x: Math.cos(angle) * escapeDistance,
        y: Math.sin(angle) * escapeDistance
      });
      
      setIsEscaping(true);
    } else {
      // Return to original position
      setMeetPosition({ x: 0, y: 0 });
      setIsEscaping(false);
    }
  };
  
  // Add global mouse movement handler to ensure reset when cursor moves far away
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!logoRef.current || !titleRef.current) return;
      
      const titleRect = titleRef.current.getBoundingClientRect();
      
      // If mouse is far away from the title area, reset the position
      if (
        e.clientX < titleRect.left - 100 || 
        e.clientX > titleRect.right + 100 || 
        e.clientY < titleRect.top - 100 || 
        e.clientY > titleRect.bottom + 100
      ) {
        setMeetPosition({ x: 0, y: 0 });
        setIsEscaping(false);
      }
    };
    
    // Add global handler
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);  // Empty dependency array ensures this only runs once on mount
  
  return (
    <div className="bg-[#014a2f] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold mb-6" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}>
            <span className="text-[#FFC107]">Easy</span>
            <span 
              ref={logoRef}
              style={{
                display: 'inline-block',
                transform: `translate(${meetPosition.x}px, ${meetPosition.y}px)`,
                transition: isEscaping ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                zIndex: 10
              }}
            >MEET</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">
            A comprehensive solution for managing meetings and tracking attendee participation in NCCG
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/meetings/new')}
              className="bg-[#FFC107] hover:bg-[#E0A800] text-[#014a2f] font-medium px-8 py-3 rounded-md transition-colors"
            >
              Create Meeting
            </button>
            <Link 
              href="#meetings"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-md transition-colors"
            >
              Browse Meetings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
