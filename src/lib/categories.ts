// Community categories ("regions") shown across the dashboard & community pages.
export const CATEGORIES = ['Creative', 'Wellness', 'Business', 'Politics', 'Economics', 'Tech', 'Sciences'];

// Map each category to community tag keywords so filtering is real.
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Creative: ['Design', 'Figma', 'UI/UX', 'UX', 'Prototyping', 'Adobe', 'Illustrator', 'Photoshop'],
  Tech: ['Coding', 'React', 'Node', 'TypeScript', 'Web3', 'Blockchain', 'Solidity', 'dApps', 'Tech'],
  Wellness: ['Wellness', 'Health'],
  Business: ['Business', 'Marketing', 'Startup'],
  Politics: ['Politics'],
  Economics: ['Economics', 'Finance'],
  Sciences: ['Sciences', 'Science', 'Research'],
};

export function categoryMatchesTags(category: string, tags: string[]): boolean {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  if (keywords.length === 0) return false;
  const lowerTags = (tags || []).map((t) => t.toLowerCase());
  return keywords.some((k) => lowerTags.some((t) => t.includes(k.toLowerCase())));
}
