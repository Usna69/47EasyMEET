import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-[#014a2f] text-white py-8 md:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-8">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <a 
                  href="https://maps.google.com/?q=City+Hall,+Nairobi,+Kenya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start hover:text-[#FFC107] transition-colors group"
                >
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-[#FFC107] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white/80 group-hover:text-white">
                    City Hall, Nairobi, Kenya
                  </span>
                </a>
              </li>
              <li className="flex items-start">
                <a 
                  href="mailto:info@nairobi.go.ke" 
                  className="flex items-start hover:text-[#FFC107] transition-colors group"
                >
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-[#FFC107] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/80 group-hover:text-white">
                    info@nairobi.go.ke
                  </span>
                </a>
              </li>
              <li className="flex items-start">
                <a 
                  href="tel:+254207247047" 
                  className="flex items-start hover:text-[#FFC107] transition-colors group"
                >
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-[#FFC107] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/80 group-hover:text-white">
                    +254 20 724 7047
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-6 md:mt-10 pt-4 md:pt-6 text-center text-white/60 text-sm md:text-base">
          <p>&copy; 2025 SMART NAIROBI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
