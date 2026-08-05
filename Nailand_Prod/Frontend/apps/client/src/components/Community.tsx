import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from '../assets/images/logo/logo.png';

// ── API Setup ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ──────────────────────────────────────────────────────
interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
  cover_image_url?: string;
  region?: string;
  rating?: number;
  is_member?: boolean;
}

// ── Constants ──────────────────────────────────────────────────
const avatarColors = [
  "bg-amber-400", "bg-emerald-500", "bg-blue-500",
  "bg-pink-500", "bg-violet-500", "bg-orange-400"
];

const navItems = [
  { icon: "⊞", label: "Dash Board", path: "/dashboard" },
  { icon: "✉", label: "Messages", path: "/messages" },
  { icon: "◎", label: "Community", path: "/community" },
];

const bottomNav = [
  { icon: "?", label: "Help Desk" },
  { icon: "→", label: "Log Out" },
];

const regionTabs1 = ["Creative", "Wellness", "Business", "Politics", "Economics"];
const regionTabs2 = ["Tech", "Business", "Politics", "Sciences"];
const regionTabs3 = ["Creative", "Wellness", "Business"];

const regionDots: Record<string, string> = {
  Creative: "bg-amber-400", Wellness: "bg-red-400", Business: "bg-gray-500",
  Politics: "bg-yellow-500", Economics: "bg-blue-400", Tech: "bg-blue-500",
  Sciences: "bg-cyan-500",
};

const languages = [
  { label: "English", flag: "🇬🇧" },
  { label: "French", flag: "🇫🇷" },
  { label: "Spanish", flag: "🇪🇸" },
  { label: "Portuguese", flag: "🇵🇹" },
];

