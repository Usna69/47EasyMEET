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

interface UserTableProps {
  users: User[];
  currentUserRole?: string;
  onResetPassword: (userId: string) => void;
  onClearResetRequest: (userId: string) => void;
  onDeleteUser: (user: User) => void;
  onManagePasswords: () => void;
}

export default function UserTable({
  users,
  currentUserRole,
  onResetPassword,
  onClearResetRequest,
  onDeleteUser,
  onManagePasswords,
}: UserTableProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#014a2f]">System Users</h2>
        <button
          onClick={onManagePasswords}
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

      {users.length === 0 ? (
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
                      {currentUserRole === "ADMIN" && (
                        <>
                          <button
                            onClick={() => onResetPassword(user.id)}
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
                              onClick={() => onClearResetRequest(user.id)}
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
                            onClick={() => onDeleteUser(user)}
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

                  {currentUserRole === "ADMIN" && (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onResetPassword(user.id)}
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
                            onClick={() => onClearResetRequest(user.id)}
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
                          onClick={() => onDeleteUser(user)}
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
  );
} 