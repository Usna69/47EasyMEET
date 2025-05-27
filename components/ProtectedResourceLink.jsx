'use client';

import React, { useState, useEffect } from 'react';
import ResourcePasswordPrompt from './ResourcePasswordPrompt';

export default function ProtectedResourceLink({ 
  resourceId, 
  fileName, 
  isProtected = false,
  children
}) {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if the resource is already authenticated from session storage
  useEffect(() => {
    if (isProtected) {
      const token = sessionStorage.getItem(`resource_token_${resourceId}`);
      setIsAuthenticated(!!token);
    } else {
      setIsAuthenticated(true);
    }
  }, [resourceId, isProtected]);
  
  const handleResourceClick = (e) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      setShowPasswordPrompt(true);
    }
  };
  
  const handlePasswordValidated = (token) => {
    setShowPasswordPrompt(false);
    
    if (token) {
      setIsAuthenticated(true);
      
      // Automatically download the resource after successful authentication
      downloadResource(token);
    }
  };
  
  const downloadResource = async (token) => {
    setIsLoading(true);
    
    try {
      // Fetch the resource with the token in the Authorization header
      const response = await fetch(`/api/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download resource');
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading resource:', error);
      // If there's an error, reset the authentication
      setIsAuthenticated(false);
      sessionStorage.removeItem(`resource_token_${resourceId}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div 
        onClick={handleResourceClick} 
        className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {children}
      </div>
      
      {showPasswordPrompt && (
        <ResourcePasswordPrompt
          resourceId={resourceId}
          onValidated={handlePasswordValidated}
        />
      )}
    </>
  );
}
