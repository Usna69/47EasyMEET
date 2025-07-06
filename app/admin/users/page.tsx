"use client";

import React from "react";
import Link from "next/link";
import { useSessionAuth } from "../../../lib/session-auth";
import UserCreateForm from "../../../components/UserCreateForm";
import PasswordResetForm from "../../../components/PasswordResetForm";
import UserTable from "../../../components/UserTable";
import DeleteUserDialog from "../../../components/DeleteUserDialog";
import PasswordResetBanner from "../../../components/PasswordResetBanner";

const { useState, useEffect } = React;

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
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

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

  const handleCreateUser = async (userData: NewUser & { letterheadPath?: string }) => {
    try {
      setError("");
      setSuccess("");
      setCreateUserLoading(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
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
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      setError("");
      setSuccess("");
      setResetPasswordLoading(true);

      const response = await fetch(
        `/api/users/${userId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (response.ok) {
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
    } finally {
      setResetPasswordLoading(false);
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
      setDeleteUserLoading(true);

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
    } finally {
      setDeleteUserLoading(false);
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
        <UserCreateForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
          loading={createUserLoading}
        />
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
      <DeleteUserDialog
        user={userToDelete}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        loading={deleteUserLoading}
      />

      {/* Password Reset Form */}
      {showResetForm && (
        <PasswordResetForm
          users={users}
          onSubmit={handleResetPassword}
          onCancel={() => setShowResetForm(false)}
          loading={resetPasswordLoading}
        />
      )}

      {/* Password Reset Notification Banner */}
      <PasswordResetBanner
        users={users}
        onResetPassword={(userId) => {
          setSelectedUserId(userId);
          setShowResetForm(true);
        }}
      />

      {/* Users Table/Card View */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
        </div>
      ) : (
        <UserTable
          users={users}
          currentUserRole={auth.user?.role}
          onResetPassword={(userId) => {
            setSelectedUserId(userId);
            setShowResetForm(true);
          }}
          onClearResetRequest={handleClearResetRequest}
          onDeleteUser={(user) => {
            setUserToDelete(user);
            setShowDeleteConfirm(true);
          }}
          onManagePasswords={() => setShowResetForm(true)}
        />
      )}
    </div>
  );
}
