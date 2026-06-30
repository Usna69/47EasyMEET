"use client";

import React from "react";
const { useState, useEffect } = React;
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionAuth } from "@/lib/session-auth";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import "./navheader.css";
import { signOutAction } from "./login/SignOut";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface NavHeaderProps {
  isLoggedIn: boolean;
  // optional: userEmail, userRole, etc.
}

export default function NavHeader({ isLoggedIn }: NavHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useSessionAuth();
  const [meetClickCount, setMeetClickCount] = React.useState(0);
  const [meetAnimation, setMeetAnimation] = React.useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // new state

  const isAdmin = pathname?.startsWith("/admin");

  const isCreatorOrAdmin =
    auth?.user?.role === "ADMIN" || auth?.user?.role === "CREATOR";

  const handleMeetClick = () => {
    const newClickCount = meetClickCount + 1;
    setMeetClickCount(newClickCount);

    if (newClickCount === 5) {
      setMeetAnimation("zoom-right");
      setTimeout(() => {
        setMeetAnimation("drop-bounce");
        setTimeout(() => {
          setMeetClickCount(0);
          setMeetAnimation("");
        }, 1500);
      }, 500);
    }
  };

  // Logout handlers (same pattern as SidebarClient)
  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    signOutAction();
  };

  return (
    <header className="bg-[#014a2f] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl md:text-2xl font-semibold flex items-center"
            >
              <span className="text-[#FFC107] mr-1">Easy</span>
              <span
                className={`meet-text ${meetAnimation}`}
                onClick={handleMeetClick}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                MEET
              </span>
              <span className="text-[10px] ml-1 text-white/70">NCCG</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center p-2 rounded hover:bg-[#013d28] focus:outline-none mobile-touch-feedback"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`hover:text-[#FFC107] py-2 ${pathname === "/" ? "text-[#FFC107]" : "text-white"}`}
            >
              Home
            </Link>

            <Link
              href="/profile"
              className={`hover:text-[#FFC107] py-2 ${pathname === "/convert" ? "text-[#FFC107]" : "text-white"}`}
            >
              Profile
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[#013d28] hover:text-red-300"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[#013d28] hover:text-[#FFC107]"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-[#013d28]">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className={`hover:bg-[#013d28] py-2 px-3 rounded ${pathname === "/" ? "text-[#FFC107]" : "text-white"}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/profile"
                className={`hover:bg-[#013d28] py-2 px-3 rounded ${pathname === "/convert" ? "text-[#FFC107]" : "text-white"}`}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>

              {/* Conditionally render Sign out or Login */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[#013d28] hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              ) : (
                <Link
                  href="/admin/login"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[#013d28] hover:text-[#FFC107]"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
