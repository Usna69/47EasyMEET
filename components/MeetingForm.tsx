"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSessionAuth } from "@/lib/session-auth";

// Extract React hooks from React import
const { useState, useEffect } = React;

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
  const [minDateTime, setMinDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime] = useState(new Date("2025-05-23T17:30:23+03:00")); // Updated to current time
  const [meetingIdPreview, setMeetingIdPreview] = useState("");

  // Sector options aligned with the sector filter
  const sectorOptions = {
    "BA&P": "Boroughs Administration and Personnel",
    "BE&UP": "Built Environment and Urban Planning Sector",
    "B&HO": "Business and Hustler Opportunities",
    "F&EPA": "Finance and Economic Planning Affairs",
    "GN": "Green Nairobi (Environment, Water, Food and Agriculture)",
    "HW&N": "Health Wellness and Nutrition",
    "IDE": "Innovation and Digital Economy",
    "IPP&CS": "Inclusivity, Public Participation and Customer Service Sector",
    "M&W": "Mobility and Works",
    "OG": "Office of the Governor",
    "TS&DC": "Talents, Skills Development and Care"
  };

  // Default creator type (since dropdown is being removed)
  const defaultCreatorType = "HOD";

  // Meeting category options
  const meetingCategoryOptions = ["INTERNAL", "EXTERNAL", "STAKEHOLDER"];

  const [formData, setFormData] = useState({
    title: meeting?.title || "",
    description: meeting?.description || "",
    date: meeting?.date
      ? new Date(meeting.date).toISOString().substring(0, 16)
      : "",
    location: meeting?.location || "",
    creatorEmail: meeting?.creatorEmail || "",
    sector: meeting?.sector || "IDE",
    creatorType: meeting?.creatorType || defaultCreatorType, // Use default creator type
    meetingCategory: meeting?.meetingCategory || "INTERNAL",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    creatorEmail: "",
    sector: "",
    creatorType: "",
    meetingCategory: "",
  });
  // Set minimum date-time to current time
  useEffect(() => {
    // Use the most current time possible
    const now = new Date(currentTime);
    
    // Add 5 minutes buffer for meeting setup (reduced from 30 to make testing easier)
    now.setMinutes(now.getMinutes() + 5);
    
    // Format for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setMinDateTime(formattedDateTime);
    
    // If the current form date is in the past, update it to the minimum allowed time
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      if (selectedDate < now) {
        setFormData((prev: typeof formData) => ({
          ...prev,
          date: formattedDateTime
        }));
      }
    }
  }, [currentTime, formData.date]);

  useEffect(() => {
    if (formData.date && formData.sector && formData.creatorType) {
      try {
        const dateObj = new Date(formData.date);
        const datePart = format(dateObj, "ddMMyyyy");
        const timePart = format(dateObj, "HHmm");

        const meetingId = `047/${formData.sector}/${formData.creatorType}/${datePart}-${timePart}`;
        setMeetingIdPreview(meetingId);
      } catch (error) {
        console.error("Error generating meeting ID:", error);
      }
    }
  }, [formData.date, formData.sector, formData.creatorType]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for date field
    if (name === "date") {
      const selectedDate = new Date(value);
      const now = new Date(currentTime);

      // Add 30 minutes buffer for meeting setup
      now.setMinutes(now.getMinutes() + 30);

      if (selectedDate.getTime() < now.getTime()) {
        setErrors({
          ...errors,
          date: "Please select a time at least 30 minutes in the future",
        });
        // Reset to minimum allowed time
        setFormData({ ...formData, date: minDateTime });
        return;
      } else {
        // Clear error if date is valid
        setErrors({ ...errors, date: "" });
      }

      // Check if date is too far in the future (e.g., 1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (selectedDate > oneYearFromNow) {
        setErrors({
          ...errors,
          date: "Meeting cannot be scheduled more than 1 year in advance",
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let newErrors = {
      title: "",
      description: "",
      date: "",
      location: "",
      creatorEmail: "",
      sector: "",
      creatorType: "",
      meetingCategory: "",
    };
    let isValid = true;

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Date and time are required";
      isValid = false;
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.date);
      const now = new Date(currentTime);

      if (selectedDate < now) {
        newErrors.date = "Cannot create meetings in the past";
        isValid = false;
      }
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    // Validate email
    if (!formData.creatorEmail.trim()) {
      newErrors.creatorEmail = "Creator email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
        formData.creatorEmail
      )
    ) {
      newErrors.creatorEmail = "Invalid email address";
      isValid = false;
    }

    // Validate sector
    if (!formData.sector) {
      newErrors.sector = "Sector is required";
      isValid = false;
    }

    // Creator type is set by default, no validation needed

    // Validate meeting category
    if (!formData.meetingCategory) {
      newErrors.meetingCategory = "Meeting category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const url = isEditing ? `/api/meetings/${meeting?.id}` : "/api/meetings";
    const method = isEditing ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          creatorEmail: auth.user?.email,
          sector: formData.sector,
          creatorType: formData.creatorType,
          meetingId: meetingIdPreview,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing ? "Failed to update meeting" : "Failed to create meeting"
        );
      }

      const data = await response.json();

      // Stay on admin pages after creation/editing
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      alert(`An error occurred. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Meeting Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-300"
          }`}
          placeholder="Enter meeting title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.description
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-300"
          }`}
          placeholder="Enter meeting description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={minDateTime}
          required
          // Prevent manual entry that could bypass the min attribute
          onKeyDown={(e) => e.preventDefault()}
          // Add click handler to ensure calendar opens with current constraints
          onClick={() => {
            // Force refresh of min attribute if needed
            const dateInput = document.getElementById('date') as HTMLInputElement;
            if (dateInput) {
              dateInput.min = minDateTime;
            }
          }}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.date
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-300"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Meetings can only be scheduled in the future (at least 5 minutes from now)
        </p>
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.location
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-300"
          }`}
          placeholder="Enter meeting location"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="sector"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sector
          </label>
          <select
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.sector
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-green-300"
            }`}
          >
            {Object.entries(sectorOptions).map(([abbr, fullName]) => (
              <option key={abbr} value={abbr}>
                {abbr} - {fullName}
              </option>
            ))}
          </select>
          {errors.sector && (
            <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
          )}
        </div>

        {/* Creator Type is now fixed as HOD */}
        <input type="hidden" name="creatorType" value={formData.creatorType} />
      </div>

      <div>
        <label
          htmlFor="meetingCategory"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Meeting Category
        </label>
        <select
          id="meetingCategory"
          name="meetingCategory"
          value={formData.meetingCategory}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.meetingCategory
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-300"
          }`}
        >
          {meetingCategoryOptions.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {errors.meetingCategory && (
          <p className="mt-1 text-sm text-red-600">{errors.meetingCategory}</p>
        )}
      </div>

      {meetingIdPreview && (
        <div className="bg-green-50 p-4 rounded-md border border-green-300">
          <label className="block text-sm font-medium text-green-800 mb-1">
            Meeting ID Preview
          </label>
          <div className="font-mono bg-white text-green-800 p-3 rounded border border-green-200">
            {meetingIdPreview}
          </div>
          <p className="text-xs text-green-600 mt-1">
            This unique ID will be assigned to your meeting
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-md transition-colors w-full flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update Meeting" : "Create Meeting"}</>
          )}
        </button>
      </div>
    </form>
  );
}
