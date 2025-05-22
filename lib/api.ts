/**
 * API helper functions for client-side data fetching
 */

/**
 * Fetch meetings with optional sector filter
 * @param sector Optional sector code to filter by
 * @returns Array of meetings
 */
export async function fetchMeetings(sector?: string) {
  try {
    const url = sector 
      ? `/api/meetings?sector=${encodeURIComponent(sector)}` 
      : '/api/meetings';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}
