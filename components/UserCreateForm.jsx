"use client";

import React, { useState } from "react";
import UserLetterheadUploader from "./UserLetterheadUploader";


export default function UserCreateForm({ onSubmit, onCancel, loading }) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "CREATOR",
    department: "",
    designation: "",
  });
  const [letterheadPath, setLetterheadPath] = useState<string>("");

  // Define role options
  const roleOptions = [
    { value: "ADMIN", label: "Administrator" },
    { value: "CREATOR", label: "Meeting Creator" },
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

  const handleInputChange = (
    e
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...newUser, letterheadPath });
  };

  const handleLetterheadUploadSuccess = (path) => {
    setLetterheadPath(path);
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

        {/* Custom Letterhead Upload Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-[#014a2f] mb-3">
            Custom Letterhead (Optional)
          </h3>
          <UserLetterheadUploader onUploadSuccess={handleLetterheadUploadSuccess} />
        </div>

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