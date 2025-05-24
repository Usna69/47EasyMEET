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
  const [minDateTime, setMinDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime] = useState(new Date("2025-05-23T17:30:23+03:00")); // Updated to current time
  const [meetingIdPreview, setMeetingIdPreview] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);

  // Sector options as array to match exact structure of SectorFilter component
  const sectors: Array<{name: string; code: string}> = [
    { name: 'Boroughs Administration and Personnel', code: 'BA&P' },
    { name: 'Built Environment and Urban Planning Sector', code: 'BE&UP' },
    { name: 'Business and Hustler Opportunities', code: 'B&HO' },
    { name: 'Finance and Economic Planning Affairs', code: 'F&EPA' },
    { name: 'Green Nairobi (Environment, Water, Food and Agriculture)', code: 'GN' },
    { name: 'Health Wellness and Nutrition', code: 'HW&N' },
    { name: 'Innovation and Digital Economy', code: 'IDE' },
    { name: 'Inclusivity, Public Participation and Customer Service Sector', code: 'IPP&CS' },
    { name: 'Mobility and Works', code: 'M&W' },
    { name: 'Office of the Governor', code: 'OG' },
    { name: 'Talents, Skills Development and Care', code: 'TS&DC' }
  ];

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
    meetingType: meeting?.meetingType || "PHYSICAL",
    onlineMeetingUrl: meeting?.onlineMeetingUrl || "",
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
    if (formData.date && formData.sector && formData.meetingCategory) {
      try {
        const dateObj = new Date(formData.date);
        const datePart = format(dateObj, "ddMMyyyy");
        const timePart = format(dateObj, "HHmm");
        
        // Convert meeting category to code for the ID
        const categoryCode = 
          formData.meetingCategory === "INTERNAL" ? "INT" :
          formData.meetingCategory === "EXTERNAL" ? "EXT" :
          formData.meetingCategory === "STAKEHOLDER" ? "STK" : "INT";
          
        const meetingId = `047/${formData.sector}/${categoryCode}/${datePart}-${timePart}`;
        setMeetingIdPreview(meetingId);
      } catch (error) {
        console.error("Error generating meeting ID:", error);
      }
    }
  }, [formData.date, formData.sector, formData.meetingCategory]);

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
      // Create the request body, handling the meetingId differently for new vs existing meetings
      const requestBody = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        creatorEmail: auth.user?.email || meeting?.creatorEmail,
        sector: formData.sector,
        creatorType: formData.creatorType,
        meetingCategory: formData.meetingCategory,
        meetingType: formData.meetingType || "PHYSICAL",
        onlineMeetingUrl: formData.onlineMeetingUrl || "",
        // For edits, preserve the existing meeting ID if it exists
        meetingId: isEditing ? meeting?.meetingId : meetingIdPreview,
      };

      console.log('Submitting meeting data:', requestBody);
      
      // Debug the current meeting data in case of an edit
      if (isEditing && meeting) {
        console.log('Original meeting data:', {
          id: meeting.id,
          title: meeting.title,
          meetingId: meeting.meetingId,
          creatorEmail: meeting.creatorEmail,
          // Add other relevant fields
        });
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to get detailed error information from the response
        const errorData = await response.json().catch(() => null);
        console.error('API error response:', errorData);
        
        throw new Error(
          isEditing 
            ? `Failed to update meeting: ${errorData?.error || response.statusText}` 
            : `Failed to create meeting: ${errorData?.error || response.statusText}`
        );
      }

      const data = await response.json();

      // Show success popup for edits
      if (isEditing) {
        setSuccessPopup(true);
        // Scroll to the top of the page
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Redirect after 5 seconds
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 5000);
      } else {
        // For new meetings, redirect immediately (handled by create page)
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      
      // Try to get more detailed error information
      let errorMessage = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Popup */}
      {successPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border-2 border-[#014a2f]">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#014a2f] rounded-full p-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#014a2f] mb-2">Meeting Updated!</h2>
            <p className="text-gray-600 text-center mb-6">Your meeting has been successfully updated. You will be redirected to the dashboard in 5 seconds.</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-[#014a2f] h-2.5 rounded-full progress-bar-success"></div>
            </div>
            
            <div className="text-center">
              <a href="/admin" className="px-4 py-2 bg-[#014a2f] text-white rounded-md hover:bg-[#014a2f]/90 inline-block">
                Go to Dashboard Now
              </a>
            </div>
          </div>
        </div>
      )}
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
          {sectors.map((sector) => (
            <option key={sector.code} value={sector.code}>
              {sector.name}
            </option>
          ))}
        </select>
        {errors.sector && (
          <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
        )}
      </div>

      {/* Creator Type is now fixed as HOD */}
      <input type="hidden" name="creatorType" value={formData.creatorType} />

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
    </>
  );
}
