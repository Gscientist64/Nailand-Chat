import React from 'react';

/**
 * Stylized map of Nigeria showing the 6 geopolitical zones ("regions").
 * Renders a Nigeria silhouette with the six zones tinted + labelled.
 */
const ZONES = [
  {
    name: 'North West',
    color: '#FFB300',
    points: '130,88 210,78 255,88 255,235 140,240 85,212 78,175 95,120',
    label: [168, 165] as [number, number],
  },
  {
    name: 'North East',
    color: '#FF7043',
    points: '260,90 400,82 500,102 550,130 570,165 580,210 585,250 480,258 430,242 385,224 335,206 300,190 260,180',
    label: [430, 178] as [number, number],
  },
  {
    name: 'North Central',
    color: '#26A69A',
    points: '82,214 142,242 262,237 267,182 300,192 337,208 387,226 432,244 482,260 582,252 570,300 540,330 500,345 440,345 380,340 320,335 260,330 200,318 150,300 108,275',
    label: [330, 285] as [number, number],
  },
  {
    name: 'South West',
    color: '#42A5F5',
    points: '90,258 115,290 165,308 222,322 278,334 275,372 258,410 232,436 205,452 178,456 150,442 126,416 105,388 92,355 84,315',
    label: [180, 385] as [number, number],
  },
  {
    name: 'South East',
    color: '#AB47BC',
    points: '285,336 340,342 400,346 455,352 510,350 545,340 562,320 572,295 580,268 585,253 484,260 434,245 387,227 337,210 302,194 268,186 266,240 280,300',
    label: [440, 300] as [number, number],
  },
  {
    name: 'South South',
    color: '#66BB6A',
    points: '180,458 208,454 236,442 260,412 280,372 287,336 340,344 400,348 455,354 510,352 530,370 515,410 490,440 455,462 425,470 390,466 360,454 330,448 300,448 268,450 240,460 205,468 175,460',
    label: [390, 430] as [number, number],
  },
];

export default function NigeriaMap({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 560"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Map of Nigeria showing regions"
    >
      {/* Subtle ocean/grid backdrop */}
      <defs>
        <pattern id="ng-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#E0E0E0" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="600" height="560" fill="#F5F5F0" />
      <rect width="600" height="560" fill="url(#ng-grid)" opacity="0.6" />

      {/* Nigeria silhouette outline */}
      <path
        d="M125 82 Q 200 70, 300 74 Q 400 78, 490 96 Q 545 108, 575 140 Q 600 180, 592 225 Q 596 265, 578 305 Q 570 345, 548 380 Q 530 410, 500 432 Q 470 452, 430 462 Q 395 468, 360 456 Q 330 446, 300 446 Q 270 446, 240 456 Q 205 468, 175 458 Q 145 448, 122 425 Q 100 402, 84 372 Q 66 340, 62 305 Q 58 270, 62 235 Q 60 200, 70 165 Q 82 130, 125 82 Z"
        fill="#E8E2D3"
        stroke="#B9B09B"
        strokeWidth="2"
      />

      {/* Six geopolitical zones */}
      {ZONES.map((z) => (
        <polygon
          key={z.name}
          points={z.points}
          fill={z.color}
          fillOpacity="0.28"
          stroke={z.color}
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
      ))}

      {/* Zone labels */}
      {ZONES.map((z) => (
        <g key={z.name}>
          <circle cx={z.label[0]} cy={z.label[1]} r="4.5" fill={z.color} stroke="#fff" strokeWidth="1.5" />
          <text
            x={z.label[0]}
            y={z.label[1] + (z.name === 'South West' ? 18 : 14)}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill={z.color}
            style={{ fontFamily: 'ui-sans-serif, system-ui' }}
          >
            {z.name}
          </text>
        </g>
      ))}

      {/* Country label */}
      <text
        x="300"
        y="510"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#6B6553"
        letterSpacing="4"
        style={{ fontFamily: 'ui-sans-serif, system-ui' }}
      >
        NIGERIA
      </text>
    </svg>
  );
}
