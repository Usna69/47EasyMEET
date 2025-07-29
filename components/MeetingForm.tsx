"use client";

import React from "react";
import { useMeetingForm, useApiSubmission, useFileUpload } from "@/lib/form-hooks";
import { useSessionAuth } from "@/lib/session-auth";
import { useRouter } from "next/navigation";

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  creatorEmail?: string | null;
  sector?: string | null;
  creatorType?: string | null;
  meetingId?: string | null;
  meetingCategory?: string | null;
  meetingType?: string | null;
  onlineMeetingUrl?: string | null;
}

interface MeetingFormProps {
  meeting?: Meeting;
  isEditing?: boolean;
}

export default function MeetingForm({
  meeting,
  isEditing = false,
}: MeetingFormProps) {
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
    validateForm
  } = useMeetingForm(meeting);

  const { submitRequest, error, success, clearMessages } = useApiSubmission();
  const { uploading, uploadFile } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await submitRequest(
      async () => {
    const url = isEditing ? `/api/meetings/${meeting?.id}` : "/api/meetings";
    const method = isEditing ? "PUT" : "POST";

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            formDataToSend.append(key, value);
          }
        });
        
        // Add user context
        formDataToSend.append("creatorEmail", auth.user?.email || meeting?.creatorEmail || "");
      
      const response = await fetch(url, {
        method,
          body: formDataToSend,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save meeting");
        }

        return response.json();
      },
      isEditing ? "Meeting updated successfully" : "Meeting created successfully"
    );

    if (result) {
      // Redirect to meetings list or meeting detail
      router.push("/admin/meetings");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    updateField(field, value);
    clearMessages();
  };

  const handleFileUpload = async (file: File) => {
    const uploadedUrl = await uploadFile(file, "/api/letterheads");
    if (uploadedUrl) {
      updateField("selectedLetterheadPath", uploadedUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#014a2f] mb-2">
          <span className="text-yellow-500">Easy</span>MEET
        </h1>
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "Edit Meeting" : "Create New Meeting"}
        </h2>
            </div>
            
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
        {/* Title Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title *
        </label>
        <input
          type="text"
          value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.title
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
          }`}
          placeholder="Enter meeting title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

        {/* Description Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
        </label>
        <textarea
          value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.description
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
          }`}
          placeholder="Enter meeting description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

        {/* Date and Time Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date and Time *
        </label>
        <input
          type="datetime-local"
          value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.date
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

        {/* Location Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
        </label>
        <input
          type="text"
          value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.location
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
          }`}
          placeholder="Enter meeting location"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

        {/* Sector Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector *
        </label>
        <select
          value={formData.sector}
            onChange={(e) => handleInputChange("sector", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.sector
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            }`}
          >
            <option value="">Select a sector</option>
            <option value="BA&P">Boroughs Administration and Personnel</option>
            <option value="BE&UP">Built Environment and Urban Planning</option>
            <option value="B&HO">Business and Hustler Opportunities</option>
            <option value="DMC">Disaster Management and Coordination</option>
            <option value="F&EPA">Finance and Economic Planning Affairs</option>
            <option value="GN">Green Nairobi</option>
            <option value="HW&N">Health Wellness and Nutrition</option>
            <option value="IDE">Innovation and Digital Economy</option>
            <option value="IPP&CS">Inclusivity, Public Participation and Customer Service</option>
            <option value="M&W">Mobility and Works</option>
            <option value="OG">Office of the Governor</option>
            <option value="TS&DC">Talents, Skills Development and Care</option>
        </select>
        {errors.sector && (
          <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
        )}
      </div>

        {/* Meeting Category Field */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Category *
        </label>
        <select
          value={formData.meetingCategory}
            onChange={(e) => handleInputChange("meetingCategory", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.meetingCategory
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#014a2f]"
            }`}
          >
            <option value="">Select meeting category</option>
            <option value="INTERNAL">Internal</option>
            <option value="EXTERNAL">External</option>
            <option value="STAKEHOLDER">Stakeholder</option>
        </select>
        {errors.meetingCategory && (
          <p className="mt-1 text-sm text-red-600">{errors.meetingCategory}</p>
        )}
      </div>

        {/* Meeting Type Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Type *
          </label>
          <select
            value={formData.meetingType}
            onChange={(e) => handleInputChange("meetingType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014a2f]"
          >
            <option value="PHYSICAL">Physical</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Online Meeting URL - Conditional */}
        {(formData.meetingType === "ONLINE" || formData.meetingType === "HYBRID") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Online Meeting URL
            </label>
            <input
              type="url"
              value={formData.onlineMeetingUrl}
              onChange={(e) => handleInputChange("onlineMeetingUrl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014a2f]"
              placeholder="Enter online meeting URL"
            />
          </div>
        )}

        {/* Organization Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => handleInputChange("organization", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014a2f]"
            placeholder="Enter organization name"
          />
      </div>

        {/* Submit Button */}
        <div className="flex gap-4">
        <button
          type="submit"
            disabled={isSubmitting || uploading}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#014a2f] hover:bg-[#013a24]"
            }`}
        >
          {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isEditing ? "Updating..." : "Creating..."}
              </div>
          ) : (
              isEditing ? "Update Meeting" : "Create Meeting"
          )}
        </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
      </div>
      </form>
    </div>
  );
}
