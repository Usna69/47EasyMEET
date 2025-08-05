"use client";

import React from "react";
import { useApiSubmission } from "@/lib/form-hooks";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";
import UserTable from "@/components/UserTable";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import UserCreateForm from "@/components/UserCreateForm";
import DualColorSpinner from "@/components/DualColorSpinner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  createdAt: string;
  userLetterhead?: string;
}

export default function UserManagement() {
  const router = useRouter();
  const auth = useSessionAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [createLoading, setCreateLoading] = React.useState(false);

  const { submitRequest, error, success, clearMessages } = useApiSubmission();

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    try {
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

        const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (auth.isLoggedIn) {
      fetchUsers();
    }
  }, [auth.isLoggedIn, fetchUsers]);

  // Create user
  const handleCreateUser = React.useCallback(async (userData: any) => {
    setCreateLoading(true);
    try {
    const result = await submitRequest(
      async () => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create user");
      }

        return response.json();
      },
      "User created successfully"
      );

    if (result) {
      setShowCreateForm(false);
      fetchUsers();
      }
    } finally {
      setCreateLoading(false);
    }
  }, [submitRequest, fetchUsers]);

  // Delete user
  const handleDeleteUser = React.useCallback(async () => {
    if (!userToDelete) return;

    const result = await submitRequest(
      async () => {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete user");
        }

        return response.json();
      },
      "User deleted successfully"
    );

    if (result) {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      fetchUsers();
    }
  }, [submitRequest, userToDelete]);

  // Handle delete confirmation
  const handleDeleteClick = React.useCallback((user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }, []);

  // Handle cancel delete
  const handleCancelDelete = React.useCallback(() => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  }, []);

  // Handle create form toggle
  const handleCreateFormToggle = React.useCallback(() => {
    setShowCreateForm(!showCreateForm);
    if (showCreateForm) {
      clearMessages();
    }
  }, [showCreateForm, clearMessages]);

  // Redirect if not admin
  if (auth.isLoggedIn && auth.user?.role !== "ADMIN") {
    router.push("/admin");
    return null;
    }

  // Show login message if not authenticated
  if (!auth.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access user management.
          </p>
          <button
            onClick={() => router.push("/admin/login")}
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#014a2f]">User Management</h1>
          <button
            onClick={handleCreateFormToggle}
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {showCreateForm ? "Cancel" : "Create User"}
          </button>
      </div>

        {/* Success/Error Messages */}
      {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
        </div>
      )}

      {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
        </div>
      )}

        {/* Create User Form */}
        {showCreateForm && (
          <div className="mb-6">
            <UserCreateForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
              loading={createLoading}
            />
          </div>
        )}

        {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <DualColorSpinner />
        </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No users found</h3>
            <p className="text-gray-500">Create your first user to get started!</p>
          </div>
        ) : (
          <UserTable users={users} onDeleteUser={handleDeleteClick} />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && userToDelete && (
        <DeleteUserDialog
          user={userToDelete}
          onConfirm={handleDeleteUser}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
