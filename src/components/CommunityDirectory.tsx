import React, { useState, useEffect } from 'react';
import { Star, Check, Plus, Globe } from 'lucide-react';
import { useCommunities } from '../lib/CommunitiesContext';
import { communitiesApi, dashboardApi } from '../lib/api';

interface CommunityDirectoryProps {
  onSelectCommunity: (comName: string) => void;
}

export default function CommunityDirectory({ onSelectCommunity }: CommunityDirectoryProps) {
  const [activeRegion, setActiveRegion] = useState('');
  const [activeTab, setActiveTab] = useState<'your' | 'find'>('find');
  const { communities, isLoading, refresh } = useCommunities();

  // Real regions from the backend (distinct regions of registered users)
  const [regions, setRegions] = useState<{ name: string; count: number }[]>([]);

  // My communities fetched from API
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadMyCommunities = () => {
    communitiesApi.my().then((res) => {
      if (res.success && res.data) {
        setMyCommunities(res.data);
        setJoinedIds(new Set(res.data.map((c: any) => c.id)));
      }
    });
  };

  useEffect(() => {
    loadMyCommunities();
    dashboardApi.regions().then((res) => {
      if (res.success && res.data) setRegions(res.data);
    });
  }, []);

  // Auto-select the most populated region once real data loads
  useEffect(() => {
    if (regions.length > 0 && !activeRegion) {
      setActiveRegion(regions[0].name);
    }
  }, [regions, activeRegion]);

  const handleJoin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (joinedIds.has(id) || joiningId) return;
    setJoiningId(id);
    const err = await communitiesApi.join(id).then((r) => (r.success ? null : r.error));
    setJoiningId(null);
    if (!err) {
      setJoinedIds((prev) => new Set(prev).add(id));
      loadMyCommunities();
      refresh();
    }
  };

  // Region visual metadata (icons/colors) keyed by known region name; fallback for unknown regions
  const REGION_META: Record<string, { icon: string; iconBg: string }> = {
    Africa: { icon: '🌍', iconBg: 'bg-[#E3F2FD] text-[#1E88E5]' },
    Asia: { icon: '🪐', iconBg: 'bg-[#E0F2F1] text-[#00897B]' },
    Europe: { icon: '🌺', iconBg: 'bg-[#FFEBEE] text-[#E53935]' },
    'North America': { icon: '💼', iconBg: 'bg-[#ECEFF1] text-[#546E7A]' },
    'South America': { icon: '👑', iconBg: 'bg-[#FFF8E1] text-[#FFB300]' },
    Oceania: { icon: '📈', iconBg: 'bg-[#E8EAF6] text-[#3949AB]' },
  };
  const REGION_FALLBACK = { icon: '🌐', iconBg: 'bg-[#E0F7FA] text-[#00ACC1]' };

  // Region pills = real regions from the backend with member counts
  const suggestedRegions = regions.map((r) => ({
    name: r.name,
    count: r.count,
    ...(REGION_META[r.name] || REGION_FALLBACK),
  }));

  // Professional skill tags aggregated from real community tags (deduplicated, 3 per column)
  const allTags = Array.from(new Set(communities.flatMap((c) => c.tags || [])));
  const tagColumns = allTags.length > 0
    ? Array.from({ length: Math.ceil(allTags.length / 3) }, (_, i) => allTags.slice(i * 3, i * 3 + 3))
    : [];

  // Real communities from API
  const displayCards = communities.length > 0
    ? communities.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        desc: c.description,
        members: `${c.memberCount || 0} members`
      }))
    : [];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 lg:p-10 text-left max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 bg-white font-sans" id="community-directory-root">
      
      {/* SECTION 1: SUGGESTED REGIONS */}
      <section id="sec-dir-regions" className="flex flex-col gap-3.5">
        <h3 className="text-stone-900 font-sans font-semibold text-base tracking-tight" id="dir-suggested-regions-title">
          Suggested Region
        </h3>
        
        {suggestedRegions.length === 0 ? (
          <div className="flex items-center justify-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 text-center" id="dir-regions-empty">
            <div className="flex flex-col items-center gap-1.5">
              <Globe className="w-6 h-6 text-stone-300" />
              <p className="text-sm text-stone-500 font-medium">No regions yet</p>
              <p className="text-xs text-stone-400">Regions appear here as members join from around the world.</p>
            </div>
          </div>
        ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none" id="dir-regions-scroller">
          {suggestedRegions.map((region) => (
            <button
              key={region.name}
              onClick={() => setActiveRegion(region.name)}
              className={`flex items-center gap-2.5 px-4.5 py-2 rounded-full text-sm font-medium border transition cursor-pointer select-none whitespace-nowrap
                ${activeRegion === region.name 
                  ? 'bg-[#FFFFFF] border-stone-950 text-stone-950 shadow-sm' 
                  : 'bg-white border-[#E0E0E0] text-stone-500 hover:bg-stone-50/50'}`}
              id={`dir-region-pill-${region.name}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${region.iconBg}`}>
                {region.icon}
              </div>
              <span className="text-[13px] font-sans font-semibold text-stone-800">{region.name}</span>
              <span className="text-[11px] font-sans font-medium text-stone-400">{region.count}</span>
            </button>
          ))}
        </div>
        )}
      </section>

      {/* SECTION 2: PROFESSION SKILLS TAGS GRID BOX */}
      <section id="sec-dir-tags-board" className="relative bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl p-8 pr-12 w-full flex justify-between items-center min-h-[178px] overflow-hidden select-none">
        {tagColumns.length === 0 && (
          <div className="w-full flex items-center justify-center text-center" id="dir-tags-empty">
            <p className="text-sm text-stone-400">Skill tags will appear here as communities are created.</p>
          </div>
        )}
        {tagColumns.map((col, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-5 text-left" id={`tag-column-${cIdx}`}>
            {col.map((tag, rIdx) => (
              <span 
                key={rIdx} 
                className="text-[13px] font-sans font-medium text-stone-500 whitespace-nowrap cursor-pointer hover:text-stone-950 transition"
                id={`tag-cell-${cIdx}-${rIdx}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ))}

        {/* Customized vertical scrollbar graphics on the right side margins */}
        <div className="absolute top-4 bottom-4 right-3.5 w-1.5 bg-stone-200/50 rounded-full" id="dir-tag-scroll">
          <span className="block w-full h-[36px] bg-stone-500 rounded-full mt-10"></span>
        </div>
      </section>

      {/* SECTION 3: YOUR / FIND COMMUNITIES TOGGLE */}
      <section id="sec-dir-toggle" className="flex items-center gap-2 border border-stone-200 rounded-xl p-1 w-fit bg-stone-50/60">
        <button
          onClick={() => setActiveTab('your')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer
            ${activeTab === 'your' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
          id="dir-tab-your"
        >
          Your Communities {myCommunities.length > 0 && <span className="ml-1 text-[10px] text-amber-600">({myCommunities.length})</span>}
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer
            ${activeTab === 'find' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
          id="dir-tab-find"
        >
          Find Communities
        </button>
      </section>

      {/* SECTION 4: COMMUNITIES GRID */}
      <section id="sec-dir-grid" className="flex flex-col gap-4">
        {activeTab === 'your' && myCommunities.length === 0 && (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-10 text-center text-sm text-stone-400">
            You haven't joined any communities yet. Switch to <strong className="text-stone-600">Find Communities</strong> to explore!
          </div>
        )}

        {activeTab === 'find' && displayCards.length === 0 && (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-10 text-center text-sm text-stone-400" id="dir-find-empty">
            No communities have been created yet. Be the first to start one!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dir-communities-grid-box">
          {(activeTab === 'your' ? myCommunities : displayCards).map((card) => (
            <div
              key={card.id}
              className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col justify-between text-left transition duration-300 hover:shadow-md"
              id={`dir-card-${card.id}`}
            >
              {/* Top row with details */}
              <div id={`dir-top-${card.id}`}>
                <div className="flex justify-between items-start mb-3" id={`dir-meta-row-${card.id}`}>
                  {/* Circle avatar and rating lines */}
                  <div className="flex items-center gap-3" id={`dir-profile-${card.id}`}>
                    <img 
                      src={card.avatar} 
                      alt={card.name} 
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex flex-col text-left gap-0.5" id={`dir-name-column-${card.id}`}>
                      <span className="font-sans font-bold text-sm text-stone-900 leading-tight">{card.name}</span>
                      {/* Outline rating stars */}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className="w-3.5 h-3.5 text-stone-300 stroke-[1.5px]" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* "Explore" orange/yellow text label linked to community render */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleJoin(card.id, e)}
                      disabled={joinedIds.has(card.id) || joiningId === card.id}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1
                        ${joinedIds.has(card.id)
                          ? 'bg-emerald-50 text-emerald-600 cursor-default'
                          : 'bg-stone-900 text-white hover:bg-stone-700'}`}
                      id={`dir-join-btn-${card.id}`}
                    >
                      {joinedIds.has(card.id) ? <><Check className="w-3 h-3" /> Joined</> : <><Plus className="w-3 h-3" /> Join</>}
                    </button>
                    <button
                      onClick={() => onSelectCommunity(card.name)}
                      className="text-[13px] font-sans font-bold text-[#FFB300] hover:text-[#FFA000] hover:underline cursor-pointer transition select-none"
                      id={`dir-action-lbl-${card.id}`}
                    >
                      Explore
                    </button>
                  </div>
                </div>

                {/* Body paragraph */}
                <p className="text-[13px] text-stone-500 font-sans leading-relaxed text-left mb-4 pr-1 mt-3" id={`dir-body-${card.id}`}>
                  {card.desc}
                </p>
              </div>

              {/* Footer row with orange indicator dot representing members */}
              <div className="flex items-center gap-2 border-t border-[#FAFAFA] pt-3.5" id={`dir-footer-${card.id}`}>
                <span className="w-2.5 h-2.5 bg-[#FF5722] rounded-full shrink-0"></span>
                <span className="text-xs font-sans text-stone-500 font-medium">{card.members}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
