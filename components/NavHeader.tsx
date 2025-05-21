'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import './navheader.css';

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sector, setSector] = React.useState('');
  const [meetClickCount, setMeetClickCount] = React.useState(0);
  const [meetAnimation, setMeetAnimation] = React.useState('');
  const isAdmin = pathname?.startsWith('/admin');
  
  // Initialize sector from URL on component mount
  React.useEffect(() => {
    const sectorParam = searchParams.get('sector');
    if (sectorParam) {
      setSector(sectorParam);
    }
  }, [searchParams]);

  // Handle sector change
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSector = e.target.value;
    setSector(newSector);
    
    // Update URL with sector filter
    const params = new URLSearchParams(searchParams.toString());
    if (newSector) {
      params.set('sector', newSector);
    } else {
      params.delete('sector');
    }
    
    // Navigate to home with filter
    router.push(`/${params.toString() ? `?${params.toString()}` : ''}`);
  };
  
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
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-semibold flex items-center">
              <span className="text-[#FFC107] mr-1">Easy</span>
              <span 
                className={`meet-text ${meetAnimation}`} 
                onClick={handleMeetClick}
                style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
              >
                MEET
              </span>
              <span className="text-xs ml-2 text-white/80">NCCG</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6">
            <div className="relative">
              <select
                value={sector}
                onChange={handleSectorChange}
                className="appearance-none bg-[#014a2f] border border-[#014a2f] hover:border-[#FFC107] text-white px-4 py-2 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50 transition-colors cursor-pointer"
              >
                <option value="">All Sectors</option>
                <option value="IDE">ICT & Digital Economy</option>
                <option value="FIN">Finance</option>
                <option value="EDU">Education</option>
                <option value="HEA">Health</option>
                <option value="AGR">Agriculture</option>
                <option value="TRA">Transport</option>
                <option value="ENV">Environment</option>
                <option value="SEC">Security</option>
                <option value="OTH">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
