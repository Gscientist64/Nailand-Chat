import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import logo from '../assets/images/logo/logo.png';

// ── API Setup with correct configuration ───────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────
interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private?: boolean;
  cover_image_url?: string;
  region?: string;
  is_member?: boolean;
}

interface Post {
  id: string;
  author_name?: string;
  author_id?: string;
  content: string;
  media_urls?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  author_rating?: number;
  is_liked?: boolean;
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  skills?: { skill_name: string }[];
  profile?: { rating?: number; avatar_url?: string };
}

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = ["bg-amber-400","bg-emerald-500","bg-blue-500","bg-pink-500","bg-violet-500","bg-orange-400"];
const NAV = [
  { icon: "⊞", label: "Dash Board", path: "/dashboard" },
  { icon: "✉", label: "Messages", path: "/messages" },
  { icon: "◎", label: "Community", path: "/community" }
];
const BNAV = [
  { icon: "?", label: "Help Desk" },
  { icon: "→", label: "Log Out" }
];
const FEED_TABS = ["Community Posts", "Collaboration Offers", "Skill Requests"];

// ── Helper Components ─────────────────────────────────────────────────────
const Avatar = ({ name, size = "w-9 h-9", ci = 0, img }: { name: string; size?: string; ci?: number; img?: string }) => {
  if (img) return <img src={img} alt={name} className={`${size} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${size} ${COLORS[ci % COLORS.length]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
};

const Stars = ({ n = 0 }: { n?: number }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-xs ${i <= n ? "text-amber-400" : "text-gray-300"}`}>★</span>
    ))}
  </div>
);

const SkelPost = () => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div>
        <div className="w-28 h-3 bg-gray-200 rounded mb-1.5" />
        <div className="w-20 h-2 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded mb-2" />
    <div className="w-4/5 h-2 bg-gray-200 rounded mb-3" />
    <div className="w-full h-40 bg-gray-100 rounded-xl" />
  </div>
);

const SkelPeople = () => (
  <div className="flex items-center gap-2 px-4 py-3 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex-1">
      <div className="w-20 h-2.5 bg-gray-200 rounded mb-1" />
      <div className="w-14 h-2 bg-gray-100 rounded" />
    </div>
    <div className="w-14 h-6 bg-gray-100 rounded-lg" />
  </div>
);

