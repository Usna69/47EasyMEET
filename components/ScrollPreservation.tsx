'use client';

import React from 'react';
const { useEffect } = React;
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * This component scrolls to the top when navigating between pages
 */
export default function ScrollPreservation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Scroll to top when route changes
    if (typeof window !== 'undefined') {
      // Small delay to ensure content has rendered
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  }, [pathname, searchParams]);
  
  return null; // This component doesn't render anything
}
