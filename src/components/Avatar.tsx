import React from 'react';
import { getInitials, hasRealAvatar } from '../lib/avatar';

interface AvatarProps {
  name: string;
  src?: string | null;
  /** Sizing + border + shape classes, e.g. "w-10 h-10 rounded-full" */
  className?: string;
  /** Font size for the initials fallback */
  textClassName?: string;
}

/**
 * Renders a real profile picture when one exists, otherwise falls back to a
 * colored circle with the person's name initials.
 */
export default function Avatar({
  name,
  src,
  className = 'w-10 h-10 rounded-full',
  textClassName = 'text-xs',
}: AvatarProps) {
  if (hasRealAvatar(src)) {
    return (
      <img
        src={src!}
        alt={name}
        className={`${className} object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${className} bg-amber-100 text-amber-700 flex items-center justify-center font-bold select-none shrink-0`}
      aria-label={name}
    >
      <span className={textClassName}>{getInitials(name)}</span>
    </div>
  );
}
