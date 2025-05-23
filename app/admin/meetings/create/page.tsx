'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionAuth } from '../../../../lib/session-auth';

// Using React hooks directly from React import
const { useState, useEffect } = React;

export default function CreateMeetingPage() {
  const router = useRouter();
  const auth = useSessionAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('');
  const [meetingType, setMeetingType] = useState('PHYSICAL');
  const [meetingCategory, setMeetingCategory] = useState('INTERNAL');  // INTERNAL, EXTERNAL, STAKEHOLDER
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [resources, setResources] = useState<File[]>([]);
  
  // Sectors data with official codes
  const [sectors, setSectors] = useState<Array<{name: string, code: string}>>([  
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
  ]);
  
  // Fetch sectors from API
  const [apiSectors, setApiSectors] = useState<string[]>([]);
  
  // Fetch sectors from API
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch('/api/sectors');
        if (response.ok) {
          const data = await response.json();
          if (data.sectors && Array.isArray(data.sectors)) {
            setApiSectors(data.sectors);
          }
        }
      } catch (error) {
        console.error('Error fetching sectors:', error);
      }
    };
    
    fetchSectors();
  }, []);

  // No automatic redirects - we'll handle authentication in the render logic

  // Authorized roles for meeting creation
  const authorizedRoles = ['ADMIN', 'CREATOR'];

  // Check if user is authorized to create meetings
  useEffect(() => {
    if (auth.isLoggedIn && !auth.isAuthorized(authorizedRoles)) {
      setError('You do not have permission to create meetings');
    }
  }, [auth]);

  // Calculate registration end time (2 hours after meeting start)
  const calculateRegistrationEnd = () => {
    if (!date || !time) return null;
    
    const meetingDateTime = new Date(`${date}T${time}`);
    const registrationEnd = new Date(meetingDateTime);
    registrationEnd.setHours(registrationEnd.getHours() + 2);
    
    return registrationEnd.toISOString();
  };

  // Handle resource file uploads
  const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setResources((prev: File[]) => [...prev, ...newFiles]);
    }
  };

  // Remove a resource file
  const removeResource = (index: number) => {
    setResources((prev: File[]) => prev.filter((_, i: number) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate form
      if (!title || !description || !date || !time || !sector) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Validate based on meeting type
      if (meetingType === 'PHYSICAL' && !location) {
        setError('Please provide a physical location for the meeting');
        setLoading(false);
        return;
      }

      // Validate online meeting URL if meeting type is ONLINE or HYBRID
      if ((meetingType === 'ONLINE' || meetingType === 'HYBRID') && !onlineMeetingUrl) {
        setError('Please provide a meeting URL for online or hybrid meetings');
        setLoading(false);
        return;
      }
      
      // For hybrid meetings, validate both physical location and online URL
      if (meetingType === 'HYBRID' && !location) {
        setError('Please provide a physical location for hybrid meetings');
        setLoading(false);
        return;
      }

      // Combine date and time into a single DateTime
      const meetingDateTime = new Date(`${date}T${time}`);
      const registrationEnd = calculateRegistrationEnd();

      // Create form data for file uploads
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', meetingDateTime.toISOString());
      formData.append('sector', sector);
      formData.append('meetingType', meetingType);
      formData.append('meetingCategory', meetingCategory);
      formData.append('registrationEnd', registrationEnd || '');
      
      // Handle different meeting types
      if (meetingType === 'PHYSICAL') {
        formData.append('location', location);
      } else if (meetingType === 'ONLINE') {
        // For online meetings, use the URL as location too for compatibility
        formData.append('location', 'Online Meeting');
        formData.append('onlineMeetingUrl', onlineMeetingUrl);
      } else if (meetingType === 'HYBRID') {
        formData.append('location', location);
        formData.append('onlineMeetingUrl', onlineMeetingUrl);
      }

      // Add creator information
      if (auth.user) {
        formData.append('creatorEmail', auth.user.email);
        formData.append('creatorType', auth.user.role);
      }

      // Add resource files
      resources.forEach((file: File, index: number) => {
        formData.append(`resource-${index}`, file);
      });

      // Submit meeting data
      const response = await fetch('/api/meetings', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create meeting');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show login message instead of redirecting
  if (!auth?.isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#014a2f]">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to create meetings.</p>
          <a 
            href="/admin/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-[#014a2f] px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#014a2f]">Create New Meeting</h1>
        <a href="/admin" className="text-gray-600 hover:text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-green-700 font-medium">Meeting created successfully!</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setTitle('');
                      setDescription('');
                      setDate('');
                      setTime('');
                      setLocation('');
                      setSector('');
                      setMeetingType('PHYSICAL');
                      setMeetingCategory('INTERNAL');
                      setOnlineMeetingUrl('');
                      setResources([]);
                    }}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Create Another Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/admin/meetings'}
                    className="ml-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    View All Meetings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
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
                Registration will close 2 hours after the meeting start time.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector *
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a sector</option>
              {/* Show predefined sectors */}
              <optgroup label="Official Sectors">
                {sectors.map((sectorOption: {name: string, code: string}) => (
                  <option key={sectorOption.code} value={sectorOption.code}>
                    {sectorOption.name} ({sectorOption.code})
                  </option>
                ))}
              </optgroup>
              
              {/* Show sectors from API if available */}
              {apiSectors.length > 0 && (
                <optgroup label="Other Sectors">
                  {apiSectors
                    .filter((apiSector: string) => !sectors.some((s: {name: string, code: string}) => s.code === apiSector))
                    .map((apiSector: string) => (
                      <option key={apiSector} value={apiSector}>
                        {apiSector}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

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
              <option value="EXTERNAL">External</option>
              <option value="STAKEHOLDER">Stakeholder</option>
            </select>
          </div>

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
            <p className="text-sm text-gray-500 mt-1">
              Select the appropriate meeting format
            </p>
          </div>

          {/* Show physical location for PHYSICAL and HYBRID meeting types */}
          {(meetingType === 'PHYSICAL' || meetingType === 'HYBRID') && (
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
          
          {/* Show online meeting URL for ONLINE and HYBRID meeting types */}
          {(meetingType === 'ONLINE' || meetingType === 'HYBRID') && (
            <div className={meetingType === 'HYBRID' ? 'mt-4' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Online Meeting URL *
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={onlineMeetingUrl}
                  onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/... or https://zoom.us/..."
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  required
                />
                <select 
                  className="w-40 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => {
                    if (e.target.value) {
                      setOnlineMeetingUrl(e.target.value);
                    }
                  }}
                >
                  <option value="">Platform</option>
                  <option value="https://meet.google.com/">Google Meet</option>
                  <option value="https://teams.microsoft.com/l/meetup-join/">MS Teams</option>
                  <option value="https://zoom.us/j/">Zoom</option>
                </select>
              </div>
            </div>
          )}

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
              Upload presentations, documents, or other meeting materials (PDF, PPTX, DOCX, etc.)
            </p>

            {resources.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium">Selected Files:</p>
                <ul className="list-disc pl-5">
                  {resources.map((file: File, index: number) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
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
          </div>
        </div>

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
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </form>
        </div>
    )}
  </div>
  );
}
