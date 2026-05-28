"use client";

import React, { useState } from "react";
import { useApiSubmission } from "@/lib/form-hooks";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  designation?: string | null;
  userLevel?: string;
  customRole?: string | null;
}

export default function ProfileClient({
  profile: initialProfile,
  isAdmin,
}: {
  profile: UserProfile;
  isAdmin: boolean;
}) {
  // Profile state (initialised from server)
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(initialProfile.name);
  const [editEmail, setEditEmail] = useState(initialProfile.email);
  const [editDepartment, setEditDepartment] = useState(
    initialProfile.department || "",
  );
  const [editDesignation, setEditDesignation] = useState(
    initialProfile.designation || "",
  );
  const [editUserLevel, setEditUserLevel] = useState(
    initialProfile.userLevel || "REGULAR",
  );
  const [editCustomRole, setEditCustomRole] = useState(
    initialProfile.customRole || "",
  );

  // Password change steps
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    submitRequest,
    error: apiError,
    success: apiSuccess,
    clearMessages,
  } = useApiSubmission();

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setSaving(true);
    try {
      const result = await submitRequest(async () => {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            department: editDepartment || null,
            designation: editDesignation || null,
            userLevel: editUserLevel,
            customRole: editCustomRole || null,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update profile");
        }
        return res.json();
      }, "Profile updated successfully");

      if (result) {
        setProfile({
          ...profile,
          name: editName,
          email: editEmail,
          department: editDepartment || null,
          designation: editDesignation || null,
          userLevel: editUserLevel,
          customRole: editCustomRole || null,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Password verification step 1
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!currentPassword) return;
    setVerifying(true);
    try {
      const result = await submitRequest(async () => {
        const res = await fetch("/api/user/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: currentPassword }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Incorrect current password");
        }
        return res.json();
      }, "Password verified – you can now set a new password.");
      if (result) {
        setPasswordVerified(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Password change step 2
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) {
      submitRequest(async () => {
        throw new Error("New passwords do not match");
      }, "");
      return;
    }
    if (newPassword.length < 8) {
      submitRequest(async () => {
        throw new Error("Password must be at least 8 characters");
      }, "");
      return;
    }
    setChangingPassword(true);
    try {
      const result = await submitRequest(async () => {
        const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update password");
        }
        return res.json();
      }, "Password changed successfully");
      if (result) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordVerified(false);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#014a2f] mb-6">
          User Profile
        </h1>

        {apiSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {apiSuccess}
          </div>
        )}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {apiError}
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-5">
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Department / Sector
              </label>
              <input
                type="text"
                id="department"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                disabled={!isAdmin}
              />
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
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="userLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                User Level
              </label>
              <select
                id="userLevel"
                value={editUserLevel}
                onChange={(e) => {
                  setEditUserLevel(e.target.value);
                  const level = e.target.value;
                  if (level !== "REGULAR") {
                    const descriptions: Record<string, string> = {
                      BOARD_MEMBER:
                        "Board Member - High-level governance and decision-making role",
                      GOVERNOR_OFFICE:
                        "Office of the Governor - Executive and gubernatorial functions",
                      CABINET:
                        "Cabinet Member - Executive cabinet and ministerial responsibilities",
                    };
                    setEditCustomRole(descriptions[level] || "");
                  } else {
                    setEditCustomRole("");
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                disabled={!isAdmin}
              >
                <option value="REGULAR">Regular User</option>
                <option value="BOARD_MEMBER">Board Member</option>
                <option value="GOVERNOR_OFFICE">Office of the Governor</option>
                <option value="CABINET">Cabinet Member</option>
              </select>
            </div>

            {editUserLevel !== "REGULAR" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="customRole"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Custom Role Description
                </label>
                <textarea
                  id="customRole"
                  value={editCustomRole}
                  onChange={(e) => setEditCustomRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  rows={3}
                  disabled={!isAdmin}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated description based on user level selection.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Password Change Section */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold text-[#014a2f] mb-4">
            Change Password
          </h2>

          {!passwordVerified ? (
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "Verify Password"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="text-sm text-green-600 font-medium">
                ✓ Current password verified. Enter your new password below.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordVerified(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    clearMessages();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
