"use client";

import React, { useEffect } from "react";
import { useRegistrationForm, useApiSubmission } from "@/lib/form-hooks";

import { isRegistrationOpen } from "@/lib/meeting-utils";
import SignaturePadJSX from "./SignaturePadJSX";
import { useRouter } from "next/navigation";
import DualColorSpinner from "@/components/DualColorSpinner";
import { useSessionAuth } from "@/lib/session-auth";
import { getSectorName } from "@/utils/sectorUtils";

// Consistent date formatting function to prevent hydration errors
const formatDateConsistent = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export default function RegForm({ meetingprop }) {
  const router = useRouter();
  const auth = useSessionAuth();

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting,
    validateForm,
  } = useRegistrationForm(meetingprop);

  const signatureRef = React.useRef(null);

  const { submitRequest, error, success, clearMessages } = useApiSubmission();

  // Check if registration is open
  const registrationOpen = isRegistrationOpen(meetingprop?.date);

  // Auto-fill form for high-level users
  useEffect(() => {
    if (auth.user && auth.isLoggedIn) {
      const isHighLevelUser =
        auth.user.userLevel && auth.user.userLevel !== "REGULAR";
      const isViewOnlyUser = auth.user.role === "VIEW_ONLY";

      if (isHighLevelUser || isViewOnlyUser) {
        // Auto-fill user details
        updateField("name", auth.user.name || "");
        updateField("email", auth.user.email || "");
        updateField(
          "designation",
          auth.user.customRole || auth.user.designation || "",
        );
        updateField(
          "organization",
          auth.user.department ? getSectorName(auth.user.department) : "",
        );
        updateField("contact", ""); // Let them fill this if needed
      }
    }
  }, [auth.user, auth.isLoggedIn, updateField]);

  // Check if user is high-level
  const isHighLevelUser =
    auth.user &&
    auth.isLoggedIn &&
    ((auth.user.userLevel && auth.user.userLevel !== "REGULAR") ||
      auth.user.role === "VIEW_ONLY");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!registrationOpen) {
      updateErrors({ general: "Registration is not open for this meeting" });
      return;
    }

    const result = await submitRequest(async () => {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      formDataToSend.append("meetingId", meetingprop.id);

      const response = await fetch("/api/attendees", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      return response.json();
    }, "Registration successful! You will receive a confirmation email shortly.");

    if (result) {
      handleResetForm();
      // Redirect to success page
      router.push(`/meetings/${meetingprop.id}/register/success`);
    }
  };

  const handleInputChange = (field, value) => {
    updateField(field, value);
    clearMessages();
  };

  const handleResetForm = () => {
    resetForm();
    // Clear the signature pad when form is reset
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  if (!meetingprop) {
    return (
      <div className="text-center py-8">
        <DualColorSpinner />
        <p className="mt-4 text-gray-600">Loading meeting details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {!registrationOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Registration is not currently open for this meeting.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            } ${isHighLevelUser ? "bg-gray-50" : ""}`}
            placeholder="Enter your full name"
            readOnly={isHighLevelUser}
          />
          {isHighLevelUser && (
            <p className="mt-1 text-sm text-gray-500">
              Auto-filled from your profile
            </p>
          )}
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Designation Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation *
          </label>
          <input
            type="text"
            value={formData.designation}
            onChange={(e) => handleInputChange("designation", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.designation
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            } ${isHighLevelUser ? "bg-gray-50" : ""}`}
            placeholder="Enter your designation"
            readOnly={isHighLevelUser}
          />
          {isHighLevelUser && (
            <p className="mt-1 text-sm text-gray-500">
              Auto-filled from your profile
            </p>
          )}
          {errors.designation && (
            <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
          )}
        </div>

        {/* Organization Field - Only for non-internal meetings */}
        {meetingprop.meetingCategory !== "INTERNAL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization *
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) =>
                handleInputChange("organization", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.organization
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#014a2f]"
              } ${isHighLevelUser ? "bg-gray-50" : ""}`}
              placeholder="Enter your organization"
              readOnly={isHighLevelUser}
            />
            {isHighLevelUser && (
              <p className="mt-1 text-sm text-gray-500">
                Auto-filled from your profile
              </p>
            )}
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
            )}
          </div>
        )}

        {/* Contact Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            value={formData.contact}
            onChange={(e) => handleInputChange("contact", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.contact
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            }`}
            placeholder="Enter your contact number"
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            } ${isHighLevelUser ? "bg-gray-50" : ""}`}
            placeholder="Enter your email address"
            readOnly={isHighLevelUser}
          />
          {isHighLevelUser && (
            <p className="mt-1 text-sm text-gray-500">
              Auto-filled from your profile
            </p>
          )}
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Signature Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature (Optional)
          </label>
          <SignaturePadJSX
            ref={signatureRef}
            onEnd={(signatureData) => {
              handleInputChange("signatureData", signatureData);
            }}
            onClear={() => {
              handleInputChange("signatureData", null);
            }}
          />
          {errors.signatureData && (
            <p className="mt-1 text-sm text-red-600">{errors.signatureData}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !registrationOpen}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isSubmitting || !registrationOpen
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#014a2f] hover:bg-[#013a24]"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Registering...
            </div>
          ) : (
            "Register for Meeting"
          )}
        </button>
      </form>
    </div>
  );
}
