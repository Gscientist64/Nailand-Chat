// ============================================================
// NIGERIA REGIONS — the 6 geo-political zones + FCT
// Used for the profile region dropdown and the dashboard map.
// ============================================================

export const NIGERIA_REGIONS: { name: string; states: string[] }[] = [
  { name: 'North West', states: ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Kebbi', 'Zamfara', 'Jigawa'] },
  { name: 'North East', states: ['Borno', 'Yobe', 'Adamawa', 'Bauchi', 'Gombe', 'Taraba'] },
  { name: 'North Central', states: ['Niger', 'Kwara', 'Kogi', 'Benue', 'Plateau', 'Nasarawa', 'FCT Abuja'] },
  { name: 'South West', states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'] },
  { name: 'South East', states: ['Enugu', 'Anambra', 'Imo', 'Abia', 'Ebonyi'] },
  { name: 'South South', states: ['Rivers', 'Bayelsa', 'Delta', 'Akwa Ibom', 'Cross River', 'Edo'] },
];

// Flat list of region names for dropdowns
export const REGION_OPTIONS: string[] = NIGERIA_REGIONS.map((r) => r.name);

// All Nigerian states (flat) — useful for finer-grained selection
export const NIGERIAN_STATES: string[] = NIGERIA_REGIONS.flatMap((r) => r.states);

// Resolve a stored region value to a valid dropdown option (fallback to North West)
export function normalizeRegion(region?: string | null): string {
  if (region && REGION_OPTIONS.includes(region)) return region;
  if (region && NIGERIAN_STATES.includes(region)) {
    const zone = NIGERIA_REGIONS.find((r) => r.states.includes(region));
    return zone ? zone.name : 'North West';
  }
  return 'North West';
}
