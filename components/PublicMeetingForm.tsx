'use client';

import React from 'react';
const { useState } = React;
import { useRouter } from 'next/navigation';

interface PublicMeetingFormProps {
  onSuccess?: (id: string) => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  location: string;
  creatorEmail: string;
  sector: string;
  creatorType: string;
}

export default function PublicMeetingForm({ onSuccess }: PublicMeetingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    location: '',
    creatorEmail: '',
    sector: '',
    creatorType: '',
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    creatorEmail: '',
    sector: '',
    creatorType: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      date: '',
      location: '',
      creatorEmail: '',
      sector: '',
      creatorType: '',
    };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date and time are required';
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }
    
    if (!formData.creatorEmail.trim()) {
      newErrors.creatorEmail = 'Your email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.creatorEmail)) {
      newErrors.creatorEmail = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.sector) {
      newErrors.sector = 'Sector is required';
      isValid = false;
    }

    if (!formData.creatorType) {
      newErrors.creatorType = 'Meeting category is required';
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

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          creatorEmail: formData.creatorEmail,
          sector: formData.sector,
          creatorType: formData.creatorType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        // Go to success page
        router.push(`/meetings/${data.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`An error occurred. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
          }`}
          placeholder="Enter meeting title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
          }`}
          placeholder="Enter meeting description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.date ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
          }`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
          }`}
          placeholder="Enter meeting location"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>
      
      <div>
        <label htmlFor="creatorEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Your Email
        </label>
        <input
          type="email"
          id="creatorEmail"
          name="creatorEmail"
          value={formData.creatorEmail}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.creatorEmail ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
          }`}
          placeholder="Enter your email address"
        />
        {errors.creatorEmail && <p className="mt-1 text-sm text-red-600">{errors.creatorEmail}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Sector <span className="text-red-500">*</span>
          </label>
          <select
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.sector ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
            }`}
          >
            <option value="">Select sector</option>
            <option value="IDE">ICT & Digital Economy</option>
            <option value="FIN">Finance</option>
            <option value="EDU">Education</option>
            <option value="HEA">Health</option>
            <option value="AGR">Agriculture</option>
            <option value="TRA">Transport</option>
            <option value="ENV">Environment</option>
            <option value="SEC">Security</option>
            <option value="OTH">Other</option>
          </select>
          {errors.sector && <p className="mt-1 text-sm text-red-600">{errors.sector}</p>}
        </div>

        <div>
          <label htmlFor="creatorType" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Category <span className="text-red-500">*</span>
          </label>
          <select
            id="creatorType"
            name="creatorType"
            value={formData.creatorType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.creatorType ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#014a2f]/30'
            }`}
          >
            <option value="">Select category</option>
            <option value="INT">Internal</option>
            <option value="DEP">Departmental</option>
            <option value="STK">Stakeholder</option>
          </select>
          {errors.creatorType && <p className="mt-1 text-sm text-red-600">{errors.creatorType}</p>}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors w-full flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>Create Meeting</>
          )}
        </button>
      </div>
    </form>
  );
}
