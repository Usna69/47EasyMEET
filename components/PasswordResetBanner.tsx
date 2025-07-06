"use client";

import React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  createdAt: string;
  passwordResetRequested?: boolean;
  customLetterhead?: string;
}

interface PasswordResetBannerProps {
  users: User[];
  onResetPassword: (userId: string) => void;
}

export default function PasswordResetBanner({ users, onResetPassword }: PasswordResetBannerProps) {
  const usersWithResetRequests = users.filter((user: User) => user.passwordResetRequested);

  if (usersWithResetRequests.length === 0) return null;

  return (
    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0 text-yellow-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-yellow-800">
            {usersWithResetRequests.length}{" "}
            {usersWithResetRequests.length === 1 ? "User" : "Users"}{" "}
            {usersWithResetRequests.length === 1 ? "Requires" : "Require"}{" "}
            Password Reset
          </h3>
          <div className="mt-2 text-yellow-700">
            <p>
              The following{" "}
              {usersWithResetRequests.length === 1 ? "user has" : "users have"}{" "}
              requested a password reset:
            </p>
            <ul className="list-disc list-inside mt-1">
              {usersWithResetRequests.map((user: User) => (
                <li key={user.id} className="mt-1">
                  <span className="font-medium">{user.name}</span> ({user.email}) -
                  <button
                    onClick={() => onResetPassword(user.id)}
                    className="text-blue-600 hover:text-blue-800 underline ml-2"
                  >
                    Reset Now
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 