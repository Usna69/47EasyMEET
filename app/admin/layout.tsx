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
  const [resetRequestCount, setResetRequestCount] = React.useState(0);

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
  
  // Fetch password reset request count for admin users
  useEffect(() => {
    if (auth.isLoggedIn && auth.user?.role === 'ADMIN') {
      const fetchResetRequests = async () => {
        try {
          const response = await fetch('/api/users/password-reset-requests', {
            // Add cache-busting to ensure we get fresh data
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Password reset requests found:', data.length);
            setResetRequestCount(data.length);
          }
        } catch (err) {
          console.error('Error fetching password reset requests:', err);
        }
      };
      
      // Fetch immediately
      fetchResetRequests();
      
      // Set up interval to check for new reset requests every 15 seconds for testing
      // and every minute for production
      const intervalId = setInterval(fetchResetRequests, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [auth.isLoggedIn, auth.user]);

  // If on login page or not logged in, just show the children without the admin layout
  if (pathname === '/admin/login' || !auth.isLoggedIn) {
    return <>{children}</>;
  }

  // Otherwise, show admin layout with logged in user
  return (
    <div>
      <div className="bg-green-100 py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {pathname !== '/admin/users' && resetRequestCount > 0 && (
              <a 
                href="/admin/users" 
                className="relative inline-flex items-center text-sm font-medium text-indigo-700 hover:text-indigo-900"
              >
                <span>Password Reset Requests</span>
                <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {resetRequestCount}
                </span>
              </a>
            )}
          </div>
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
