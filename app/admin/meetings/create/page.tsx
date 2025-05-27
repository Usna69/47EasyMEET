'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionAuth } from '../../../../lib/session-auth';
import { getAllSectors } from '../../../../utils/sectorUtils';

// Using React hooks directly from React import
const { useState, useEffect } = React;

export default function CreateMeetingPage() {
  const router = useRouter();
  const auth = useSessionAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorPopup, setErrorPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

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
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  
  // Get sectors data from the utility function
  const [sectors, setSectors] = useState<Array<{name: string, code: string}>>(getAllSectors());
  
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

  // Handle letterhead file upload
  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type (only JPG)
      if (!file.type.includes('image/jpeg')) {
        setError('Letterhead must be a JPG image');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Letterhead image must be less than 5MB');
        return;
      }
      
      setLetterheadFile(file);
      setError('');
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
    setErrorPopup(false);
    setSuccessPopup(false);
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
      
      // Validate letterhead if provided
      if (letterheadFile) {
        if (!letterheadFile.type.includes('image/jpeg')) {
          setError('Letterhead must be a JPG image');
          setLoading(false);
          return;
        }
        
        if (letterheadFile.size > 5 * 1024 * 1024) {
          setError('Letterhead image must be less than 5MB');
          setLoading(false);
          return;
        }
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
      const now = new Date();
      
      // Validate meeting is not in the past
      if (meetingDateTime < now) {
        setError('Cannot create meetings in the past. Please select a future date and time.');
        setErrorPopup(true);
        setLoading(false);
        return;
      }
      
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
        formData.append('onlineMeetingUrl', onlineMeetingUrl);
      } else if (meetingType === 'HYBRID') {
        formData.append('location', location);
        formData.append('onlineMeetingUrl', onlineMeetingUrl);
      }
      
      // Append letterhead file if available
      if (letterheadFile) {
        formData.append('letterhead', letterheadFile);
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
        // Show success popup and scroll to top
        setSuccessPopup(true);
        
        // Scroll to the top of the page
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Extended delay (5 seconds) for better user experience
        setTimeout(() => {
          router.push('/admin');
        }, 5000); // Redirect after 5 seconds
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create meeting');
        setErrorPopup(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setErrorPopup(true);
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
            <h2 className="text-2xl font-bold text-center text-[#014a2f] mb-2">Meeting Created!</h2>
            <p className="text-gray-600 text-center mb-6">Your meeting has been successfully created. You will be redirected to the dashboard in 5 seconds.</p>
            
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
      
      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border-2 border-red-500">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-500 rounded-full p-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            
            <div className="text-center">
              <button 
                onClick={() => setErrorPopup(false)} 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 inline-block"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              {sectors.map((sectorOption: {name: string, code: string}) => (
                <option key={sectorOption.code} value={sectorOption.code}>
                  {sectorOption.name}
                </option>
              ))}
              
              {/* Show sectors from API if available */}
              {apiSectors.length > 0 && 
                apiSectors
                  .filter((apiSector: string) => !sectors.some((s: {name: string, code: string}) => s.code === apiSector))
                  .map((apiSector: string) => (
                    <option key={apiSector} value={apiSector}>
                      {apiSector}
                    </option>
                  ))
              }
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Letterhead (Optional)
          </label>
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            <input
              type="file"
              onChange={handleLetterheadUpload}
              className="hidden"
              id="letterhead-upload"
              accept="image/jpeg"
            />
            <label
              htmlFor="letterhead-upload"
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-md inline-block"
            >
              Select Letterhead Image
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Upload a JPG image to use as a custom letterhead (max 5MB)
            </p>

            {letterheadFile && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Letterhead:</p>
                  <p>{letterheadFile.name} ({(letterheadFile.size / 1024).toFixed(1)} KB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLetterheadFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

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
