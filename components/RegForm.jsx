"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignaturePadJSX from "./SignaturePadJSX";

export default function RegForm({ meetingId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    designation: "",
    contact: "", // Contact field for phone number
    email: "",
    signatureData: "",
  });

  const signatureRef = useRef(null);
  const [errors, setErrors] = useState({
    name: "",
    designation: "",
    organization: "",
    contact: "",
    email: "",
    signatureData: "",
  });

  // Fetch meeting data when component mounts
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingId) {
        setLoadError("Meeting ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/meetings/${meetingId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch meeting data: ${response.status}`);
        }

        const data = await response.json();
        
        // Log the complete meeting data for debugging
        console.log('Meeting data received:', data);
        console.log('Letterhead information:', data.customLetterhead || 'None');

        // Calculate meeting status with improved logging
        const now = new Date();
        const meetingTime = new Date(data.date);
        const registrationEndTime = data.registrationEnd
          ? new Date(data.registrationEnd)
          : new Date(meetingTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start

        console.log('Status calculation - Current time:', now.toLocaleString());
        console.log('Status calculation - Meeting time:', meetingTime.toLocaleString());
        console.log('Status calculation - Registration end time:', registrationEndTime.toLocaleString());

        // Check if meeting is more than a day old (considered ended)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isMeetingEnded = meetingTime < yesterday;
        console.log('Status calculation - Is meeting ended (more than a day old):', isMeetingEnded);

        // Determine status based on time comparisons
        let status = 'UPCOMING';
        if (now >= meetingTime) {
          // If current time is after meeting start
          if (now <= registrationEndTime && !isMeetingEnded) {
            status = 'ONGOING';
            console.log('Status calculation - Meeting is ONGOING: Within registration window');
          } else {
            status = 'CLOSED';
            console.log('Status calculation - Meeting is CLOSED: Registration period ended');
          }
        } else {
          console.log('Status calculation - Meeting is UPCOMING: Meeting has not started yet');
        }

        // Add status to meeting data
        setMeeting({
          ...data,
          status,
          registrationEndTime
        });
        
        // If meeting is INTERNAL, remove organization field from formData
        if (data.meetingCategory === 'INTERNAL') {
          setFormData(prev => ({
            ...prev,
            organization: ""
          }));
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
        setLoadError("Could not load meeting data");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [meetingId]);

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
    console.log('Starting form validation with data:', formData);
    let valid = true;
    const newErrors = {
      name: "",
      designation: "",
      organization: "",
      contact: "",
      email: "",
      signatureData: "",
    };

    // Check name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
      console.log('Name validation failed');
    }

    // Check contact
    if (!formData.contact || !formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
      valid = false;
      console.log('Contact validation failed');
    }

    // Check email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
      console.log('Email validation failed - empty');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
      console.log('Email validation failed - invalid format');
    }

    // Organization is required except for internal meetings
    if (!formData.organization.trim() && meeting?.meetingCategory !== 'INTERNAL') {
      newErrors.organization = "Organization is required";
      valid = false;
      console.log('Organization validation failed');
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      valid = false;
      console.log('Designation validation failed');
    }

    // Signature is optional
    // We don't need to validate it as required

    setErrors(newErrors);
    console.log('Validation complete, valid:', valid, 'errors:', newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');

    // Save signature before submission if it exists
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      console.log('Saving signature before submission');
      saveSignature();
      // Small delay to ensure signature is processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Running form validation');
    const isValid = validateForm();
    console.log('Form validation result:', isValid, 'Errors:', errors);
    
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }
    console.log('Form validation passed');

    setIsSubmitting(true);

    try {
      // Ensure meetingId is available
      if (!meetingId) {
        console.error("No meetingId provided to registration form");
        alert("Registration error: Meeting ID is missing");
        return;
      }

      console.log("Registration form data:", { meetingId, ...formData });

      // Check meeting status before submitting
      console.log('Meeting status check - current meeting:', meeting);
      if (!meeting) {
        console.error('No meeting information available');
        throw new Error("Meeting information not available");
      }
      
      if (meeting.status !== 'ONGOING') {
        const errorMessage = meeting.status === 'UPCOMING' 
          ? "Registration is not open yet. Registration opens when the meeting starts." 
          : "Registration period has ended. Registration closes 2 hours after the meeting starts.";
        console.error('Meeting status check failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('Meeting status check passed - registration is open');
      
      // Create FormData object to match the API expectations
      const formDataObj = new FormData();
      formDataObj.append('meetingId', meetingId);
      formDataObj.append('name', formData.name);
      formDataObj.append('contact', formData.contact);
      formDataObj.append('email', formData.email);
      formDataObj.append('organization', formData.organization);
      formDataObj.append('designation', formData.designation);
      
      // Only append signature if it exists
      if (formData.signatureData) {
        formDataObj.append('signatureData', formData.signatureData);
      }
      
      console.log('Submitting registration form data for meeting:', meetingId);
      
      const response = await fetch(`/api/attendees`, {
        method: "POST",
        body: formDataObj,
      });

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
      {/* No letterhead image displayed on the registration form */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#014a2f]">
        Registration
      </h2>
      
      {/* Mobile-friendly meeting status indicator */}
      {meeting && (
        <div className={`meeting-status ${meeting.status === 'ONGOING' ? 'ongoing' : meeting.status === 'UPCOMING' ? 'upcoming' : 'closed'}`}>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${meeting.status === 'ONGOING' ? 'bg-green-500' : meeting.status === 'UPCOMING' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
            <span>
              {meeting.status === 'ONGOING' ? 'Registration Open' : 
               meeting.status === 'UPCOMING' ? 'Registration Not Open Yet' : 
               'Registration Closed'}
            </span>
          </div>
          <p className="text-xs mt-1">
            {meeting.status === 'ONGOING' ? 
              `Registration closes at ${new Date(meeting.registrationEndTime).toLocaleTimeString()}` : 
             meeting.status === 'UPCOMING' ? 
              `Registration opens when the meeting starts at ${new Date(meeting.date).toLocaleTimeString()}` : 
              'Registration period has ended'}
          </p>
        </div>
      )}
    
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#014a2f]/20 focus:border-[#014a2f]`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
            Designation *
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.designation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#014a2f]/20 focus:border-[#014a2f]`}
            placeholder="Enter your title or position"
          />
          {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
        </div>

        {/* Only show organization field for non-internal meetings */}
        {meeting && meeting.meetingCategory !== 'INTERNAL' && (
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              Organization *
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#014a2f]/20 focus:border-[#014a2f]`}
              placeholder="Enter your organization name"
            />
            {errors.organization && <p className="mt-1 text-sm text-red-600">{errors.organization}</p>}
          </div>
        )}
        
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number *
          </label>
          <input
            type="tel"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#014a2f]/20 focus:border-[#014a2f]`}
            placeholder="Enter your phone number"
          />
          {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#014a2f]/20 focus:border-[#014a2f]`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Signature field */}
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
                      Signed
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

        {/* Form Actions */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#014a2f]"></div>
              <p className="mt-2 text-gray-600">Loading meeting information...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-4">
              <p className="text-red-500">{loadError}</p>
            </div>
          ) : (
            <div>
              {/* Meeting status indicator */}
              {meeting && (
                <div className={`p-3 mb-4 rounded-md ${meeting.status === 'ONGOING' ? 'bg-green-100' : meeting.status === 'UPCOMING' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${meeting.status === 'ONGOING' ? 'bg-green-500' : meeting.status === 'UPCOMING' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">
                      {meeting.status === 'ONGOING' ? 'Registration Open' : 
                      meeting.status === 'UPCOMING' ? 'Registration Not Open Yet' : 
                      'Registration Closed'}
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    {meeting.status === 'ONGOING' ? 
                      `Registration closes at ${new Date(meeting.registrationEndTime).toLocaleTimeString()}` : 
                    meeting.status === 'UPCOMING' ? 
                      `Registration opens when the meeting starts at ${new Date(meeting.date).toLocaleTimeString()}` : 
                      'Registration period has ended'}
                  </p>
                </div>
              )}
              
              <button
                type="button" 
                disabled={isSubmitting || !meeting || meeting.status !== 'ONGOING'}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${meeting && meeting.status === 'ONGOING' ? 'bg-yellow-400 hover:bg-yellow-500 text-[#014a2f]' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                onClick={(e) => {
                  console.log('Register button clicked manually');
                  if (!isSubmitting && meeting && meeting.status === 'ONGOING') {
                    handleSubmit(e);
                  } else {
                    console.log('Button click ignored - conditions not met', {
                      isSubmitting,
                      meetingStatus: meeting?.status
                    });
                  }
                }}
              >
                {isSubmitting ? "Registering..." : 
                (!meeting) ? "Loading..." :
                (meeting.status === 'UPCOMING') ? "Registration not open yet" :
                (meeting.status !== 'ONGOING') ? "Registration closed" : 
                "Register"}
              </button>
              
              {/* Registration timing note */}
              {meeting && meeting.status === 'ONGOING' && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Registration closes 2 hours after meeting start
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
