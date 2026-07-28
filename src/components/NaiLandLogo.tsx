import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function NaiLandLogo({ className = '', size = 'md' }: LogoProps) {
  // Dimensions based on size
  const sizes = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-28 w-auto',
  };

  return (
    <div className={`flex items-center gap-1.5 font-sans select-none ${className}`} id="nailand-logo-container">
      <svg
        className={`object-contain ${sizes[size]}`}
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="nailand-logo-svg"
      >
        {/* Sun Backing */}
        <circle cx="100" cy="55" r="26" fill="url(#sun-grad)" />
        
        {/* Sun Rays */}
        <path d="M100 20 L100 14" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M125 30 L131 25" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M135 55 L141 55" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M125 80 L131 85" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 90 L100 96" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M75 80 L69 85" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M65 55 L59 55" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M75 30 L69 25" stroke="#f8c21a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Cityscape silhouettes in black */}
        <path
          d="M60 68 L60 62 L63 62 L63 58 L68 58 L68 64 L72 64 L72 55 L78 55 L78 68 M122 68 L122 59 L126 59 L126 53 L132 53 L132 61 L136 61 L136 56 L140 56 L140 68"
          stroke="#000000"
          strokeWidth="1.5"
          fill="#000000"
        />
        <rect x="79" y="52" width="7" height="16" fill="#000" />
        <rect x="114" y="50" width="6" height="18" fill="#000" />
        <polygon points="100,42 96,48 104,48" fill="#000" />
        <rect x="98" y="48" width="4" height="20" fill="#000" />

        {/* Winding Golden Road */}
        <path
          d="M100 68 C85 68, 88 84, 75 84 C62 84, 55 96, 100 96 C145 96, 138 84, 125 84 C112 84, 115 68, 100 68 Z"
          fill="url(#road-grad)"
          stroke="#e0ac10"
          strokeWidth="1"
        />
        <path
          d="M100 68 C100 75, 95 80, 90 92 C95 90, 99 91, 100 96"
          stroke="#ffffff"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* Curve base representing open book or stylized banner */}
        <path
          d="M40 98 C80 114, 120 114, 160 98 C140 92, 60 92, 40 98 Z"
          fill="url(#banner-grad)"
        />

        {/* NaiLAND Text */}
        <text
          x="100"
          y="88"
          textAnchor="middle"
          fill="#f8c21a"
          stroke="#261a02"
          strokeWidth="1.5"
          fontWeight="bold"
          fontSize="24"
          fontStyle="sans-serif"
          className="tracking-tight select-none"
          style={{ letterSpacing: '-0.5px' }}
        >
          NaiLAND
        </text>

        {/* Linear Gradients inside logo */}
        <defs>
          <linearGradient id="sun-grad" x1="100" y1="29" x2="100" y2="81" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffee55" />
            <stop offset="60%" stopColor="#f8c21a" />
            <stop offset="100%" stopColor="#ea8c08" />
          </linearGradient>
          <linearGradient id="road-grad" x1="100" y1="68" x2="100" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ea8c08" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="banner-grad" x1="100" y1="92" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      {/* Visual string representation if SVG is tiny */}
      {size === 'sm' && (
        <span className="font-serif font-bold text-lg text-neutral-800 tracking-tight">
          Nai<span className="text-[#f8c21a]">Land</span>
        </span>
      )}
    </div>
  );
}
