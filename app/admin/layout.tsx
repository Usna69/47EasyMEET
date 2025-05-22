'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';

const { useEffect } = React;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle authentication redirects on the client side only
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

  // If on login page or not logged in, just show the children without the admin layout
  if (pathname === '/admin/login' || !auth.isLoggedIn) {
    return <>{children}</>;
  }

  // Otherwise, show admin layout with logged in user
  return (
    <div>
      <div className="bg-green-100 py-2 px-4">
        <div className="container mx-auto flex justify-end items-center">
          <button 
            onClick={() => {
              auth.logout();
              router.push('/admin/login');
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
