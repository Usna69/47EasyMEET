'use client';

import React from 'react';
const { useEffect } = React;
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * This component preserves scroll position when navigating between pages
 * or when URL parameters change
 */
export default function ScrollPreservation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Store the current scroll position when navigating
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    
    // Restore scroll position when the component mounts
    const restoreScrollPosition = () => {
      const scrollPosition = sessionStorage.getItem('scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
      }
    };
    
    // Add event listener for before page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Restore the scroll position
    if (typeof window !== 'undefined') {
      // Small delay to ensure content has rendered
      setTimeout(restoreScrollPosition, 0);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, searchParams]);
  
  return null; // This component doesn't render anything
}
