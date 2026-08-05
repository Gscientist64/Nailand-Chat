import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useCommunities } from '../lib/CommunitiesContext';
import { dashboardApi, mapPinsApi } from '../lib/api';
import { Search, MapPin, Sparkles, SlidersHorizontal, ChevronRight, Globe, Check, Users, Star, ArrowLeft, Lock, Rocket, Users2, MessageCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardHomeProps {
  user: import('../types').UserProfile;
  onSelectCommunity: (comName: string) => void;
  onSelectDirectChat: (personName: string, avatar: string) => void;
}

export default function DashboardHome({ user, onSelectCommunity, onSelectDirectChat }: DashboardHomeProps) {
  const { isAuthenticated } = useAuth();
  const { communities, isLoading } = useCommunities();
  const [activeRegion, setActiveRegion] = useState('Creative');

  // Dashboard stats from API
  const [stats, setStats] = useState<{ totalUsers: number; totalCommunities: number; totalCollabs: number; totalMessages: number; totalMemberships: number; totalSkillRequests: number } | null>(null);

  // Interactive map pins from API
  const [mapPins, setMapPins] = useState<any[]>([]);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // Fetch stats + map pins
  useEffect(() => {
    dashboardApi.stats().then((res) => {
      if (res.success && res.data) setStats(res.data);
    });
    mapPinsApi.list().then((res) => {
      if (res.success && res.data) setMapPins(res.data);
    });
  }, []);

  // Suggested region pills structure
  const suggestedRegions = [
    { name: 'Creative', icon: '🌍', iconBg: 'bg-[#E3F2FD] text-[#1E88E5]', ringColor: 'border-blue-200' },
    { name: 'Tech', icon: '🪐', iconBg: 'bg-[#E0F2F1] text-[#00897B]', ringColor: 'border-teal-200' },
    { name: 'Wellness', icon: '🌺', iconBg: 'bg-[#FFEBEE] text-[#E53935]', ringColor: 'border-rose-200' },
    { name: 'Business', icon: '💼', iconBg: 'bg-[#ECEFF1] text-[#546E7A]', ringColor: 'border-slate-200' },
    { name: 'Politics', icon: '👑', iconBg: 'bg-[#FFF8E1] text-[#FFB300]', ringColor: 'border-amber-200' },
    { name: 'Economics', icon: '📈', iconBg: 'bg-[#E8EAF6] text-[#3949AB]', ringColor: 'border-indigo-200' },
    { name: 'Sciences', icon: '⚛️', iconBg: 'bg-[#E0F7FA] text-[#00ACC1]', ringColor: 'border-cyan-200' }
  ];

  // Real communities from API for trending collabs
  const trendingCollabs = communities.slice(0, 3).map((c) => ({
    id: `tc-${c.id}`,
    name: c.name,
    avatar: c.avatar,
    rating: 4.5,
    desc: c.description.slice(0, 80) + '...',
    engagement: `${c.memberCount || 0} members`
  }));

  // Skills needed grid from communities
  const skillsNeededGrid = communities.slice(0, 9).map((c) => ({
    id: `sn-${c.id}`,
    name: c.name,
    avatar: c.avatar,
    text: c.description.slice(0, 100) + '...',
    rating: 4,
    compensation: `Join ${c.memberCount || 0} members`
  }));

  // Interactive map pins (fallback to empty; data comes from API)
  const programPrompts = mapPins.map((p) => ({
    id: p.id,
    top: p.top || '50%',
    left: p.left || '50%',
    totalThreads: p.totalThreads,
    isLocked: p.isLocked,
    title: p.title,
    description: p.description,
    communityId: p.communityId,
  }));

  // Stats display config
  const statCards = stats ? [
    { label: 'Community Members', value: stats.totalMemberships, icon: Users2, color: 'text-[#FFB300]' },
    { label: 'Active Collabs', value: stats.totalCollabs, icon: Rocket, color: 'text-[#FF5722]' },
    { label: 'Skills Exchanged', value: stats.totalSkillRequests, icon: Award, color: 'text-[#1E88E5]' },
    { label: 'Messages Sent', value: stats.totalMessages, icon: MessageCircle, color: 'text-[#4CAF50]' },
  ] : [];

  return (
    <div className="p-10 text-left max-w-7xl mx-auto flex flex-col gap-8 font-sans bg-white" id="dashboard-main-content">

      {/* SECTION 0: DASHBOARD STATS */}
      {statCards.length > 0 && (
        <section id="sec-dashboard-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const IconComp = s.icon;
            return (
              <div key={s.label} className="bg-white border border-[#EBEBEB] rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-md transition" id={`stat-card-${s.label}`}>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <IconComp className={`w-5 h-5 ${s.color}`} style={{ strokeWidth: 2 }} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xl font-bold text-stone-900 leading-tight">{s.value.toLocaleString()}</span>
                  <span className="text-[10.5px] text-stone-400 font-medium">{s.label}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* SECTION 1: SUGGESTED REGIONS */}
      <section id="sec-suggested-regions" className="flex flex-col gap-3.5">
        <h3 className="text-stone-900 font-sans font-semibold text-base tracking-tight" id="title-suggested-regions">
          Suggested Region
        </h3>
        
        {/* Region Flex Pills Scroller matching the screenshot */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none" id="suggested-regions-scroller">
          {suggestedRegions.map((region) => (
            <button
              key={region.name}
              onClick={() => setActiveRegion(region.name)}
              className={`flex items-center gap-2.5 px-4.5 py-2 rounded-full text-sm font-medium border transition cursor-pointer select-none whitespace-nowrap
                ${activeRegion === region.name 
                  ? 'bg-[#FFFFFF] border-stone-950 text-stone-950 shadow-sm' 
                  : 'bg-white border-[#E0E0E0] text-stone-500 hover:bg-stone-50/50'}`}
              id={`region-pill-${region.name}`}
            >
              {/* Customized Icon Circle with internal background based on active state */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${region.iconBg}`}>
                {region.icon}
              </div>
              <span className="text-[13px] font-sans font-semibold text-stone-800">{region.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 2: TRENDING COLLABS CAROUSEL */}
      <section id="sec-trending-collabs" className="flex flex-col gap-4">
        <h3 className="text-stone-900 font-sans font-semibold text-base tracking-tight" id="title-trending-collabs">
          Trending Collabs
        </h3>

        {/* Horizontal flex structure with Left Navigation arrow */}
        <div className="flex items-center gap-5 relative w-full" id="trending-row">
          {/* Circular Navigation Arrow positioned exactly as the image */}
          <button className="w-9 h-9 border border-[#E0E0E0] rounded-full flex items-center justify-center bg-white hover:bg-stone-50 active:scale-95 transition cursor-pointer shadow-sm shrink-0" id="btn-trending-left">
            <ArrowLeft className="w-4 h-4 text-stone-800" style={{ strokeWidth: 2.2 }} />
          </button>

          {/* Carousel Cards list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1" id="trending-grid">
            {trendingCollabs.map((collab) => (
              <div
                key={collab.id}
                className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col justify-between text-left transition duration-300 hover:shadow-md"
                id={`trending-card-${collab.id}`}
              >
                {/* Header Information */}
                <div className="flex justify-between items-start mb-3" id={`tc-hdr-${collab.id}`}>
                  <div className="flex items-center gap-3" id={`tc-meta-${collab.id}`}>
                    <div className="relative w-11 h-11 shrink-0">
                      <img 
                        src={collab.avatar} 
                        alt={collab.name} 
                        className="w-11 h-11 rounded-full object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] rounded-full border-2 border-white"></span>
                    </div>

                    <div className="flex flex-col text-left gap-0.5" id={`tc-name-col-${collab.id}`}>
                      <span className="font-sans font-bold text-sm text-stone-900 leading-tight">{collab.name}</span>
                      {/* Rating Yellow Star row matching screenshot */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`w-3.5 h-3.5 ${sIdx < Math.floor(collab.rating) ? 'text-[#FFC107] fill-[#FFC107]' : 'text-stone-200 fill-stone-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Collaborate Yellow Link on top right */}
                  <button 
                    onClick={() => onSelectDirectChat(collab.name, collab.avatar)}
                    className="text-[13px] font-sans font-bold text-[#FFB300] hover:text-[#FFA000] hover:underline cursor-pointer transition select-none"
                    id={`tc-link-${collab.id}`}
                  >
                    Collaborate
                  </button>
                </div>

                {/* Subtitle description */}
                <p className="text-[13px] text-stone-500 font-sans leading-relaxed mb-4 text-left" id={`tc-desc-${collab.id}`}>
                  {collab.desc}
                </p>

                {/* Footer with Orange Engagement Status index dot */}
                <div className="flex items-center gap-2 border-t border-[#FAFAFA] pt-3.5" id={`tc-footer-${collab.id}`}>
                  <span className="w-2.5 h-2.5 bg-[#FF5722] rounded-full shrink-0"></span>
                  <span className="text-xs font-sans text-stone-400 font-medium">{collab.engagement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: METROPOLITAN MAP AREA */}
      <section id="sec-metro-map" className="relative w-full rounded-2xl overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col">
        {/* Map outer container styled with a stylized aerial metropolitan city blueprint */}
        <div 
          className="relative w-full aspect-[16/9] bg-[#FAFAFA] overflow-hidden" 
          id="map-canvas"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1200')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.05) saturate(0.8) brightness(0.98)'
          }}
        >
          {/* Subtle network connection overlay lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M150 120 L400 240 M420 240 L600 150 M620 150 L800 350 M120 220 L320 380" stroke="#FF9800" strokeWidth="1.5" strokeDasharray="4,4" />
          </svg>

          {/* Interactive floating coordinates overlays on map — click to open */}
          {programPrompts.map((bubble) => {
            const community = bubble.communityId
              ? communities.find((c) => c.id === bubble.communityId)
              : undefined;
            const isHovered = hoveredPin === bubble.id;
            return (
              <div
                key={bubble.id}
                className="absolute z-10 font-sans transition-all duration-300 hover:scale-105 select-none"
                style={{ top: bubble.top, left: bubble.left }}
                id={`program-prompt-bubble-${bubble.id}`}
              >
                <div
                  onMouseEnter={() => setHoveredPin(bubble.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  onClick={() => {
                    if (bubble.isLocked) return;
                    if (community) {
                      onSelectCommunity(community.name);
                    } else if (bubble.title) {
                      onSelectDirectChat(bubble.title, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120');
                    }
                  }}
                  className={`bg-white/95 backdrop-blur-sm border rounded-2xl flex items-center justify-between shadow-md cursor-pointer transition
                    ${bubble.isLocked ? 'border-[#EBEBEB] opacity-80' : isHovered ? 'border-stone-800 scale-[1.03] shadow-lg' : 'border-[#EBEBEB] hover:border-stone-800'}`}
                  style={{ width: '280px', padding: '10px 14px', gap: '10px' }}
                  title={bubble.isLocked ? 'Locked — join related communities to unlock' : 'Click to explore'}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bubble.isLocked ? 'bg-stone-400' : 'bg-[#1A237E]'}`}>
                      <Rocket className="w-5 h-5 text-white" style={{ strokeWidth: 2 }} />
                    </div>

                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="font-sans font-bold text-xs text-stone-900 leading-tight truncate">{bubble.title || 'Program Prompt'}</span>
                      <span className="text-[10.5px] text-stone-400 font-sans truncate pr-1">{bubble.description || 'Tap to explore this coordinate'}</span>
                    </div>
                  </div>

                  {bubble.totalThreads != null && !bubble.isLocked ? (
                    <div className="w-6 h-6 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-white font-mono font-bold">{bubble.totalThreads}</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#FFE082] flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5 text-[#E65100]" style={{ strokeWidth: 2.5 }} />
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <span className="w-[1.5px] h-6 bg-[#FF9800]"></span>
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md animate-pulse ${bubble.isLocked ? 'bg-[#FFB300]' : 'bg-[#FF9800]'}`}></span>
                </div>
              </div>
            );
          })}

          {/* Right vertical cosmetic scrollbar track mimicking screenshot */}
          <div className="absolute top-1/4 bottom-1/4 right-3.5 w-1.5 bg-stone-200/50 rounded-full overflow-hidden" id="map-mock-scroll">
            <span className="block w-full h-1/3 bg-stone-600/70 rounded-full mt-2.5"></span>
          </div>
        </div>
      </section>

      {/* SECTION 4: SKILLS NEEDED LIST */}
      <section id="sec-skills-needed" className="flex flex-col gap-4">
        {/* Header content with See All trigger on right */}
        <div className="flex justify-between items-center" id="skills-needed-header">
          <h3 className="text-stone-900 font-sans font-semibold text-base tracking-tight" id="title-skills-needed">
            Skills Needed
          </h3>

          <button 
            onClick={() => onSelectCommunity('Figma Buddies')}
            className="text-[14px] font-sans font-bold text-[#FFB300] hover:text-[#FFA000] hover:underline cursor-pointer transition"
            id="btn-skills-seeall"
          >
            See all
          </button>
        </div>

        {/* 9 Cards Grid matching the screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="skills-needed-grid-box">
          {skillsNeededGrid.map((card, i) => (
            <div
              key={card.id}
              className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col justify-between text-left transition duration-300 hover:shadow-md"
              id={`skill-need-${card.id}`}
            >
              {/* Top row */}
              <div id={`sn-top-${card.id}`}>
                <div className="flex justify-between items-start mb-3" id={`sn-meta-row-${card.id}`}>
                  {/* Circle avatar and rating lines */}
                  <div className="flex items-center gap-3" id={`sn-profile-${card.id}`}>
                    <div className="relative w-10 h-10 shrink-0">
                      <img 
                        src={card.avatar} 
                        alt={card.name} 
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4CAF50] rounded-full border-2 border-white"></span>
                    </div>

                    <div className="flex flex-col text-left gap-0.5" id={`sn-name-column-${card.id}`}>
                      <span className="font-sans font-bold text-sm text-stone-900 leading-tight">{card.name}</span>
                      {/* Rating row of 5 stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`w-3.5 h-3.5 ${sIdx < card.rating ? 'text-[#FFC107] fill-[#FFC107]' : 'text-stone-200 fill-stone-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* "I can help" yellow-orange click prompt */}
                  <button 
                    onClick={() => onSelectDirectChat(card.name, card.avatar)}
                    className="text-[13px] font-sans font-bold text-[#FFB300] hover:text-[#FFA000] hover:underline cursor-pointer transition select-none"
                    id={`sn-action-lbl-${card.id}`}
                  >
                    I can help
                  </button>
                </div>

                {/* Body paragraph */}
                <p className="text-[13px] text-stone-500 font-sans leading-relaxed text-left mb-4 pr-1" id={`sn-body-${card.id}`}>
                  {card.text}
                </p>
              </div>

              {/* Footer row with payment budget */}
              <div className="flex items-center gap-2 border-t border-[#FAFAFA] pt-3.5" id={`sn-footer-${card.id}`}>
                <span className="w-2.5 h-2.5 bg-[#FF5722] rounded-full shrink-0"></span>
                <span className="text-xs font-sans text-stone-500 font-medium">{card.compensation}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
