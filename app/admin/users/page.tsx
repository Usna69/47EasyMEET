"use client";

import React from "react";

const { useState, useEffect } = React;
import Link from "next/link";
import { useSessionAuth } from "../../../lib/session-auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  createdAt: string;
  passwordResetRequested?: boolean;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  designation?: string;
}

export default function UserManagement() {
  const auth = useSessionAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [clearingData, setClearingData] = useState(false);
  const [clearDataSuccess, setClearDataSuccess] = useState("");
  const [clearDataError, setClearDataError] = useState("");
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "CREATOR",
    department: "",
    designation: "",
  });

  // Define role options - simplified to just ADMIN and CREATOR
  const roleOptions = [
    { value: "ADMIN", label: "Administrator" },
    { value: "CREATOR", label: "Meeting Creator" },
  ];

  // Define sector options for department dropdown - aligned with other sector dropdowns
  const sectorOptions = [
    { value: "", label: "Select Department" },
    { value: "BA&P", label: "Boroughs Administration and Personnel" },
    { value: "BE&UP", label: "Built Environment and Urban Planning Sector" },
    { value: "B&HO", label: "Business and Hustler Opportunities" },
    { value: "F&EPA", label: "Finance and Economic Planning Affairs" },
    {
      value: "GN",
      label: "Green Nairobi (Environment, Water, Food and Agriculture)",
    },
    { value: "HW&N", label: "Health Wellness and Nutrition" },
    { value: "IDE", label: "Innovation and Digital Economy" },
    {
      value: "IPP&CS",
      label: "Inclusivity, Public Participation and Customer Service Sector",
    },
    { value: "M&W", label: "Mobility and Works" },
    { value: "OG", label: "Office of the Governor" },
    { value: "TS&DC", label: "Talents, Skills Development and Care" },
  ];

  // Only fetch users if authenticated and admin
  useEffect(() => {
    if (auth.isLoggedIn && auth.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [auth.isLoggedIn, auth.user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev: NewUser) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        // Reset form and refetch users
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "CREATOR",
          department: "",
          designation: "",
        });
        setShowCreateForm(false);
        setSuccess("User created successfully");
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An error occurred while creating the user");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (!selectedUserId || !newPassword) {
        setError("User ID and new password are required");
        return;
      }

      const response = await fetch(
        `/api/users/${selectedUserId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (response.ok) {
        setNewPassword("");
        setSelectedUserId("");
        setShowResetForm(false);
        setSuccess("Password reset successfully");
        fetchUsers(); // Refresh users list to update any pending reset requests
      } else {
        const data = await response.json();
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("An error occurred while resetting the password");
    }
  };

  const handleRequestPasswordReset = async (userId: string) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/users/${userId}/request-reset`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Password reset request sent to admin");
        fetchUsers(); // Refresh the users list to show the pending request
      } else {
        const data = await response.json();
        setError(data.error || "Failed to request password reset");
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError("An error occurred while requesting password reset");
    }
  };

  const handleClearResetRequest = async (userId: string) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/users/${userId}/clear-reset-request`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Reset request cleared");
        fetchUsers(); // Refresh the users list
      } else {
        const data = await response.json();
        setError(data.error || "Failed to clear reset request");
      }
    } catch (err) {
      console.error("Error clearing reset request:", err);
      setError("An error occurred while clearing reset request");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess(`User ${userToDelete.name} deleted successfully`);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("An error occurred while deleting the user");
    }
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "WARNING: This will permanently delete ALL meetings, attendees, and resources data. This action cannot be undone. Continue?"
      )
    ) {
      return;
    }

    try {
      setClearingData(true);
      setClearDataError("");
      setClearDataSuccess("");

      const response = await fetch("/api/admin/clear-data", {
        method: "POST",
        // Add cache-busting to prevent cached responses
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClearDataSuccess(data.message || "All data cleared successfully");

        // Method 1: Use the global function if available
        if (
          typeof window !== "undefined" &&
          (window as any).refreshStatsSection
        ) {
          (window as any).refreshStatsSection();
        }

        // Method 2: Dispatch a custom event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("meetingDataChanged"));
        }

        // Method 3: Force refresh of API cache
        try {
          // Invalidate stats cache
          const statsRefresh = await fetch(
            `/api/stats?t=${new Date().getTime()}`
          );
        } catch (refreshErr) {
          console.error("Error refreshing stats:", refreshErr);
        }

        // Refresh the page after a short delay to ensure everything updates
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        setClearDataError(data.error || "Failed to clear data");
      }
    } catch (err) {
      console.error("Error clearing data:", err);
      setClearDataError("An error occurred while clearing data");
    } finally {
      setClearingData(false);
    }
  };

  // Show authentication message if not logged in or not admin
  if (!auth?.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">Please log in to manage users.</p>
          <a
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // If logged in but not admin, show permission error
  if (auth.isLoggedIn && auth.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-red-600">
            Permission Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the user management page. Only
            administrators can manage users.
          </p>
          <a
            href="/admin"
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {clearDataSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {clearDataSuccess}
        </div>
      )}

      {clearDataError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {clearDataError}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/admin"
            className="text-gray-700 hover:text-gray-900 flex items-center mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-[#014a2f]">
            User Management
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleClearAllData}
            disabled={clearingData}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center w-full sm:w-auto"
          >
            {clearingData ? "Clearing..." : "Clear All Meeting Data"}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New User
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
            Create New User
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department/Sector
                </label>
                <select
                  id="department"
                  name="department"
                  value={newUser.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                >
                  {sectorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Designation
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={newUser.designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-[#014a2f] mb-4">
              Delete User Confirmation
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Form */}
      {showResetForm && (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#014a2f]">
              Reset User Password
            </h2>
            <button
              onClick={() => {
                setShowResetForm(false);
                setSelectedUserId("");
                setNewPassword("");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select User
              </label>
              <select
                id="userId"
                name="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                required
              >
                <option value="">Select a user</option>
                {users.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}){" "}
                    {user.passwordResetRequested ? "- Reset Requested" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Reset Notification Banner */}
      {users.filter((user: User) => user.passwordResetRequested).length > 0 && (
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
                {
                  users.filter((user: User) => user.passwordResetRequested)
                    .length
                }{" "}
                {users.filter((user: User) => user.passwordResetRequested)
                  .length === 1
                  ? "User"
                  : "Users"}{" "}
                {users.filter((user: User) => user.passwordResetRequested)
                  .length === 1
                  ? "Requires"
                  : "Require"}{" "}
                Password Reset
              </h3>
              <div className="mt-2 text-yellow-700">
                <p>
                  The following{" "}
                  {users.filter((user: User) => user.passwordResetRequested)
                    .length === 1
                    ? "user has"
                    : "users have"}{" "}
                  requested a password reset:
                </p>
                <ul className="list-disc list-inside mt-1">
                  {users
                    .filter((user: User) => user.passwordResetRequested)
                    .map((user: User) => (
                      <li key={user.id} className="mt-1">
                        <span className="font-medium">{user.name}</span> (
                        {user.email}) -
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowResetForm(true);
                          }}
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
      )}

      {/* Users Table/Card View */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#014a2f]">System Users</h2>
          <button
            onClick={() => setShowResetForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-4 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Manage Passwords
          </button>
        </div>

        {/* Pending reset requests notification */}
        {users.some((user: User) => user.passwordResetRequested) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-400 mr-2 mt-0.5"
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
            <div>
              <p className="font-medium text-yellow-700">
                Password Reset Requests
              </p>
              <p className="text-sm text-yellow-600">
                There are pending password reset requests. Please review and
                reset passwords as needed.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-4">
            No users found. Create your first user!
          </p>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{user.department || "-"}</td>
                      <td className="px-4 py-2">
                        {user.passwordResetRequested ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Reset Requested
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        {/* Only show user management buttons for admins */}
                        {auth.user?.role === "ADMIN" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setShowResetForm(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                              </svg>
                              Reset Password
                            </button>

                            {user.passwordResetRequested && (
                              <button
                                onClick={() => handleClearResetRequest(user.id)}
                                className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Clear Request
                              </button>
                            )}

                            {/* Delete user button */}
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Shown only on Mobile */}
            <div className="md:hidden space-y-4">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  <div className="flex flex-col space-y-4 sm:space-y-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-500 w-24">
                          Email:
                        </span>
                        <span className="text-gray-900">{user.email}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="font-medium text-gray-500 w-24">
                          Department:
                        </span>
                        <span className="text-gray-900">
                          {user.department || "-"}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="font-medium text-gray-500 w-24">
                          Status:
                        </span>
                        {user.passwordResetRequested ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Reset Requested
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {auth.user?.role === "ADMIN" && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowResetForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                            Reset Password
                          </button>

                          {user.passwordResetRequested && (
                            <button
                              onClick={() => handleClearResetRequest(user.id)}
                              className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Clear Request
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800 flex items-center text-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
