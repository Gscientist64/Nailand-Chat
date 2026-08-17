// The seven NaiLAND regions (owner spec: V1 Default Regions & Communities).
export const CATEGORIES = ['Creative', 'Wellness', 'Business', 'Politics', 'Economics', 'Tech', 'Sciences'];

// Map each category to community tag keywords so filtering is real.
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Creative: ['Design', 'Figma', 'UI/UX', 'UX', 'Prototyping', 'Adobe', 'Illustrator', 'Photoshop', 'Creative', 'Visual', 'Art', 'Wireframing'],
  Tech: ['Coding', 'React', 'Node', 'TypeScript', 'Web3', 'Blockchain', 'Solidity', 'dApps', 'Tech', 'AI', 'Artificial', 'Machine Learning', 'Data Science', 'SaaS', 'Frontend', 'Backend', 'Mobile', 'Flutter', 'Fullstack'],
  Wellness: ['Wellness', 'Health', 'Fitness', 'Mindful', 'Mental', 'Lifestyle', 'Spirituality', 'Meditation', 'Mindfulness'],
  Business: ['Business', 'Marketing', 'Startup', 'Entrepreneur', 'Venture', 'Pitch', 'Growth', 'Micro-gigs', 'Commerce', 'Monetization'],
  Politics: ['Politics', 'Policy', 'Governance', 'Civic', 'Government'],
  Economics: ['Economics', 'Finance', 'Analytics', 'Data Analyst', 'Investment', 'Trade', 'Market'],
  Sciences: ['Sciences', 'Science', 'Research', 'Academic', 'Laboratory', 'Data Science'],
};

export function categoryMatchesTags(category: string, tags: string[]): boolean {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  if (keywords.length === 0) return false;
  const lowerTags = (tags || []).map((t) => t.toLowerCase());
  return keywords.some((k) => lowerTags.some((t) => t.includes(k.toLowerCase())));
}

// Spec §3 — User routing: interests determine the user's primary region.
// Returns the region with the most keyword matches; ties break to first region.
export function interestToRegion(interests: string[]): string {
  const lower = (interests || []).map((i) => i.toLowerCase());
  let best = 'Creative';
  let bestScore = 0;
  for (const region of CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[region] || [];
    let score = 0;
    for (const kw of keywords) {
      const k = kw.toLowerCase();
      if (lower.some((t) => t.includes(k))) score += 1;
      else if (lower.some((t) => k.includes(t) && t.length > 3)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = region;
    }
  }
  return best;
}

// Spec §13 — Community discovery scoring:
// Interest Match 60% + Region Match 25% + Activity 15%
export interface CommunityScorable {
  id: string;
  name: string;
  tags?: string[];
  region?: string;
  memberCount?: number;
}

export function scoreCommunity(community: CommunityScorable, userInterests: string[], userRegion: string): number {
  // Interest match (0..1): proportion of the user's interests matching the community tags/region
  const lowerInterests = (userInterests || []).map((i) => i.toLowerCase());
  let interestHits = 0;
  for (const interest of lowerInterests) {
    const tagMatch = (community.tags || []).some((t) => t.toLowerCase().includes(interest) || interest.includes(t.toLowerCase()));
    const regionMatch = community.region ? interest.includes(community.region.toLowerCase()) || community.region.toLowerCase().includes(interest) : false;
    if (tagMatch || regionMatch) interestHits += 1;
  }
  const interestMatch = lowerInterests.length > 0 ? interestHits / lowerInterests.length : 0;

  // Region match (0 or 1)
  const regionMatch = community.region ? community.region.toLowerCase() === (userRegion || '').toLowerCase() ? 1 : 0 : 0;

  // Activity (0..1): normalized by a soft cap (50 members = full activity)
  const activity = Math.min(1, (community.memberCount || 0) / 50);

  return Math.round((interestMatch * 60 + regionMatch * 25 + activity * 15) * 100) / 100;
}
