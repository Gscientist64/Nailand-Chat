import { interestToRegion } from './categories';

// ============================================================
// NAILAND REGIONS — the seven interest/belonging regions
// (owner spec: V1 Default Regions & Communities).
// These are the canonical "regions" used for routing, discovery,
// community association and the profile dropdown.
// ============================================================

export const NAILAND_REGIONS: { name: string; emoji: string; desc: string }[] = [
  { name: 'Creative', emoji: '🎨', desc: 'Design, UI/UX, visual craft & art' },
  { name: 'Wellness', emoji: '🌿', desc: 'Health, mindfulness & lifestyle' },
  { name: 'Business', emoji: '💼', desc: 'Startups, entrepreneurship & growth' },
  { name: 'Politics', emoji: '🏛️', desc: 'Policy, governance & civic life' },
  { name: 'Economics', emoji: '📈', desc: 'Finance, analytics & markets' },
  { name: 'Tech', emoji: '💻', desc: 'Engineering, AI & the Web2×Web3 bridge' },
  { name: 'Sciences', emoji: '🔬', desc: 'Research, academia & discovery' },
];

// Flat list of region names for dropdowns (profile + onboarding)
export const REGION_OPTIONS: string[] = NAILAND_REGIONS.map((r) => r.name);

// ============================================================
// NIGERIA GEOGRAPHY — the 6 geo-political zones + FCT
// Used for the dashboard Nigeria map (physical geography),
// distinct from the NaiLAND interest-region model.
// ============================================================

export const NIGERIA_REGIONS: { name: string; states: string[] }[] = [
  { name: 'North West', states: ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Kebbi', 'Zamfara', 'Jigawa'] },
  { name: 'North East', states: ['Borno', 'Yobe', 'Adamawa', 'Bauchi', 'Gombe', 'Taraba'] },
  { name: 'North Central', states: ['Niger', 'Kwara', 'Kogi', 'Benue', 'Plateau', 'Nasarawa', 'FCT Abuja'] },
  { name: 'South West', states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'] },
  { name: 'South East', states: ['Enugu', 'Anambra', 'Imo', 'Abia', 'Ebonyi'] },
  { name: 'South South', states: ['Rivers', 'Bayelsa', 'Delta', 'Akwa Ibom', 'Cross River', 'Edo'] },
];

// All Nigerian states (flat)
export const NIGERIAN_STATES: string[] = NIGERIA_REGIONS.flatMap((r) => r.states);

// Resolve a stored region value to a valid NaiLAND region option.
// Falls back to the region derived from the user's interests.
export function normalizeRegion(region?: string | null, interests?: string[]): string {
  if (region && REGION_OPTIONS.includes(region)) return region;
  return interestToRegion(interests || []);
}
