"use client";

import React from "react";
import { getSectorName } from "../utils/sectorUtils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  createdAt: string;
  customLetterhead?: string;
}

interface UserTableProps {
  users: User[];
  currentUserRole?: string;
  onDeleteUser: (user: User) => void;
}

export default function UserTable({
  users,
  currentUserRole,
  onDeleteUser,
}: UserTableProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#014a2f]">System Users</h2>
      </div>

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
                  <th className="px-4 py-2 text-left">Designation</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-2">{user.name}</td>
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
                    <td className="px-4 py-2">{user.department ? getSectorName(user.department) : "-"}</td>
                    <td className="px-4 py-2">{user.designation || "-"}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const date = new Date(user.createdAt);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => onDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 flex items-center"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on Desktop */}
          <div className="md:hidden space-y-4">
            {users.map((user: User) => (
              <div
                key={user.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
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
                <div className="text-sm text-gray-600 mb-3">
                  <p>Department: {user.department ? getSectorName(user.department) : "-"}</p>
                  <p>Designation: {user.designation || "-"}</p>
                  <p>Created: {(() => {
                    const date = new Date(user.createdAt);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${day}-${month}-${year}`;
                  })()}</p>
                </div>
                <div className="flex justify-end">
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
            ))}
          </div>
        </>
      )}
    </div>
  );
} 