// ── Components ─────────────────────────────────────────────────
const Avatar = ({ name, size = "w-9 h-9", colorIdx = 0 }: {
  name: string; size?: string; colorIdx?: number;
}) => (
  <div className={`${size} ${avatarColors[colorIdx % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
    {name ? name[0].toUpperCase() : "?"}
  </div>
);

const Stars = ({ count = 0 }: { count?: number }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`text-xs ${i <= (count || 0) ? "text-amber-400" : "text-gray-300"}`}>★</span>
    ))}
  </div>
);

const SkeletonCommunityItem = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex-1">
      <div className="w-28 h-3 bg-gray-200 rounded mb-2" />
      <div className="w-40 h-2 bg-gray-200 rounded mb-1" />
      <div className="w-24 h-2 bg-gray-200 rounded" />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="w-24 h-3 bg-gray-200 rounded mb-1" />
        <div className="w-16 h-2 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded mb-2" />
    <div className="w-3/4 h-2 bg-gray-200 rounded mb-3" />
    <div className="w-20 h-2 bg-gray-200 rounded" />
  </div>
);

// ── Hook ───────────────────────────────────────────────────────
function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, callback: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

// ── Community Page ─────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const location = useLocation();

  // UI state
  const [activeYourTab, setActiveYourTab] = useState("All");
  const [activeRegion1, setActiveRegion1] = useState("Creative");
  const [activeRegion2, setActiveRegion2] = useState("");
  const [activeRegion3, setActiveRegion3] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"your" | "find">("your");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("English");

  // API data state
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([]);
  const [searchResults, setSearchResults] = useState<Community[]>([]);

  // Loading & error state
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useOutsideClick(searchRef, () => setSearchOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(langRef, () => setLangOpen(false));

  // ── Fetch my communities on mount ─────────────────────────
  useEffect(() => {
    const fetchMyCommunities = async () => {
      try {
        setLoadingMine(true);
        const res = await api.get("/communities/my");
        setMyCommunities(res.data);
      } catch (err) {
        console.error("Failed to load my communities:", err);
       } finally {
        setLoadingMine(false);
      }
    };
    fetchMyCommunities();
  }, []);

  // ── Fetch trending when region changes ────────────────────
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoadingTrending(true);
        const activeRegion = activeRegion1 || activeRegion2 || activeRegion3 || undefined;
        const res = await api.get("/communities/trending", {
          params: { limit: 20, ...(activeRegion && { region: activeRegion }) },
        });
        setTrendingCommunities(res.data);
      } catch (err) {
        console.error("Failed to load trending communities:", err);
        setError("Failed to load communities.");
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, [activeRegion1, activeRegion2, activeRegion3]);

  // ── Debounced search ───────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await api.get("/communities/search", {
          params: { q: search, limit: 10 },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  // ── Join community ─────────────────────────────────────────
  const handleJoin = async (communityId: string) => {
    try {
      setJoiningId(communityId);
      await api.post(`/communities/${communityId}/join`);

      // Update is_member flag in trending list
      setTrendingCommunities(prev =>
        prev.map(c => c.id === communityId ? { ...c, is_member: true } : c)
      );

      // Refetch my communities to include the new one
      const res = await api.get("/communities/my");
      setMyCommunities(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to join community.";
      setError(msg);
    } finally {
      setJoiningId(null);
    }
  };

  // ── Leave community ────────────────────────────────────────
  const handleLeave = async (communityId: string) => {
    try {
      setJoiningId(communityId);
      await api.post(`/communities/${communityId}/leave`);

      // Remove from my communities
      setMyCommunities(prev => prev.filter(c => c.id !== communityId));

      // Update is_member flag in trending list
      setTrendingCommunities(prev =>
        prev.map(c => c.id === communityId ? { ...c, is_member: false } : c)
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to leave community.";
      setError(msg);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatMembers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M members`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k members`;
    return `${count} members`;
  };

  // Display communities: use search results if searching, otherwise trending
  const displayCommunities = search.trim() ? searchResults : trendingCommunities;
  const isLoadingDisplay = search.trim() ? loadingSearch : loadingTrending;

  // ── Your Community Panel ───────────────────────────────────
  const YourCommunityPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Your Community</h2>
        <div className="flex gap-2">
          {["All", "Favorites"].map((tab) => (
            <button key={tab}
              onClick={() => setActiveYourTab(tab)}
              className={`flex items-center gap-1 px-1 py-1 text-xs font-semibold transition-all
                ${activeYourTab === tab
                  ? "border-b-2 border-amber-400 text-amber-600"
                  : "text-gray-400 hover:text-gray-600"}`}
            >
              {tab}
              {tab === "All" && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">
                  {myCommunities.length}
                </span>
              )}
              {tab === "Favorites" && (
                <span className="w-4 h-4 rounded-full bg-gray-200 text-[9px] font-bold text-gray-500 flex items-center justify-center">0</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingMine ? (
          <>{[1, 2, 3, 4].map(i => <SkeletonCommunityItem key={i} />)}</>
        ) : myCommunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-4xl mb-3">👥</span>
            <p className="text-sm text-gray-500">You haven't joined any communities yet</p>
            <p className="text-xs text-gray-400 mt-1">Explore and join one on the right!</p>
          </div>
        ) : (
          myCommunities.map((c, i) => (
            <div key={c.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <Avatar name={c.name} size="w-9 h-9" colorIdx={i} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.description}</p>
                <p className="text-[10px] text-gray-400">{formatMembers(c.member_count)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleLeave(c.id); }}
                disabled={joiningId === c.id}
                className="text-[9px] px-2 py-0.5 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {joiningId === c.id ? "..." : "Leave"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── Find Community Panel ───────────────────────────────────
  const FindCommunityPanel = () => (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="px-4 md:px-6 pt-5 pb-3 bg-white border-b border-gray-100 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 text-center">Find Community</h2>
        <p className="text-xs text-gray-400 text-center mt-0.5">
          Communities are grouped by region. Select a region to filter.
        </p>

        {/* Region filters */}
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-2 flex-wrap">
            {regionTabs1.map((tab) => (
              <button key={tab}
                onClick={() => { setActiveRegion1(tab); setActiveRegion2(""); setActiveRegion3(""); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all
                  ${activeRegion1 === tab
                    ? "border-amber-400 bg-amber-400 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${regionDots[tab] || "bg-gray-400"} inline-block`} />
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {regionTabs2.map((tab) => (
              <button key={tab}
                onClick={() => { setActiveRegion2(tab); setActiveRegion1(""); setActiveRegion3(""); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all
                  ${activeRegion2 === tab
                    ? "border-amber-400 bg-amber-400 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${regionDots[tab] || "bg-gray-400"} inline-block`} />
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {regionTabs3.map((tab) => (
              <button key={tab}
                onClick={() => { setActiveRegion3(tab); setActiveRegion1(""); setActiveRegion2(""); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all
                  ${activeRegion3 === tab
                    ? "border-amber-400 bg-amber-400 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${regionDots[tab] || "bg-gray-400"} inline-block`} />
                {tab}
              </button>
            ))}
          </div>
        </div>

        {search && (
          <div className="mt-3 text-center">
            <span className="text-xs text-amber-500">
              {loadingSearch ? "Searching..." : `Showing ${searchResults.length} result(s) for "${search}"`}
              <button onClick={() => setSearch("")} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
            </span>
          </div>
        )}
      </div>

      {/* Community cards */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {isLoadingDisplay ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayCommunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-base font-semibold text-gray-700">No communities found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? `No results for "${search}"` : "Try selecting a different region"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayCommunities.map((c, i) => (
              <div key={c.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.name} size="w-8 h-8" colorIdx={i} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{c.name}</p>
                      <Stars count={Math.round(c.rating || 0)} />
                    </div>
                  </div>
                  {c.is_member ? (
                    <button
                      onClick={() => handleLeave(c.id)}
                      disabled={joiningId === c.id}
                      className="text-xs font-semibold text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {joiningId === c.id ? "..." : "Leave"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(c.id)}
                      disabled={joiningId === c.id || c.is_private}
                      className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
                    >
                      {joiningId === c.id ? "Joining..." : c.is_private ? "Private" : "Explore"}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="text-[10px] text-gray-400">{formatMembers(c.member_count)}</span>
                  </div>
                  {c.region && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{c.region}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full
        w-44 bg-gray-50 flex flex-col items-start pt-4 pb-6 flex-shrink-0 border-r border-gray-200
        transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex items-center justify-between w-full mb-6 px-4">
          <img src={logo} alt="NaiLand" className="w-24 h-auto" />
          <button className="md:hidden text-gray-400 hover:text-gray-600 text-xl leading-none" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="flex flex-col w-full">
          {navItems.map((item) => (
            <div key={item.label} onClick={() => navigate(item.path)}
              className={`flex flex-row items-center px-4 py-3 cursor-pointer gap-3 transition-colors w-full
                ${location.pathname === item.path ? "bg-amber-400" : "hover:bg-gray-200"}`}
            >
              <span className={`text-base ${location.pathname === item.path ? "text-gray-900" : "text-gray-400"}`}>{item.icon}</span>
              <span className={`text-xs font-semibold leading-tight ${location.pathname === item.path ? "text-gray-900" : "text-gray-500"}`}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col w-full">
          {bottomNav.map((item) => (
            <div key={item.label}
              onClick={item.label === "Log Out" ? handleLogout : undefined}
              className="flex flex-row items-center px-4 py-3 cursor-pointer gap-3 hover:bg-gray-200 transition-colors w-full"
            >
              <span className="text-base text-gray-500">{item.icon}</span>
              <span className="text-xs font-semibold text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            className="md:hidden p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex items-center gap-2 w-full md:w-96 lg:w-[500px]" ref={searchRef}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search communities..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
            />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 8h12M9 12h6M11 16h2" />
              </svg>
            </button>

            {/* Search dropdown */}
            {searchOpen && search.trim() && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] py-3 overflow-hidden">
                <p className="text-xs text-gray-400 font-semibold px-4 pb-2">
                  {loadingSearch ? "Searching..." : `Results for "${search}"`}
                </p>
                {!loadingSearch && searchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-2">No communities found</p>
                ) : (
                  <div className="flex flex-col max-h-64 overflow-y-auto">
                    {searchResults.slice(0, 5).map((c, i) => (
                      <div key={c.id}
                        onClick={() => { setSearchOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Avatar name={c.name} size="w-8 h-8" colorIdx={i} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">{formatMembers(c.member_count)}</p>
                        </div>
                        {c.region && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">{c.region}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
                className="relative text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >
                🔔
              </button>
              {notifOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔔</span>
                      <span className="text-sm font-bold text-gray-900">Notifications</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                </div>
              )}
            </div>

            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >🌐</button>
              {langOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] py-3 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 pb-2 border-b border-gray-100 mb-1">
                    <span className="text-base">🌐</span>
                    <span className="text-sm font-bold text-gray-900">Languages</span>
                  </div>
                  {languages.map((l) => (
                    <div key={l.label}
                      onClick={() => { setActiveLang(l.label); setLangOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className={`text-sm font-medium ${activeLang === l.label ? "text-amber-500" : "text-gray-700"}`}>{l.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Avatar name="U" size="w-8 h-8" colorIdx={0} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Mobile tab switcher */}
        <div className="flex md:hidden border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setMobilePanel("your")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors
              ${mobilePanel === "your" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
          >
            Your Community
          </button>
          <button
            onClick={() => setMobilePanel("find")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors
              ${mobilePanel === "find" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
          >
            Find Community
          </button>
        </div>

        {/* Two panels */}
        <div className="flex flex-1 overflow-hidden">
          <div className={`
            flex flex-col border-r border-gray-200 bg-white flex-shrink-0 overflow-hidden
            w-full md:w-72
            ${mobilePanel === "your" ? "flex" : "hidden"} md:flex
          `}>
            <YourCommunityPanel />
          </div>
          <div className={`
            flex-1 flex flex-col overflow-hidden
            ${mobilePanel === "find" ? "flex" : "hidden"} md:flex
          `}>
            <FindCommunityPanel />
          </div>
        </div>
      </main>
    </div>
  );
}