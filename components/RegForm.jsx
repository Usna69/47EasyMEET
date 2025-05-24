"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SignaturePadJSX from "./SignaturePadJSX";

export default function RegForm({ meetingId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    designation: "",
    signatureData: "",
  });

  const signatureRef = useRef(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    organization: "",
    designation: "",
    signatureData: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Clear the signature pad
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setFormData({
        ...formData,
        signatureData: "",
      });
    }
  };

  // Save signature data when completed - enhanced version
  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      try {
        // Get signature as base64 encoded PNG with transparent background
        const signatureData = signatureRef.current.toDataURL("image/png");

        console.log("Signature captured successfully", signatureData.substring(0, 50) + "...");

        // Verify it's a valid base64 image string before saving
        if (signatureData && signatureData.startsWith("data:image")) {
          // Debug the size of the signature data
          console.log(`Signature data length: ${signatureData.length} bytes`);
          
          setFormData({
            ...formData,
            signatureData,
          });
          console.log("Signature data saved to form state");

          // Clear any previous signature errors
          if (errors.signatureData) {
            setErrors({
              ...errors,
              signatureData: "",
            });
          }
          
          // Show visual confirmation of signature capture
          const signatureContainer = document.querySelector(".signature-container");
          if (signatureContainer) {
            signatureContainer.classList.add("signature-saved");
          }
        } else {
          console.error("Invalid signature format - not a valid image");
        }
      } catch (error) {
        console.error("Error processing signature:", error);
      }
    } else {
      console.log("Signature pad is empty or not initialized");
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      organization: "",
      designation: "",
      signatureData: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
      isValid = false;
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save signature before submission if it exists
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      saveSignature();
      // Small delay to ensure signature is processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure meetingId is available
      if (!meetingId) {
        console.error("No meetingId provided to registration form");
        alert("Registration error: Meeting ID is missing");
        return;
      }
      
      console.log("Registration form data:", { meetingId, ...formData });
      
      // Create FormData object to match the API expectations
      const formDataObj = new FormData();
      formDataObj.append('meetingId', meetingId);
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('organization', formData.organization);
      formDataObj.append('designation', formData.designation);
      
      // Only append signature if it exists
      if (formData.signatureData) {
        formDataObj.append('signatureData', formData.signatureData);
      }
      
      console.log('Submitting registration for meeting:', meetingId);
      
      // Use classic form submission approach
      const response = await fetch("/api/attendees", {
        method: "POST",
        body: formDataObj,
      });

      // Log the full response for debugging
      console.log("Registration response status:", response.status);
      const responseText = await response.text();
      console.log("Registration response text:", responseText);
      
      // Parse the response if it's JSON
      let errorData = {};
      try {
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
      
      if (!response.ok) {
        throw new Error(errorData.error || "Failed to register");
      }

      // Navigate to success page
      router.push(`/meetings/${meetingId}/register/success`);
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "An error occurred while registering. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#014a2f]">
        Registration
      </h2>
      
      {/* Mobile-friendly meeting status indicator */}
      {meeting && (
        <div className={`meeting-status ${meeting.status === 'ONGOING' ? 'ongoing' : meeting.status === 'UPCOMING' ? 'upcoming' : 'closed'}`}>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-2 
              ${meeting.status === 'ONGOING' ? 'bg-green-500' : meeting.status === 'UPCOMING' ? 'bg-purple-500' : 'bg-red-500'}"></span>
            <span>
              {meeting.status === 'ONGOING' ? 'Meeting in progress - Registration open' : 
               meeting.status === 'UPCOMING' ? 'Meeting not started yet' : 'Registration closed'}
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#014a2f] mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-[#014a2f]/20"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#014a2f] mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-[#014a2f]/20"
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="organization"
            className="block text-sm font-medium text-[#014a2f] mb-1"
          >
            Organization
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.organization
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-[#014a2f]/20"
            }`}
            placeholder="Enter your organization"
          />
          {errors.organization && (
            <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="designation"
            className="block text-sm font-medium text-[#014a2f] mb-1"
          >
            Designation
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.designation
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-[#014a2f]/20"
            }`}
            placeholder="Enter your designation"
          />
          {errors.designation && (
            <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signature"
            className="block text-sm font-medium text-[#014a2f] mb-1"
          >
            Signature (Optional)
          </label>
          <div className="border rounded-md p-1 border-gray-300 signature-container">
            <div className="bg-gray-50 flex flex-col items-center border border-gray-200 rounded">
              <SignaturePadJSX ref={signatureRef} onEnd={saveSignature} />
              <div className="flex w-full p-2 bg-gray-50 justify-between items-center">
                <p className="text-xs text-gray-500">
                  {formData.signatureData ? 
                    <span className="flex items-center text-green-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Signature saved
                    </span> : 
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Sign above
                    </span>
                  }
                </p>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || (meeting && meeting.status !== 'ONGOING')}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] py-3 px-4 rounded-md font-medium transition-colors mobile-touch-feedback"
          >
            {isSubmitting ? "Registering..." : 
             (meeting && meeting.status === 'UPCOMING') ? "Registration not open yet" :
             (meeting && meeting.status !== 'ONGOING') ? "Registration closed" : 
             "Register"}
          </button>
          
          {/* Mobile-friendly timing note */}
          {meeting && meeting.status === 'ONGOING' && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Registration closes 2 hours after meeting start
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
