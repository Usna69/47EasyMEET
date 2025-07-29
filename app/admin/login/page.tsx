"use client";

import React from "react";
import { useSessionAuth } from "../../../lib/session-auth";

const { useState, useEffect } = React;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const auth = useSessionAuth();

  // Simple check for already logged in users
  useEffect(() => {
    // If already logged in, redirect to admin dashboard
    if (auth?.isLoggedIn) {
      window.location.href = "/admin";
    }
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("Login attempt started");
    console.log("Email:", email);
    console.log("Password length:", password.length);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      console.log("Calling auth.login...");
      // Use the async login function
      const loginResult = await auth.login(email, password);
      console.log("auth.login result:", loginResult);
      
      if (loginResult.success) {
        console.log("Login successful, redirecting...");
        console.log("User data from login:", loginResult.user);
        console.log("isFirstLogin value:", loginResult.user?.isFirstLogin);
        console.log("isFirstLogin type:", typeof loginResult.user?.isFirstLogin);
        console.log("isFirstLogin === true:", loginResult.user?.isFirstLogin === true);
        
        // Check if user is on first login
        if (loginResult.user?.isFirstLogin === true) {
          console.log("User is on first login, redirecting to /admin/first-login");
          window.location.href = "/admin/first-login";
        } else {
          console.log("User is not on first login, redirecting to /admin");
          // Simple redirect to admin dashboard
          window.location.href = "/admin";
        }
      } else {
        console.log("Login failed");
        setError("Invalid credentials - please check your email and password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(
          "Password reset link has been sent to your email address. Please check your inbox and follow the instructions."
        );
        setEmail("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to request password reset");
      }
    } catch (err) {
      setError("An error occurred while requesting password reset");
      console.error("Password reset request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          <span className="text-yellow-500">Easy</span>
          <span className="text-[#014a2f]">MEET</span>
          <span className="block text-sm text-gray-600 mt-1">
            NCCG Authorized User Access
          </span>
        </h1>

        <p className="text-center text-gray-600 mb-6">
          {forgotPassword
            ? "Enter your email to request a password reset"
            : "Sign in to access the system. Your permissions will be determined by your assigned role."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="reset-email">
                Email
              </label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sending Request..." : "Request Password Reset"}
            </button>

            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
                  disabled={loading}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
