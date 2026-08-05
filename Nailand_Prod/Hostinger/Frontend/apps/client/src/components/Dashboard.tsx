import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from '../assets/images/logo/logo.png';

// ── API Setup ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ──────────────────────────────────────────────────────
interface Collab {
  id: string;
  user_id: string;
  user_name?: string;  // ← ADD THIS - now coming from backend
  title: string;
  description: string;
  required_skills: string[];
  views_count: number;
  engagements_count: number;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    profile?: { rating: number; avatar_url?: string };
  };
}

interface SkillRequest {
  id: string;
  user_id: string;
  user_name?: string;  // ← ADD THIS
  skill_name: string;
  description: string;
  payment_min: number;
  payment_max: number;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
    profile?: { rating: number };
  };
}

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actions?: string[];
  sender?: { first_name: string; last_name: string };
}

interface MapPin {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  top?: string;
  left?: string;
}

interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  region?: string;
  skills?: { skill_name: string }[];
  interests?: string[];
  profile?: { avatar_url?: string; rating?: number };
}

// ── Constants ──────────────────────────────────────────────────
const avatarColors = [
  "bg-amber-400", "bg-emerald-500", "bg-blue-500",
  "bg-pink-500", "bg-violet-500",
];

const PIN_POSITIONS = [
  { top: "28%", left: "18%" },
  { top: "20%", left: "52%" },
  { top: "44%", left: "32%" },
  { top: "54%", left: "50%" },
  { top: "67%", left: "16%" },
  { top: "70%", left: "66%" },
];

