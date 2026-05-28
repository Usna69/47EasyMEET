"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRegistrationForm, useApiSubmission } from "@/lib/form-hooks";
import { isRegistrationOpen } from "@/lib/meeting-utils";
import { useRouter } from "next/navigation";
import DualColorSpinner from "@/components/DualColorSpinner";
import { useSessionAuth } from "@/lib/session-auth";
import { getSectorName } from "@/utils/sectorUtils";
import SignaturePadJSX, { SignaturePadHandle } from "./SignaturePadJSX";
import { MeetingRow } from "@/app/meetings/[id]/register/page";

export default function RegForm({ meetingprop }: { meetingprop: MeetingRow }) {
  const router = useRouter();
  const auth = useSessionAuth();

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    validateForm,
  } = useRegistrationForm(meetingprop);

  const signatureRef = useRef<SignaturePadHandle>(null);
  const [useAutoSignature, setUseAutoSignature] = useState(false);

  // Final signature data (shown as preview and sent on submit)
  const [signatureData, setSignatureData] = useState<string | null>(null);
  // Temporary data while drawing (not yet confirmed)
  const [tempSignatureData, setTempSignatureData] = useState<string | null>(
    null,
  );

  const { submitRequest, error, success, clearMessages } = useApiSubmission();

  const registrationOpen = isRegistrationOpen(meetingprop?.date);

  // Auto‑fill for high‑level users
  useEffect(() => {
    if (auth.user && auth.isLoggedIn) {
      const isHighLevelUser =
        auth.user.userLevel && auth.user.userLevel !== "REGULAR";
      const isViewOnlyUser = auth.user.role === "VIEW_ONLY";
      if (isHighLevelUser || isViewOnlyUser) {
        updateField("name", auth.user.name || "");
        updateField("email", auth.user.email || "");
        updateField("designation", auth.user.customRole || "");
        updateField(
          "organization",
          auth.user.department ? getSectorName(auth.user.department) : "",
        );
        updateField("contact", "");
      }
    }
  }, [auth.user, auth.isLoggedIn, updateField]);

  const isHighLevelUser = Boolean(
    auth.user &&
    auth.isLoggedIn &&
    ((auth.user.userLevel && auth.user.userLevel !== "REGULAR") ||
      auth.user.role === "VIEW_ONLY"),
  );

  // ── Auto‑generate signature ──────────────────────────────────
  const generateAutoSignature = useCallback(() => {
    console.log("generateAutoSignature called, name:", formData.name);
    if (!formData.name) {
      updateErrors({ signatureData: "Please fill in your name first" });
      return;
    }

    const initials = formData.name
      .split(" ")
      .map((n: string) => n.charAt(0))
      .join("")
      .toUpperCase();

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic bold 48px 'Brush Script MT', 'Comic Sans MS', cursive";
    ctx.fillStyle = "#014a2f";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL("image/png");
    console.log("Generated dataUrl:", dataUrl?.substring(0, 50));

    setSignatureData(dataUrl); // auto‑generated is confirmed immediately
    setTempSignatureData(null); // clear any temp drawing
    setUseAutoSignature(true);

    // Clear any error for signature
    updateErrors({ signatureData: "" });
  }, [formData.name, updateErrors]);

  // ── Drawing handlers ────────────────────────────────────────
  // When the user finishes drawing, store it as temporary data (canvas stays visible)
  const handleSignatureEnd = useCallback((data: string | null) => {
    if (data) {
      setTempSignatureData(data);
      setUseAutoSignature(false);
    }
  }, []);

  // Confirm the drawn signature → move it to final state (show preview)
  const confirmSignature = useCallback(() => {
    if (tempSignatureData) {
      setSignatureData(tempSignatureData);
      setTempSignatureData(null);
    }
  }, [tempSignatureData]);

  // Clear everything – remove final and temp signatures
  const handleClearSignature = useCallback(() => {
    setSignatureData(null);
    setTempSignatureData(null);
    setUseAutoSignature(false);
  }, []);

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Signature mandatory check – using final signature data
    if (!signatureData) {
      updateErrors({
        signatureData:
          "Signature is required. Please sign or use auto‑generate.",
      });
      return;
    }

    if (!validateForm()) return;
    if (!registrationOpen) {
      updateErrors({ general: "Registration is not open for this meeting" });
      return;
    }

    const result = await submitRequest(async () => {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value != null && key !== "signatureData")
          formDataToSend.append(key, value as string | Blob);
      });
      formDataToSend.append("meetingId", meetingprop.id);

      // Append the final signature data
      formDataToSend.append("signatureData", signatureData);

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
      router.push(`/meetings/${meetingprop.id}/register/success`);
    }
  };

  const handleInputChange = (field: any, value: string) => {
    updateField(field, value);
    clearMessages();
  };

  const handleResetForm = () => {
    resetForm();
    signatureRef.current?.clear();
    setSignatureData(null);
    setTempSignatureData(null);
    setUseAutoSignature(false);
  };

  // ── Render ─────────────────────────────────────────────────
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
        {/* Name */}
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

        {/* Designation */}
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

        {/* Organization (non‑internal) */}
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

        {/* Contact */}
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

        {/* Email */}
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

        {/* Signature – mandatory with improved UX */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature * <span className="text-red-500">(required)</span>
          </label>

          {/* If final signature exists → show preview (with clear option) */}
          {signatureData ? (
            <div className="rounded-md p-4 bg-gray-50">
              <img
                src={signatureData}
                alt="Your signature"
                className="h-20 mx-auto border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleClearSignature}
                className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              >
                Clear Signature
              </button>
            </div>
          ) : (
            /* No final signature yet → show canvas with optional save button */
            <>
              <SignaturePadJSX
                ref={signatureRef}
                onEnd={handleSignatureEnd}
                onClear={handleClearSignature}
              />

              {/* Show Save button only when a drawing exists */}
              {tempSignatureData && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={confirmSignature}
                    className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                  >
                    Save Signature
                  </button>
                </div>
              )}

              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={generateAutoSignature}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Auto‑generate from name
                </button>
                <p className="text-xs text-gray-500">
                  Click to generate a signature using your initials (based on
                  the name above).
                </p>
              </div>
            </>
          )}

          {errors.signatureData && (
            <p className="mt-1 text-sm text-red-600">{errors.signatureData}</p>
          )}
        </div>

        {/* Submit */}
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
