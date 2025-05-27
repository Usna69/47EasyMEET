/**
 * Determines if a meeting has a letterhead and returns header and footer image data
 * First checks for a custom letterhead uploaded by the meeting creator
 * Falls back to sector-based letterhead if no custom letterhead exists
 * @param sectorCode The sector code to determine which letterhead to use
 * @param customLetterheadPath Optional path to a custom letterhead for this meeting
 * @returns Promise with header and footer image data
 */
export async function getSectorLetterhead(sectorCode: string, customLetterheadPath?: string): Promise<{
  hasLetterhead: boolean;
  headerImageData?: string;
  footerImageData?: string;
}> {
  // Base URL for the application - used to construct full URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Check for custom letterhead first
  if (customLetterheadPath) {
    try {
      const headerImagePath = `${baseUrl}${customLetterheadPath}`;
      
      console.log(`Using custom letterhead:`, headerImagePath);
      
      return {
        hasLetterhead: true,
        headerImageData: headerImagePath,
        footerImageData: undefined
      };
    } catch (error) {
      console.error('Error setting up custom letterhead:', error);
      // Fall back to sector letterhead
    }
  }
  
  // Fall back to sector letterhead if no custom letterhead or if there was an error
  if (sectorCode === 'OG' || sectorCode === 'DMC' || sectorCode === 'IDE') {
    try {
      // Use direct reference to the file in the public directory
      const headerImagePath = `${baseUrl}/letterheads/${sectorCode}.jpg`;
      
      console.log(`Using ${sectorCode} letterhead from public directory:`, headerImagePath);
      
      // Return the image path - will be converted to data URL in the client code
      return {
        hasLetterhead: true,
        headerImageData: headerImagePath,
        // No footer image as it will be included in the letterhead jpg
        footerImageData: undefined
      };
    } catch (error) {
      console.error('Error setting up sector letterhead:', error);
      return { hasLetterhead: false };
    }
  }
  
  // Default: No letterhead
  return { hasLetterhead: false };
}
