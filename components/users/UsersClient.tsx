"use client";

import React, { useState, useCallback } from "react";
import { useApiSubmission } from "@/lib/form-hooks";
import UserTable from "@/components/UserTable";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import UserCreateForm from "@/components/UserCreateForm";
import DualColorSpinner from "@/components/DualColorSpinner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  designation?: string | null;
  createdAt: string;
  userLetterhead?: string | null;
}

interface Props {
  users: User[];
}

export default function UsersClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const { submitRequest, error, success, clearMessages } = useApiSubmission();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateUser = useCallback(
    async (userData: any) => {
      setCreateLoading(true);
      try {
        const result = await submitRequest(async () => {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create user");
          }
          return response.json();
        }, "User created successfully");

        if (result) {
          setShowCreateForm(false);
          fetchUsers();
        }
      } finally {
        setCreateLoading(false);
      }
    },
    [submitRequest, fetchUsers],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;
    const result = await submitRequest(async () => {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
      return response.json();
    }, "User deleted successfully");

    if (result) {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    }
  }, [submitRequest, userToDelete, fetchUsers]);

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  }, []);

  const handleCreateFormToggle = useCallback(() => {
    setShowCreateForm((prev) => !prev);
    clearMessages();
  }, [clearMessages]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#014a2f]">
            User Management
          </h1>
          <button
            onClick={handleCreateFormToggle}
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {showCreateForm ? "Cancel" : "Create User"}
          </button>
        </div>

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

        {showCreateForm && (
          <div className="mb-6">
            <UserCreateForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
              loading={createLoading}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <DualColorSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-4">
              No users found
            </h3>
            <p className="text-gray-500">
              Create your first user to get started!
            </p>
          </div>
        ) : (
          <UserTable users={users} onDeleteUser={handleDeleteClick} />
        )}
      </div>

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
