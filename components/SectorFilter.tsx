'use client';

import * as React from 'react';
const { useState, useEffect } = React;

interface SectorFilterProps {
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  sectors: string[];
}

export default function SectorFilter({ selectedSector, onSectorChange, sectors }: SectorFilterProps) {
  return (
    <div className="relative inline-block w-full">
      <select
        className="block w-full px-4 py-2.5 text-base border border-gray-200 rounded-md bg-white text-black focus:outline-none focus:ring-0 max-h-40 overflow-y-auto"
        value={selectedSector}
        onChange={(e) => onSectorChange(e.target.value)}
        size={sectors.length > 0 ? Math.min(sectors.length + 1, 6) : 2}
      >
        <option value="">All Sectors</option>
        {sectors.map((sector) => (
          <option key={sector} value={sector}>
            {sector}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
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
