import React, { useState, useEffect } from 'react';
import { Star, Globe } from 'lucide-react';
import { useCommunities } from '../lib/CommunitiesContext';
import { communitiesApi } from '../lib/api';
import { CATEGORIES, categoryMatchesTags } from '../lib/categories';
import Avatar from './Avatar';

interface CommunityDirectoryProps {
  onSelectCommunity: (comName: string) => void;
}

export default function CommunityDirectory({ onSelectCommunity }: CommunityDirectoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [activeCategory, setActiveCategory] = useState('Creative');
  const { communities, isLoading } = useCommunities();

  // My communities fetched from API
  const [myCommunities, setMyCommunities] = useState<any[]>([]);

  const loadMyCommunities = () => {
    communitiesApi.my().then((res) => {
      if (res.success && res.data) setMyCommunities(res.data);
    });
  };

  useEffect(() => {
    loadMyCommunities();
  }, []);

  // Real total member count across communities
  const totalMembers = communities.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  // Left rail list: all communities or favorites (joined)
  const leftList = activeTab === 'favorites' ? myCommunities : communities;

  // Right panel results: communities matching the active category (by tags)
  const categoryResults = communities.filter((c) => categoryMatchesTags(activeCategory, c.tags));

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 lg:p-10 text-left max-w-7xl mx-auto bg-white font-sans" id="community-directory-root">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="community-directory-grid">

        {/* ============ LEFT: COMMUNITY LIST ============ */}
        <div className="flex flex-col gap-4 lg:border-r lg:border-stone-100 lg:pr-6" id="dir-left-rail">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-serif font-bold text-stone-900 tracking-tight" id="dir-title-your-community">
              Your Community
            </h2>

            {/* All / Favorites tabs */}
            <div className="flex items-center gap-1 border border-stone-200 rounded-xl p-1 bg-stone-50/60 w-fit" id="dir-tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer
                  ${activeTab === 'all' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
                id="dir-tab-all"
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer
                  ${activeTab === 'favorites' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
                id="dir-tab-favorites"
              >
                Favorites {myCommunities.length > 0 && <span className="ml-0.5 text-[10px] text-amber-600">({myCommunities.length})</span>}
              </button>
            </div>
          </div>

          {/* Community list */}
          <div className="flex flex-col gap-2" id="dir-community-list">
            {isLoading && (
              <p className="text-xs text-stone-400 animate-pulse">Loading communities...</p>
            )}
            {!isLoading && leftList.length === 0 && (
              <div className="text-xs text-stone-400 py-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200" id="dir-list-empty">
                {activeTab === 'favorites' ? 'No favorite communities yet.' : 'No communities yet.'}
              </div>
            )}
            {leftList.map((c: any) => (
              <button
                key={c.id}
                onClick={() => onSelectCommunity(c.name)}
                className="flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer text-left hover:bg-stone-50 border border-transparent"
                id={`dir-list-item-${c.id}`}
              >
                <div className="relative shrink-0">
                  <Avatar name={c.name} src={c.avatar} className="w-10 h-10 rounded-full border border-stone-200" textClassName="text-sm" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-stone-900 truncate">{c.name}</span>
                  <span className="block text-[11px] text-stone-400 truncate">{(c.tags && c.tags[0]) || 'Community'}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">{c.memberCount || 0}</span>
              </button>
            ))}
          </div>

          {/* Member count footer */}
          <div className="flex items-center gap-2 mt-2 pt-4 border-t border-stone-100 text-xs text-stone-500" id="dir-members-online">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <strong className="text-stone-700">{totalMembers.toLocaleString()}</strong> members online
          </div>
        </div>

        {/* ============ RIGHT: FIND COMMUNITY ============ */}
        <div className="lg:col-span-2 flex flex-col gap-5" id="dir-right-panel">
          <div className="flex flex-col gap-1.5" id="dir-find-community-head">
            <h3 className="text-base font-serif font-bold text-stone-900" id="dir-find-community-title">
              Find Community
            </h3>
            <p className="text-[13px] text-stone-500 leading-relaxed" id="dir-find-community-desc">
              Community are gotten from regions, each regions has communities underneath
            </p>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2.5 flex-wrap" id="dir-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition cursor-pointer select-none
                  ${activeCategory === cat
                    ? 'bg-[#FFC107] text-stone-950 border-[#FFC107] shadow-sm'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                id={`dir-cat-pill-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Explore results */}
          <div className="flex flex-col gap-4 mt-2" id="dir-explore-results">
            {categoryResults.length === 0 ? (
              <div className="flex flex-col items-center gap-2 bg-stone-50 border border-dashed border-stone-200 rounded-2xl py-14 text-center" id="dir-explore-empty">
                <Globe className="w-8 h-8 text-stone-300" />
                <p className="text-sm text-stone-500 font-medium">No communities in {activeCategory} yet</p>
                <p className="text-xs text-stone-400">Communities appear here as they are created and tagged.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="dir-explore-grid">
                {categoryResults.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col justify-between text-left transition duration-300 hover:shadow-md"
                    id={`dir-explore-card-${c.id}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={c.name} src={c.avatar} className="w-11 h-11 rounded-full border border-stone-200" textClassName="text-sm" />
                      <div className="flex flex-col text-left gap-0.5 min-w-0">
                        <span className="font-bold text-sm text-stone-900 truncate">{c.name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[13px] text-stone-500 leading-relaxed mb-4 line-clamp-2">{c.description}</p>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                      <span className="text-xs text-stone-500 font-medium">
                        <strong className="text-stone-700">{c.memberCount || 0}</strong> members
                      </span>
                      <button
                        onClick={() => onSelectCommunity(c.name)}
                        className="text-[13px] font-bold text-[#FFB300] hover:text-[#FFA000] hover:underline cursor-pointer transition"
                        id={`dir-explore-btn-${c.id}`}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
