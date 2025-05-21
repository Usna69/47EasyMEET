'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check if already on login page
    if (pathname === '/admin/login') {
      return;
    }
    
    // Redirect to login if not authenticated
    if (!auth.isLoggedIn) {
      router.push('/admin/login');
    }
  }, [auth.isLoggedIn, router, pathname]);

  // If on login page or not logged in, just show the children
  if (pathname === '/admin/login' || !auth.isLoggedIn) {
    return <>{children}</>;
  }

  // Otherwise, show admin layout with logged in user
  return (
    <div>
      <div className="bg-green-100 py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-green-800">
            Logged in as <span className="font-medium">{auth.username}</span>
          </p>
          <button 
            onClick={() => {
              auth.logout();
              router.push('/admin/login');
            }}
            className="text-green-700 hover:text-green-900"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
