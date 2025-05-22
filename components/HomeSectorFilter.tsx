'use client';

import React from 'react';
const { useState, useEffect } = React;
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getAllSectors } from '../utils/sectorUtils';
import { fetchMeetings } from '../lib/api';

export default function HomeSectorFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || '');
  
  // Get the list of sectors from our utility
  const sectors = getAllSectors();
  
  // Initialize selected sector from session storage or URL on component mount
  useEffect(() => {
    // First check URL params
    const sectorFromUrl = searchParams.get('sector');
    // Then check session storage
    const savedSector = typeof window !== 'undefined' ? sessionStorage.getItem('selectedSector') : null;
    
    // Use URL param first, then session storage
    const initialSector = sectorFromUrl || savedSector || '';
    if (initialSector !== selectedSector) {
      setSelectedSector(initialSector);
    }
  }, [searchParams]);

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    const sectorCode = e.target.value;
    setSelectedSector(sectorCode);
    
    // Save to session storage for persistence across page loads
    if (typeof window !== 'undefined') {
      if (sectorCode) {
        sessionStorage.setItem('selectedSector', sectorCode);
      } else {
        sessionStorage.removeItem('selectedSector');
      }
    }
    
    // Update URL without navigation (prevents scroll jumping)
    const params = new URLSearchParams(searchParams.toString());
    if (sectorCode) {
      params.set('sector', sectorCode);
    } else {
      params.delete('sector');
    }
    
    // Use replaceState instead of pushState to avoid adding to browser history
    const url = `${pathname}?${params.toString()}`;
    window.history.replaceState({ path: url }, '', url);
    
    // Dispatch event for the ClientMeetings component to handle
    const event = new CustomEvent('sectorfilterchange', { detail: { sector: sectorCode } });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm rounded-md p-4 border border-gray-200">
        <div className="font-medium text-gray-700">Filter by Sector:</div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedSector}
            onChange={handleSectorChange}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#014a2f] focus:border-[#014a2f]"
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector.code} value={sector.code}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
