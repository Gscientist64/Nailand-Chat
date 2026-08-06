// Avatar helpers: derive initials and detect whether an avatar URL is a real
// custom picture vs the generic placeholder used as a default.

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120';

export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const initials = parts.map((p) => (p[0] || '')).join('').slice(0, 2).toUpperCase();
  return initials || '?';
}

// A "real" avatar is a non-empty URL that isn't the generic default placeholder.
export function hasRealAvatar(url?: string | null): boolean {
  return !!url && url.trim() !== '' && !url.includes('photo-1534528741775-53994a69daeb');
}
