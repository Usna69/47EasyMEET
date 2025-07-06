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

interface DeleteUserDialogProps {
  user: User | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteUserDialog({ user, onConfirm, onCancel, loading }: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-[#014a2f] mb-4">
          Delete User Confirmation
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete user <strong>{user.name}</strong> ({user.email})?
        </p>
        <p className="text-sm text-red-600 mb-6">
          This action cannot be undone. All user data will be permanently removed.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
} 