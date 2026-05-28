"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSectorName } from "@/utils/sectorUtils";

interface CreateMeetingClientProps {
  userEmail: string;
  userRole: string;
  userDepartment: string;
  canCreate: boolean;
}

export default function CreateMeetingClient({
  userEmail,
  userRole,
  userDepartment,
  canCreate,
}: CreateMeetingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorPopup, setErrorPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [sector, setSector] = useState(userDepartment); // pre‑filled from server
  const [meetingType, setMeetingType] = useState("PHYSICAL");
  const [meetingCategory, setMeetingCategory] = useState("INTERNAL");
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState("");
  const [resources, setResources] = useState<File[]>([]);
  const [password, setPassword] = useState("");

  // Keep sector in sync if userDepartment changes (unlikely, but safe)
  useEffect(() => {
    if (userDepartment) setSector(userDepartment);
  }, [userDepartment]);

  // ─── Helpers ─────────────────────────────────────────────────
  const calculateRegistrationEnd = () => {
    if (!date || !time) return null;
    const meetingDateTime = new Date(`${date}T${time}`);
    const registrationEnd = new Date(meetingDateTime);
    registrationEnd.setHours(registrationEnd.getHours() + 2);
    return registrationEnd.toISOString();
  };

  const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResources((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorPopup(false);
    setSuccessPopup(false);
    setLoading(true);

    try {
      // Basic validation
      if (!title || !description || !date || !time || !sector) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (meetingType === "PHYSICAL" && !location) {
        setError("Please provide a physical location");
        setLoading(false);
        return;
      }

      if (
        (meetingType === "ONLINE" || meetingType === "HYBRID") &&
        !onlineMeetingUrl
      ) {
        setError("Please provide an online meeting URL");
        setLoading(false);
        return;
      }

      if (meetingType === "HYBRID" && !location) {
        setError("Please provide a physical location for hybrid meetings");
        setLoading(false);
        return;
      }

      const meetingDateTime = new Date(`${date}T${time}`);
      if (meetingDateTime < new Date()) {
        setError("Cannot create meetings in the past");
        setErrorPopup(true);
        setLoading(false);
        return;
      }

      const registrationEnd = calculateRegistrationEnd();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", meetingDateTime.toISOString());
      formData.append("sector", sector);
      formData.append("meetingType", meetingType);
      formData.append("meetingCategory", meetingCategory);
      formData.append("registrationEnd", registrationEnd || "");
      formData.append("password", password);
      formData.append("creatorEmail", userEmail);
      formData.append("creatorType", userRole);
      if (organization) formData.append("organization", organization);

      if (meetingType === "PHYSICAL") {
        formData.append("location", location);
      } else if (meetingType === "ONLINE") {
        formData.append("onlineMeetingUrl", onlineMeetingUrl);
      } else if (meetingType === "HYBRID") {
        formData.append("location", location);
        formData.append("onlineMeetingUrl", onlineMeetingUrl);
      }

      resources.forEach((file, index) => {
        formData.append(`resource-${index}`, file);
      });

      const response = await fetch("/api/meetings", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        setSuccessPopup(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => router.push("/admin"), 5000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create meeting");
        setErrorPopup(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // ─── Permission guard ────────────────────────────────────────
  if (!canCreate) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-red-100 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600">
            You do not have permission to create meetings.
          </p>
          <a
            href="/admin"
            className="mt-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Success Popup */}
      {successPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border-2 border-[#014a2f]">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#014a2f] rounded-full p-2">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#014a2f] mb-2">
              Meeting Created!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Your meeting has been created. Redirecting in 5 seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-[#014a2f] h-2.5 rounded-full progress-bar-success"></div>
            </div>
            <div className="text-center">
              <a
                href="/admin"
                className="px-4 py-2 bg-[#014a2f] text-white rounded-md hover:bg-[#014a2f]/90 inline-block"
              >
                Go to Dashboard Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border-2 border-red-500">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-500 rounded-full p-2">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-red-500 mb-2">
              Error
            </h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <div className="text-center">
              <button
                onClick={() => setErrorPopup(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#014a2f]">
          Create New Meeting
        </h1>
        <a
          href="/admin"
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </a>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-[#014a2f] border-gray-200 rounded-full"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {/* Form */}
      {!loading && (
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white p-5 rounded-lg shadow-sm border border-gray-200"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Category *
              </label>
              <select
                value={meetingCategory}
                onChange={(e) => setMeetingCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">Departmental</option>
                <option value="STAKEHOLDER">Stakeholder</option>
              </select>
            </div>

            {meetingCategory !== "INTERNAL" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Registration closes 2 hours after start.
                </p>
              </div>
            </div>

            {/* Sector (read‑only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector *
              </label>
              <input
                type="text"
                value={getSectorName(sector)}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">
                Your department: {getSectorName(sector)}
              </p>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type *
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="PHYSICAL">Physical Meeting</option>
                <option value="ONLINE">Online Meeting</option>
                <option value="HYBRID">Hybrid Meeting</option>
              </select>
            </div>

            {/* Location (Physical/Hybrid) */}
            {(meetingType === "PHYSICAL" || meetingType === "HYBRID") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Physical Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            )}

            {/* Online URL (Online/Hybrid) */}
            {(meetingType === "ONLINE" || meetingType === "HYBRID") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Online Meeting URL *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={onlineMeetingUrl}
                    onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <select
                    className="w-40 p-2 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      e.target.value && setOnlineMeetingUrl(e.target.value)
                    }
                  >
                    <option value="">Platform</option>
                    <option value="https://meet.google.com/">
                      Google Meet
                    </option>
                    <option value="https://teams.microsoft.com/l/meetup-join/">
                      MS Teams
                    </option>
                    <option value="https://zoom.us/j/">Zoom</option>
                  </select>
                </div>
              </div>
            )}

            {/* Resources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Resources
              </label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  onChange={handleResourceUpload}
                  className="hidden"
                  id="resource-upload"
                  multiple
                />
                <label
                  htmlFor="resource-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-md inline-block"
                >
                  Select Files
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Upload presentations, documents (PDF, PPTX, DOCX, etc.)
                </p>

                {resources.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Selected Files:</p>
                    <ul className="list-disc pl-5">
                      {resources.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resources.length > 0 && (
                  <div className="mt-4">
                    <p>Set password to access meeting resources</p>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      minLength={4}
                      maxLength={4}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#014a2f] text-white rounded-md hover:bg-[#014a2f]/90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
