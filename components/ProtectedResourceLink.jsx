'use client';

import React from 'react';

export default function ProtectedResourceLink({ 
  resourceId, 
  fileName, 
  children
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const downloadResource = async () => {
    setIsLoading(true);
    
    try {
      // Fetch the resource directly without any authentication
      const response = await fetch(`/api/resources/${resourceId}`);
      
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
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      onClick={downloadResource} 
      className={`${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
    >
      {children}
    </div>
  );
}
