"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSessionAuth } from "@/lib/session-auth";

const { useState, useEffect } = React;

export default function FirstLoginPage() {
  const router = useRouter();
  const auth = useSessionAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in or not first login
  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push("/admin/login");
      return;
    }

    // Check if user is not on first login
    if (auth.user && !auth.user.isFirstLogin) {
      router.push("/admin");
      return;
    }
  }, [auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/first-login-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: auth.user?.email,
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          <span className="text-yellow-500">Easy</span>
          <span className="text-[#014a2f]">MEET</span>
          <span className="block text-sm text-gray-600 mt-1">
            First Login - Password Reset
          </span>
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Welcome! Please set a new password for your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
              disabled={loading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
} 