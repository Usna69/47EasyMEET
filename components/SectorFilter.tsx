'use client';

import React from 'react';

interface Sector {
  name: string;
  code: string;
}

interface SectorFilterProps {
  selectedSector: string;
  onSectorChange: (sectorCode: string) => void;
  sectors: Sector[];
  className?: string;
}

export default function SectorFilter({ selectedSector, onSectorChange, sectors, className = '' }: SectorFilterProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        className="block w-full px-3 py-2 text-sm border-none rounded-md bg-[#014a2f]/90 text-white focus:outline-none focus:ring-1 focus:ring-white appearance-none transition-colors"
        value={selectedSector}
        onChange={(e) => onSectorChange(e.target.value)}
      >
        <option value="" className="bg-[#014a2f] text-white">All Sectors</option>
        {sectors.map((sector) => (
          <option key={sector.code} value={sector.code} className="bg-[#014a2f] text-white">
            {sector.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
