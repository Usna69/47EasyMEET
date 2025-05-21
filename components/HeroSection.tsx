'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HeroSection() {
  const router = useRouter();
  
  return (
    <div className="bg-[#014a2f] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-yellow-400">Easy</span>MEET
          </h1>
          <p className="text-xl mb-8 opacity-90">
            A comprehensive solution for managing meetings and tracking attendee participation in NCCG
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/meetings/new')}
              className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] font-medium px-8 py-3 rounded-md transition-colors"
            >
              Create Meeting
            </button>
            <Link 
              href="/"
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
