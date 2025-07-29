"use client";

import React from "react";
import { useUserForm, useApiSubmission } from "@/lib/form-hooks";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";
import UserTable from "@/components/UserTable";
import DeleteUserDialog from "@/components/DeleteUserDialog";

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
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <UserCreateFormRefactored
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014a2f]"></div>
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

// Refactored User Create Form Component
interface UserCreateFormRefactoredProps {
  onSubmit: (userData: any) => Promise<void>;
  onCancel: () => void;
}

function UserCreateFormRefactored({ onSubmit, onCancel }: UserCreateFormRefactoredProps) {
  const { formData, updateField, validateForm, errors, isSubmitting } = useUserForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            required
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            required
            minLength={6}
          />
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            required
          >
            <option value="">Select Role</option>
            <option value="ADMIN">Admin</option>
            <option value="CREATOR">Creator</option>
            <option value="USER">User</option>
          </select>
          {errors.role && (
            <p className="text-red-600 text-xs mt-1">{errors.role}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={(e) => updateField('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={(e) => updateField('designation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#014a2f] text-white rounded-md hover:bg-[#014a2f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