function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, callback: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 60000;
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}hr ago`;
  return date.toLocaleDateString();
};

const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ── Create Post Modal ──────────────────────────────────────────────────────
function PostModal({ communityId, onClose, onPosted }: { communityId: string; onClose: () => void; onPosted: (p: Post) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) return;
    try {
      setBusy(true);
      setErr(null);
      const res = await api.post(`/communities/${communityId}/posts`, { content: text.trim(), media_urls: [] });
      onPosted(res.data);
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to post.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Create a Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share something with the community..."
            rows={4}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400 resize-none"
          />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">📷 Image</button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">🎥 Video</button>
          </div>
          {err && <p className="text-xs text-red-500">⚠️ {err}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={submit}
              disabled={!text.trim() || busy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-sm font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              {busy ? <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create Collaboration Modal ────────────────────────────────────────────
function CollabModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    required_skills: "",
    budget_min: "",
    budget_max: "",
    duration_days: ""
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!form.title || !form.description) return;
    try {
      setBusy(true);
      await api.post("/dashboard/collaborations", {
        title: form.title,
        description: form.description,
        required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean),
        budget_min: Number(form.budget_min) || 0,
        budget_max: Number(form.budget_max) || 0,
        duration_days: Number(form.duration_days) || 0
      });
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to create collaboration request.");
    } finally {
      setBusy(false);
    }
  };

  const fields = [
    { key: "title", label: "Title", placeholder: "e.g. Looking for UI Designer" },
    { key: "description", label: "Description", placeholder: "Describe what you need...", multiline: true },
    { key: "required_skills", label: "Skills (comma separated)", placeholder: "e.g. React, Figma" },
    { key: "budget_min", label: "Min Budget (₦)", placeholder: "e.g. 30000", type: "number" },
    { key: "budget_max", label: "Max Budget (₦)", placeholder: "e.g. 60000", type: "number" },
    { key: "duration_days", label: "Duration (days)", placeholder: "e.g. 14", type: "number" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Create Collaboration Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
          {fields.map(({ key, label, placeholder, multiline, type }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
              {multiline ? (
                <textarea
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400 resize-none"
                />
              ) : (
                <input
                  type={type || "text"}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400"
                />
              )}
            </div>
          ))}
          {err && <p className="text-xs text-red-500">⚠️ {err}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={submit}
              disabled={!form.title || !form.description || busy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-sm font-bold text-gray-900 flex items-center justify-center"
            >
              {busy ? <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create Skill Request Modal ────────────────────────────────────────────
function SkillModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ skill_name: "", description: "", payment_min: "", payment_max: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!form.skill_name || !form.description) return;
    try {
      setBusy(true);
      await api.post("/dashboard/skill-requests", {
        skill_name: form.skill_name,
        description: form.description,
        payment_min: Number(form.payment_min) || 0,
        payment_max: Number(form.payment_max) || 0
      });
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to create skill request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Create Skill Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Skill Needed</label>
            <input
              value={form.skill_name}
              onChange={e => setForm(prev => ({ ...prev, skill_name: e.target.value }))}
              placeholder="e.g. UI Design, React"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What do you need help with?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Min Payment (₦)</label>
            <input
              type="number"
              value={form.payment_min}
              onChange={e => setForm(prev => ({ ...prev, payment_min: e.target.value }))}
              placeholder="e.g. 20000"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Max Payment (₦)</label>
            <input
              type="number"
              value={form.payment_max}
              onChange={e => setForm(prev => ({ ...prev, payment_max: e.target.value }))}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400"
            />
          </div>
          {err && <p className="text-xs text-red-500">⚠️ {err}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={submit}
              disabled={!form.skill_name || !form.description || busy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-sm font-bold text-gray-900 flex items-center justify-center"
            >
              {busy ? <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main CommunityFeed Component ──────────────────────────────────────────
export default function CommunityFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { communityId } = useParams<{ communityId: string }>();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedTab, setFeedTab] = useState("Community Posts");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("English");

  // API data state
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  // Loading & error state
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [joining, setJoining] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(searchRef, () => setSearchOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(langRef, () => setLangOpen(false));

  // Fetch community details
  useEffect(() => {
    if (!communityId) return;
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const res = await api.get(`/communities/${communityId}`);
        setCommunity(res.data);
      } catch (err) {
        console.error("Failed to load community:", err);
        setError("Failed to load community.");
      } finally {
        setLoadingCommunity(false);
      }
    };
    fetchCommunity();
  }, [communityId]);

  // Fetch posts
  useEffect(() => {
    if (!communityId) return;
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const res = await api.get(`/communities/${communityId}/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [communityId]);

  // Fetch suggested people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoadingPeople(true);
        const res = await api.get("/dashboard/search-users", {
          params: { q: "a", search_type: "name", limit: 12 }
        });
        setPeople(res.data);
      } catch (err) {
        console.error("Failed to load people:", err);
      } finally {
        setLoadingPeople(false);
      }
    };
    fetchPeople();
  }, []);

  const handleJoin = async () => {
    if (!community) return;
    try {
      setJoining(true);
      await api.post(`/communities/${community.id}/join`);
      setCommunity(prev => prev ? { ...prev, is_member: true } : prev);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to join community.");
    } finally {
      setJoining(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, likes_count: res.data.likes_count, is_liked: res.data.liked }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleConnect = async (personId: string, name: string) => {
    try {
      setConnectingId(personId);
      await api.post("/messages/conversations/start", {
        user_id: personId,
        initial_message: `Hi ${name}! I'd love to connect with you.`
      });
      navigate("/messages");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to start conversation.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth-storage");
    navigate("/login");
  };

  // Languages
  const languages = [
    { label: "English", flag: "🇬🇧" },
    { label: "French", flag: "🇫🇷" },
    { label: "Spanish", flag: "🇪🇸" },
    { label: "Portuguese", flag: "🇵🇹" }
  ];

  const regions = [
    { label: "Creative", dot: "bg-amber-400" },
    { label: "Tech", dot: "bg-blue-500" },
    { label: "Wellness", dot: "bg-emerald-500" },
    { label: "Business", dot: "bg-indigo-500" },
    { label: "Politics", dot: "bg-red-500" },
    { label: "Economics", dot: "bg-violet-500" },
    { label: "Science", dot: "bg-cyan-500" }
  ];

  return (
    <div className="flex h-screen font-sans bg-gray-50 overflow-hidden">

      {/* Modals */}
      {showPostModal && communityId && (
        <PostModal
          communityId={communityId}
          onClose={() => setShowPostModal(false)}
          onPosted={newPost => setPosts(prev => [newPost, ...prev])}
        />
      )}
      {showCollabModal && <CollabModal onClose={() => setShowCollabModal(false)} />}
      {showSkillModal && <SkillModal onClose={() => setShowSkillModal(false)} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-44 bg-gray-50 flex flex-col pt-4 pb-6 flex-shrink-0 border-r border-gray-200 transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center justify-between w-full mb-6 px-4">
          <img src={logo} alt="NaiLand" className="w-24 h-auto" />
          <button className="md:hidden text-gray-400 text-xl" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="flex flex-col w-full">
          {NAV.map(item => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center px-4 py-3 cursor-pointer gap-3 transition-colors w-full ${location.pathname.startsWith(item.path) && (item.path !== "/dashboard" || location.pathname === "/dashboard") ? "bg-amber-400" : "hover:bg-gray-200"}`}
            >
              <span className={`text-base ${location.pathname.startsWith(item.path) ? "text-gray-900" : "text-gray-400"}`}>{item.icon}</span>
              <span className={`text-xs font-semibold ${location.pathname.startsWith(item.path) ? "text-gray-900" : "text-gray-500"}`}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col w-full">
          {BNAV.map(item => (
            <div
              key={item.label}
              onClick={item.label === "Log Out" ? handleLogout : undefined}
              className="flex items-center px-4 py-3 cursor-pointer gap-3 hover:bg-gray-200 transition-colors w-full"
            >
              <span className="text-base text-gray-500">{item.icon}</span>
              <span className="text-xs font-semibold text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 z-20">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400">✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {/* Cover Banner */}
          <div className="relative w-full h-40 md:h-52 bg-gradient-to-br from-teal-400 via-cyan-300 to-amber-300 overflow-hidden flex-shrink-0">
            {community?.cover_image_url ? (
              <img src={community.cover_image_url} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20 text-8xl">🌍</div>
            )}
            <button className="md:hidden absolute top-3 left-3 p-1.5 bg-white/80 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/community")}
              className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-xs font-semibold text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Community info bar */}
          <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-3 pb-4 flex-shrink-0">
            <div className="flex items-end justify-between mb-3">
              <div className="-mt-20 w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                <Avatar name={community?.name || "C"} size="w-full h-full" ci={2} />
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {community && !community.is_member ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-xs font-bold text-gray-900 disabled:opacity-50"
                  >
                    {joining ? "Joining..." : "Join Community"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/messages")}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-xs font-bold text-gray-900"
                  >
                    💬 Community Chat
                  </button>
                )}
                <button
                  onClick={() => setShowCollabModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700"
                >
                  + Collaboration Request
                </button>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700"
                >
                  + Skill Request
                </button>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{community?.name || "Community"}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{community?.description}</p>
            </div>
          </div>

          {/* Feed + Sidebar */}
          <div className="flex gap-5 px-4 md:px-5 py-4 max-w-6xl mx-auto w-full">

            {/* Feed */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* Create post box */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name="You" size="w-9 h-9" ci={0} />
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 text-left hover:bg-gray-100 cursor-pointer"
                  >
                    Create a post...
                  </button>
                </div>
                <div className="flex gap-3 pt-1 border-t border-gray-50">
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    📷 Image
                  </button>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    🎥 Video
                  </button>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="ml-auto px-4 py-1.5 bg-amber-400 hover:bg-amber-500 rounded-lg text-xs font-bold text-gray-900"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Feed tabs */}
              <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-2 overflow-x-auto">
                {FEED_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFeedTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${feedTab === tab ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {loadingPosts ? (
                <>{[1, 2, 3].map(i => <SkelPost key={i} />)}</>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <span className="text-4xl mb-3 block">📝</span>
                  <p className="text-sm font-semibold text-gray-700">No posts yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to share something!</p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="mt-4 px-5 py-2 bg-amber-400 hover:bg-amber-500 rounded-xl text-xs font-bold text-gray-900"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                posts.map((post, idx) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-start justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={post.author_name || "U"} size="w-9 h-9" ci={idx % COLORS.length} />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{post.author_name || "Community Member"}</p>
                          <Stars n={Math.round(post.author_rating || 0)} />
                          <p className="text-[10px] text-gray-400">{formatTime(post.created_at)}</p>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-gray-500 text-lg leading-none">···</button>
                    </div>
                    <div className="px-4 pb-3">
                      <p className="text-xs text-gray-700 leading-relaxed">{post.content}</p>
                    </div>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="px-4 pb-3">
                        <div className={`grid gap-2 ${post.media_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                          {post.media_urls.map((url, mi) => (
                            <img key={mi} src={url} alt="" className="w-full h-48 object-cover rounded-xl" />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 px-4 py-3 border-t border-gray-50">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${post.is_liked ? "text-amber-600 bg-amber-50" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
                      >
                        {post.is_liked ? "❤️" : "🤍"} {formatNumber(post.likes_count || 0)}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        💬 {formatNumber(post.comments_count || 0)}
                      </button>
                      <span className="ml-auto flex items-center gap-1 text-xs text-gray-300">
                        👁 {formatNumber(post.views_count || 0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right sidebar - Find People */}
            <div className="hidden md:flex flex-col gap-3 w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="text-xs font-bold text-gray-900">Find people</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex flex-col divide-y divide-gray-50 max-h-[calc(100vh-320px)] overflow-y-auto">
                  {loadingPeople ? (
                    <>{[1, 2, 3, 4, 5].map(i => <SkelPeople key={i} />)}</>
                  ) : people.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No people found</p>
                  ) : (
                    people.map((person, idx) => (
                      <div key={person.id} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <Avatar name={person.first_name} size="w-8 h-8" ci={idx} img={person.profile?.avatar_url} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{person.first_name} {person.last_name}</p>
                          <Stars n={Math.round(person.profile?.rating || 0)} />
                        </div>
                        <button
                          onClick={() => handleConnect(person.id, `${person.first_name} ${person.last_name}`)}
                          disabled={connectingId === person.id}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-lg text-[10px] font-bold text-gray-900 whitespace-nowrap flex-shrink-0"
                        >
                          {connectingId === person.id ? "..." : "Connect"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}