const regions = [
  { label: "Creative", dot: "bg-amber-400" },
  { label: "Tech", dot: "bg-blue-500" },
  { label: "Wellness", dot: "bg-emerald-500" },
  { label: "Business", dot: "bg-indigo-500" },
  { label: "Politics", dot: "bg-red-500" },
  { label: "Economics", dot: "bg-violet-500" },
  { label: "Science", dot: "bg-cyan-500" },
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

const searchCategories = ["Name", "Interest", "Skills"];

const languages = [
  { label: "English", flag: "🇬🇧" },
  { label: "French", flag: "🇫🇷" },
  { label: "Spanish", flag: "🇪🇸" },
  { label: "Portuguese", flag: "🇵🇹" },
];

// ── Reusable Components ────────────────────────────────────────
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

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 min-w-[200px] border border-gray-100 animate-pulse flex-shrink-0">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="flex flex-col gap-1">
        <div className="w-24 h-3 bg-gray-200 rounded" />
        <div className="w-16 h-2 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded mb-2" />
    <div className="w-3/4 h-2 bg-gray-200 rounded" />
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="w-20 h-3 bg-gray-200 rounded mb-1" />
            <div className="w-16 h-2 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded mb-2" />
        <div className="w-2/3 h-2 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

// ── Hook ───────────────────────────────────────────────────────
function useOutsideClick(
  ref: React.RefObject<HTMLDivElement | null>,
  callback: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

// ── Dashboard ──────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // UI state
  const [activeRegion, setActiveRegion] = useState("Tech");
  const [search, setSearch] = useState("");
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Name");
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("English");

  // API data state
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Loading & error state
  const [loadingCollabs, setLoadingCollabs] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useOutsideClick(searchRef, () => setSearchOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(langRef, () => setLangOpen(false));

  // ── Fetch collabs, notifications, map pins on mount ────────
  useEffect(() => {
    const fetchCollabs = async () => {
      try {
        setLoadingCollabs(true);
        const res = await api.get("/dashboard/trending-collabs", {
          params: { limit: 10 },
        });
        console.log("Collabs API response:", res.data); // Debug log
        setCollabs(res.data);
      } catch (err) {
        console.error("Failed to load collabs:", err);
        setError("Failed to load collaborations.");
      } finally {
        setLoadingCollabs(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/dashboard/notifications", {
          params: { limit: 20 },
        });
        setNotifications(res.data);
        setUnreadCount(
          res.data.filter((n: Notification) => !n.is_read).length
        );
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    const fetchMapPins = async () => {
      try {
        setLoadingPins(true);
        const res = await api.get("/dashboard/map-pins");
        const pinsWithPositions = res.data.map(
          (pin: MapPin, i: number) => ({
            ...pin,
            top: PIN_POSITIONS[i % PIN_POSITIONS.length].top,
            left: PIN_POSITIONS[i % PIN_POSITIONS.length].left,
          })
        );
        setMapPins(pinsWithPositions);
      } catch (err) {
        console.error("Failed to load map pins:", err);
      } finally {
        setLoadingPins(false);
      }
    };

    fetchCollabs();
    fetchNotifications();
    fetchMapPins();
  }, []);

  // ── Fetch skills whenever region changes ───────────────────
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const res = await api.get("/dashboard/skills-needed", {
          params: { limit: 20, interest: activeRegion },
        });
        setSkillRequests(res.data);
      } catch (err) {
        console.error("Failed to load skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [activeRegion]);

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
        const typeMap: Record<string, string> = {
          Name: "name",
          Interest: "interest",
          Skills: "skill",
        };
        const res = await api.get("/dashboard/search-users", {
          params: {
            q: search,
            search_type: typeMap[activeCategory],
            limit: 5,
          },
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
  }, [search, activeCategory]);

  // ── Mark notification as read ──────────────────────────────
  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.post(`/dashboard/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  // ── Display helpers (UPDATED to use user_name from API) ────
  const getCollabName = (c: Collab) => {
    // First try the user_name field from API
    if (c.user_name) {
      return c.user_name;
    }
    // Fallback to nested user object
    if (c.user?.first_name) {
      return `${c.user.first_name} ${c.user.last_name}`;
    }
    return "Community Member";
  };

  const getCollabRating = (c: Collab) => {
    if (c.user?.profile?.rating) {
      return Math.round(c.user.profile.rating);
    }
    return 0;
  };

  const getSkillOwner = (s: SkillRequest) => {
    if (s.user_name) {
      return s.user_name;
    }
    if (s.user?.first_name) {
      return `${s.user.first_name} ${s.user.last_name}`;
    }
    return "Community Member";
  };

  const getSkillRating = (s: SkillRequest) => {
    if (s.user?.profile?.rating) {
      return Math.round(s.user.profile.rating);
    }
    return 0;
  };

  const getNotifSender = (n: Notification) =>
    n.sender
      ? `${n.sender.first_name} ${n.sender.last_name}`
      : "Someone";

  const formatPayment = (min: number, max: number) =>
    `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;

  const getSearchSubtext = (r: SearchResult) => {
    if (activeCategory === "Interest") return r.interests?.[0] || "—";
    if (activeCategory === "Skills") return r.skills?.[0]?.skill_name || "—";
    return r.region || "—";
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen font-sans bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full z-50
        w-44 bg-gray-50 flex flex-col items-start pt-4 pb-6
        flex-shrink-0 border-r border-gray-200
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex items-center justify-between w-full mb-4 px-4">
          <img src={logo} alt="NaiLand" className="w-24 h-auto" />
          <button
            className="md:hidden text-gray-400 hover:text-gray-600 text-xl"
            onClick={() => setSidebarOpen(false)}
          >✕</button>
        </div>

        <div className="flex flex-col w-full">
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-row items-center px-4 py-3 cursor-pointer gap-3 transition-colors w-full
                ${location.pathname === item.path ? "bg-amber-400" : "hover:bg-gray-200"}`}
            >
              <span className={`text-base ${location.pathname === item.path ? "text-gray-900" : "text-gray-400"}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-semibold leading-tight ${location.pathname === item.path ? "text-gray-900" : "text-gray-500"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex flex-col w-full">
          {bottomNav.map((item) => (
            <div
              key={item.label}
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

          {/* Hamburger */}
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
              placeholder="Search for..."
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
            {searchOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] py-3 overflow-hidden">
                <p className="text-xs text-gray-400 font-semibold px-4 pb-2">Search by...</p>
                <div className="flex gap-1 px-4 mb-2">
                  {searchCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setSearch(""); }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all
                        ${activeCategory === cat
                          ? "bg-amber-400 text-gray-900"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {loadingSearch ? (
                  <p className="text-xs text-gray-400 px-4 py-3">Searching...</p>
                ) : search.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map((r, i) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Avatar name={r.first_name} size="w-7 h-7" colorIdx={i} />
                          <div>
                            <span className="text-sm font-medium text-gray-700 block">
                              {r.first_name} {r.last_name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {getSearchSubtext(r)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 px-4 py-3">No results for "{search}"</p>
                  )
                ) : (
                  <p className="text-xs text-gray-400 px-4 py-1">
                    Type to search by {activeCategory.toLowerCase()}...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
                className="relative text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔔</span>
                      <span className="text-sm font-bold text-gray-900">Notifications</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 text-lg tracking-widest">···</button>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkNotifRead(n.id)}
                          className={`px-4 py-3 cursor-pointer transition-colors
                            ${n.is_read ? "hover:bg-gray-50" : "bg-amber-50 hover:bg-amber-100"}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar name={getNotifSender(n)} size="w-8 h-8" colorIdx={0} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 leading-snug">
                                <span className="font-semibold">{getNotifSender(n)}</span>{" "}
                                {n.message}
                              </p>
                              {n.actions && n.actions.length > 0 && (
                                <div className="flex gap-3 mt-1.5 flex-wrap">
                                  {n.actions.map((a) => (
                                    <button
                                      key={a}
                                      className="text-[11px] font-semibold text-amber-500 hover:text-amber-600"
                                    >
                                      {a}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                    <span className="text-base">⚙️</span>
                    <span className="text-sm font-bold text-gray-900">Languages</span>
                  </div>
                  {languages.map((l) => (
                    <div
                      key={l.label}
                      onClick={() => { setActiveLang(l.label); setLangOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className={`text-sm font-medium ${activeLang === l.label ? "text-amber-500" : "text-gray-700"}`}>
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Avatar name="U" size="w-8 h-8" colorIdx={0} />
          </div>
        </div>

        {/* Region filters */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-gray-100 overflow-x-auto">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Suggested Region</span>
          {regions.map((r) => (
            <button
              key={r.label}
              onClick={() => setActiveRegion(r.label)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all
                ${activeRegion === r.label
                  ? "border-amber-400 bg-amber-50 text-amber-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${r.dot} inline-block`} />
              {r.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              ⚠️ {error}
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >✕</button>
            </div>
          )}

          {/* ── Trending Collabs ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Trending Collabs</h2>
              <span className="text-xs text-amber-500 font-semibold cursor-pointer hover:text-amber-600">See All</span>
            </div>

            {loadingCollabs ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : collabs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="text-3xl mb-2">🤝</span>
                <p className="text-sm text-gray-500">No collaborations yet.</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to post one!</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {collabs.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl p-4 min-w-[200px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={getCollabName(c)} size="w-8 h-8" colorIdx={i} />
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{getCollabName(c)}</p>
                        <p className="text-[10px] font-semibold text-amber-500">Collaborator</p>
                      </div>
                    </div>
                    <Stars count={getCollabRating(c)} />
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      ↗ {c.engagements_count}+ engagements
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 3D City Map ── */}
          <section>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative h-64 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                {[0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1.1].map((t, i) => (
                  <line key={`h${i}`}
                    x1={`${50 - 50 * t}%`} y1={`${18 + i * 10}%`}
                    x2={`${50 + 50 * t}%`} y2={`${18 + i * 10}%`}
                    stroke="#2D4A6E" strokeWidth="0.8"
                  />
                ))}
                {[-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6].map((v, i) => (
                  <line key={`v${i}`}
                    x1="50%" y1="18%"
                    x2={`${50 + v * 10}%`} y2="100%"
                    stroke="#2D4A6E" strokeWidth="0.8"
                  />
                ))}
              </svg>

              {/* Buildings */}
              {[
                { left: "8%", top: "35%", w: 56, h: 32 },
                { left: "20%", top: "28%", w: 44, h: 48 },
                { left: "33%", top: "37%", w: 68, h: 28 },
                { left: "53%", top: "30%", w: 48, h: 44 },
                { left: "66%", top: "34%", w: 62, h: 33 },
                { left: "14%", top: "54%", w: 78, h: 22 },
                { left: "38%", top: "57%", w: 52, h: 26 },
                { left: "60%", top: "51%", w: 72, h: 30 },
                { left: "4%",  top: "67%", w: 88, h: 20 },
                { left: "28%", top: "71%", w: 58, h: 18 },
                { left: "53%", top: "69%", w: 82, h: 22 },
              ].map((b, i) => (
                <div
                  key={i}
                  className="absolute bg-slate-300 border border-white/10 rounded-sm opacity-80"
                  style={{ left: b.left, top: b.top, width: b.w, height: b.h }}
                />
              ))}

              {/* Green areas */}
              <div className="absolute rounded-md bg-emerald-400/50" style={{ left: "42%", top: "41%", width: 76, height: 48 }} />
              <div className="absolute rounded bg-emerald-400/40" style={{ left: "24%", top: "59%", width: 48, height: 28 }} />

              {/* Map pins */}
              {loadingPins ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white bg-black/30 px-3 py-1 rounded-full">
                    Loading map...
                  </span>
                </div>
              ) : mapPins.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white bg-black/30 px-3 py-1 rounded-full">
                    No prompts yet
                  </span>
                </div>
              ) : (
                mapPins.map((pin, i) => (
                  <div
                    key={pin.id}
                    className="absolute z-10 cursor-pointer"
                    style={{ top: pin.top, left: pin.left }}
                    onMouseEnter={() => setHoveredPin(i)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <div className={`bg-white rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-lg border border-gray-100 min-w-[140px] transition-transform duration-150 ${hoveredPin === i ? "scale-105" : "scale-100"}`}>
                      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] flex-shrink-0">🌍</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 leading-tight">{pin.title}</p>
                        <p className="text-[9px] text-gray-400 truncate">{pin.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white flex-shrink-0 ${i % 2 === 0 ? "bg-gray-900" : "bg-amber-400"}`}>+</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto mt-0.5 ring-2 ring-amber-200" />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Skills Needed ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Skills Needed</h2>
              <span className="text-xs text-amber-500 font-semibold cursor-pointer hover:text-amber-600">See All</span>
            </div>

            {loadingSkills ? (
              <SkeletonGrid />
            ) : skillRequests.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="text-3xl mb-2">🛠</span>
                <p className="text-sm text-gray-500">No skill requests for {activeRegion} yet.</p>
                <p className="text-xs text-gray-400 mt-1">Try a different region.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skillRequests.map((s, i) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={getSkillOwner(s)} size="w-8 h-8" colorIdx={i} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{getSkillOwner(s)}</p>
                        <Stars count={getSkillRating(s)} />
                      </div>
                      <button className="px-2.5 py-1 bg-amber-400 rounded-full text-[10px] font-bold text-gray-900 hover:bg-amber-500 transition-colors whitespace-nowrap">
                        I can help
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">
                      {s.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">💰</span>
                        <span className="text-[10px] text-gray-400">
                          {formatPayment(s.payment_min, s.payment_max)}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                        {s.skill_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}