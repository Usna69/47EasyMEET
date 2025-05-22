/**
 * Utility functions for working with meeting sectors
 */

// Map of sector codes to full names
const SECTOR_NAMES: Record<string, string> = {
  'F&EPA': 'Finance and Economic Planning Affairs',
  'IDE': 'Innovation and Digital Economy',
  'TS&DC': 'Talents, Skills Development and Care',
  'M&W': 'Mobility and Works',
  'BE&UP': 'Built Environment and Urban Planning Sector',
  'BA&P': 'Boroughs Administration and Personnel',
  'B&HO': 'Business and Hustler Opportunities',
  'GN': 'Green Nairobi (Environment, Water, Food and Agriculture)',
  'HW&N': 'Health Wellness and Nutrition',
  'IPP&CS': 'Inclusivity, Public Participation and Customer Service Sector'
};

/**
 * Get the full name of a sector from its code
 * @param sectorCode The sector code
 * @returns The full name of the sector or "All Sectors" if not found
 */
export function getSectorName(sectorCode: string): string {
  return SECTOR_NAMES[sectorCode] || 'All Sectors';
}

/**
 * Get a list of all available sector options
 * @returns Array of {code, name} objects for all sectors
 */
export function getAllSectors(): Array<{code: string, name: string}> {
  return Object.entries(SECTOR_NAMES).map(([code, name]) => ({
    code,
    name
  }));
}
