"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSessionAuth } from "../../lib/session-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useSessionAuth();
  const router = useRouter();
  const pathname = usePathname();

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
            onClick={async () => {
              await auth.logout();
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
