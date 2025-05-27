"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionAuth } from "../../lib/session-auth";

const { useEffect } = React;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useSessionAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [resetRequestCount, setResetRequestCount] = React.useState(0);

  // Remove all automatic redirects from the layout
  // Each page will handle its own authentication display

  // Fetch password reset request count for admin users
  useEffect(() => {
    if (auth.isLoggedIn && auth.user?.role === "ADMIN") {
      const fetchResetRequests = async () => {
        try {
          const response = await fetch("/api/users/password-reset-requests", {
            // Add cache-busting to ensure we get fresh data
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });
          if (response.ok) {
            const data = await response.json();
            setResetRequestCount(data.length);
          }
        } catch (err) {
          console.error("Error fetching password reset requests:", err);
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
  if (pathname === "/admin/login" || !auth.isLoggedIn) {
    return <>{children}</>;
  }

  // Otherwise, show admin layout with logged in user
  return (
    <>
      <div className="bg-green-100 py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Password reset notification removed as requested */}
          </div>
          <button
            onClick={() => {
              auth.logout();
              router.push("/admin/login");
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
