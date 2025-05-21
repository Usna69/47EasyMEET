'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="bg-[#014a2f] text-white shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-semibold flex items-center">
              <span className="text-[#FFC107] mr-1">Easy</span><span>MEET</span>
              <span className="text-xs ml-2 text-white/80">NCCG</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-[#FFC107] transition-colors ${
                pathname === '/' ? 'text-[#FFC107] font-medium' : ''
              }`}
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
