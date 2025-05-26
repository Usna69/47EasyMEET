/**
 * Determines if a sector has letterhead and returns header and footer image data
 * Uses an approach that works with jsPDF by returning proper image URLs
 * @param sectorCode The sector code to determine which letterhead to use
 * @returns Promise with header and footer image data
 */
export async function getSectorLetterhead(sectorCode: string): Promise<{
  hasLetterhead: boolean;
  headerImageData?: string;
  footerImageData?: string;
}> {
  // Base URL for the application - used to construct full URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Check if this sector has a letterhead
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
