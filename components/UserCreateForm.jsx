"use client";

import React, { useState } from "react";
import UserLetterheadUploader from "./UserLetterheadUploader";
import SWGLetterheadUploader from "./SWGLetterheadUploader";

export default function UserCreateForm({ onSubmit, onCancel, loading }) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "CREATOR",
    department: "",
    designation: "",
    userLevel: "REGULAR",
    customRole: "",
  });
  const [userLetterheadPath, setUserLetterheadPath] = useState("");
  const [swgLetterheadPath, setSwgLetterheadPath] = useState("");
  const [formError, setFormError] = useState("");

  // Define role options
  const roleOptions = [
    { value: "ADMIN", label: "Administrator" },
    { value: "CREATOR", label: "Meeting Creator" },
    { value: "VIEW_ONLY", label: "View Only" },
  ];

  // Define user level options for RBA
  const userLevelOptions = [
    { value: "REGULAR", label: "Regular User" },
    { value: "BOARD_MEMBER", label: "Board Member" },
    { value: "GOVERNOR_OFFICE", label: "Office of the Governor" },
    { value: "CABINET", label: "Cabinet Member" },
  ];

  // Define sector options for department dropdown
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => {
      const updatedUser = { ...prev, [name]: value };
      
      // Auto-generate custom role description based on user level
      if (name === 'userLevel') {
        switch (value) {
          case "BOARD_MEMBER":
            updatedUser.customRole = "Board Member - High-level governance and decision-making role";
            break;
          case "GOVERNOR_OFFICE":
            updatedUser.customRole = "Office of the Governor - Executive and gubernatorial functions";
            break;
          case "CABINET":
            updatedUser.customRole = "Cabinet Member - Executive cabinet and ministerial responsibilities";
            break;
          default:
            updatedUser.customRole = "";
        }
      }
      
      return updatedUser;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    
    // Only require letterhead for non-VIEW_ONLY users
    if (newUser.role !== "VIEW_ONLY" && !userLetterheadPath) {
      setFormError("Sector letterhead is required.");
      return;
    }
    
    // Set department to null for admin users
    const userData = { 
      ...newUser, 
      password: "", 
      userLetterheadPath, 
      swgLetterheadPath,
      department: newUser.role === "ADMIN" ? null : newUser.department
    };
    onSubmit(userData);
  };

  const handleUserLetterheadUploadSuccess = (path) => {
    setUserLetterheadPath(path);
  };

  const handleSwgLetterheadUploadSuccess = (path) => {
    setSwgLetterheadPath(path);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#014a2f]">
        Create New User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              type="text"
              id="password"
              name="password"
              value="Temporary password will be auto-generated"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              A secure temporary password will be automatically generated and sent via email. 
              The user will be required to change it on first login.
            </p>
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
              htmlFor="userLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User Level
            </label>
            <select
              id="userLevel"
              name="userLevel"
              value={newUser.userLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
              required
            >
              {userLevelOptions.map((option) => (
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
              Department/Sector {newUser.role === "ADMIN" && "(Not required for Admin)"}
            </label>
            <select
              id="department"
              name="department"
              value={newUser.department || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f] focus:border-transparent"
              required={newUser.role !== "ADMIN"}
              disabled={newUser.role === "ADMIN"}
            >
              {sectorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {newUser.role === "ADMIN" && (
              <p className="text-xs text-gray-500 mt-1">
                Administrators have access to all departments and sectors.
              </p>
            )}
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

          {/* Custom Role Field - Only show for non-regular users */}
          {newUser.userLevel !== "REGULAR" && (
            <div className="md:col-span-2">
              <label
                htmlFor="customRole"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Custom Role Description
              </label>
                             <textarea
                 id="customRole"
                 name="customRole"
                 value={newUser.customRole}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                 rows={3}
                 readOnly
                 disabled
               />
               <p className="text-xs text-gray-500 mt-1">
                 Auto-generated description based on user level selection.
               </p>
            </div>
          )}
        </div>

        {/* Custom Letterhead Upload Section */}
        {newUser.role !== "VIEW_ONLY" && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-[#014a2f] mb-3">
            Sector Letterhead (Required)
          </h3>
          <UserLetterheadUploader onUploadSuccess={handleUserLetterheadUploadSuccess} />
        </div>
        )}

        {/* SWG Letterhead Upload Section */}
        {newUser.role !== "VIEW_ONLY" && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-[#014a2f] mb-3">
            SWG Letterhead (Optional)
          </h3>
          <SWGLetterheadUploader onUploadSuccess={handleSwgLetterheadUploadSuccess} />
        </div>
        )}

        {formError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
} 