/**
 * Utility functions for working with meeting sectors
 */

// Map of sector codes to full names
const SECTOR_NAMES: Record<string, string> = {
  'IDE': 'ICT & Digital Economy',
  'FIN': 'Finance',
  'EDU': 'Education',
  'HEA': 'Health',
  'AGR': 'Agriculture',
  'TRA': 'Transport',
  'ENV': 'Environment',
  'SEC': 'Security',
  'OTH': 'Other'
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
