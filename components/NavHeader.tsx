'use client';

import React from 'react';
const { useState, useEffect } = React;
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './navheader.css';

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [meetClickCount, setMeetClickCount] = React.useState(0);
  const [meetAnimation, setMeetAnimation] = React.useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = pathname?.startsWith('/admin');
  
  // Handle MEET click animation
  const handleMeetClick = () => {
    // Increment click counter
    const newClickCount = meetClickCount + 1;
    setMeetClickCount(newClickCount);
    
    // On 5th click, trigger the animation sequence
    if (newClickCount === 5) {
      // First zoom away to the right
      setMeetAnimation('zoom-right');
      
      // After zoom completes, drop from above and bounce
      setTimeout(() => {
        setMeetAnimation('drop-bounce');
        // Reset click counter after animation completes
        setTimeout(() => {
          setMeetClickCount(0);
          setMeetAnimation('');
        }, 1500); // Animation duration
      }, 500); // Zoom duration
    }
  };

  return (
    <header className="bg-[#014a2f] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl md:text-2xl font-semibold flex items-center">
              <span className="text-[#FFC107] mr-1">Easy</span>
              <span 
                className={`meet-text ${meetAnimation}`} 
                onClick={handleMeetClick}
                style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
              >
                MEET
              </span>
              <span className="text-[10px] ml-1 text-white/70">NCCG</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center p-2 rounded hover:bg-[#013d28] focus:outline-none mobile-touch-feedback"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`hover:text-[#FFC107] py-2 ${pathname === '/' ? 'text-[#FFC107]' : 'text-white'}`}>
              Home
            </Link>
          </nav>
        </div>
        
        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-[#013d28]">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className={`hover:bg-[#013d28] py-2 px-3 rounded ${pathname === '/' ? 'text-[#FFC107]' : 'text-white'}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
