// src/components/Messages.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from '../assets/images/logo/logo.png';

// -- API Setup -------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Fixed: Using accessToken instead of token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -- Types -----------------------------------------------------------------
interface Conversation {
  id: string;
  other_person_id: string;
  other_person_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_text: string;
  is_mine: boolean;
  is_read: boolean;
  created_at: string;
}

interface ConversationMessagesResponse {
  conversation_id: string;
  other_person_name: string;
  messages: Message[];
}

// -- Constants -------------------------------------------------------------
const avatarColors = [
  "bg-amber-400", "bg-emerald-500", "bg-blue-500",
  "bg-pink-500", "bg-violet-500", "bg-orange-400"
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
  { icon: "?", label: "Dash Board", path: "/dashboard" },
  { icon: "?", label: "Messages", path: "/messages" },
  { icon: "?", label: "Community", path: "/community" },
];

const bottomNav = [
  { icon: "?", label: "Help Desk" },
  { icon: "?", label: "Log Out" },
];

const tabs = ["All", "Unread", "Read"];

const languages = [
  { label: "English", flag: "????" },
  { label: "French", flag: "????" },
  { label: "Spanish", flag: "????" },
  { label: "Portuguese", flag: "????" },
];

// -- Components ------------------------------------------------------------
const Avatar = ({ name, size = "w-9 h-9", colorIdx = 0, img }: {
  name: string; size?: string; colorIdx?: number; img?: string;
}) => {
  if (img) return (
    <img src={img} alt={name} className={`${size} rounded-full object-cover flex-shrink-0`} />
  );
  return (
    <div className={`${size} ${avatarColors[colorIdx % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
};

const SkeletonConv = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex-1">
      <div className="w-28 h-3 bg-gray-200 rounded mb-2" />
      <div className="w-40 h-2 bg-gray-200 rounded" />
    </div>
  </div>
);

const SkeletonMessages = () => (
  <div className="flex flex-col gap-4 p-5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
        <div className={`w-48 h-12 rounded-2xl bg-gray-200 animate-pulse`} />
      </div>
    ))}
  </div>
);

// -- Hook ------------------------------------------------------------------
function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, callback: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

// -- Messages Page ---------------------------------------------------------
export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();

  // UI state
  const [activeTab, setActiveTab] = useState("All");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("English");

  // API data state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  // Loading & error state
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(searchRef, () => setSearchOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(langRef, () => setLangOpen(false));

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -- Fetch conversations on mount ----------------------------------------
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConvs(true);
        const res = await api.get("/messages/conversations");
        setConversations(res.data);
        // Auto-select first conversation on desktop
        if (res.data.length > 0) {
          setSelectedConv(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError("Failed to load conversations.");
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConversations();
  }, []);

  // -- Fetch messages when conversation changes ----------------------------
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get<ConversationMessagesResponse>(
          `/messages/conversations/${selectedConv.id}/messages`,
          { params: { limit: 50, offset: 0 } }
        );
        setMessages(res.data.messages);

        // Mark conversation as read
        await api.post(`/messages/conversations/${selectedConv.id}/read`);

        // Update unread count in conversation list
        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? { ...c, unread_count: 0 } : c)
        );
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConv?.id]);

  // -- Send message --------------------------------------------------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;

    const text = newMessage.trim();
    setNewMessage("");

    // Optimistic update — show message instantly
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: "me",
      sender_name: "You",
      message_text: text,
      is_mine: true,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      setSending(true);
      const res = await api.post<Message>(
        `/messages/conversations/${selectedConv.id}/messages`,
        { message_text: text }
      );

      // Replace optimistic message with real one from server
      setMessages(prev =>
        prev.map(m => m.id === optimisticMsg.id ? res.data : m)
      );

      // Update last message in conversation list
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConv.id
            ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(text); // restore the message
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // -- Select conversation -------------------------------------------------
  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView("chat");
  };

  // -- Logout --------------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // -- Filter conversations ------------------------------------------------
  const filteredConvs = conversations.filter(c => {
    if (activeTab === "Unread") return c.unread_count > 0;
    if (activeTab === "Read") return c.unread_count === 0;
    return true;
  }).filter(c => {
    if (!search.trim()) return true;
    return c.other_person_name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_message.toLowerCase().includes(search.toLowerCase());
  });

  // -- Format time ---------------------------------------------------------
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Total unread count for badge
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

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
          <button className="md:hidden text-gray-400 hover:text-gray-600 text-xl leading-none" onClick={() => setSidebarOpen(false)}>?</button>
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">

          {/* Hamburger or back */}
          {mobileView === "chat" ? (
            <button
              className="md:hidden p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => setMobileView("list")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button
              className="md:hidden p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile chat: show contact name */}
          {mobileView === "chat" && selectedConv ? (
            <div className="flex items-center gap-2 md:hidden flex-1 min-w-0">
              <Avatar name={selectedConv.other_person_name} size="w-7 h-7" colorIdx={0} />
              <p className="text-sm font-bold text-gray-900 truncate">{selectedConv.other_person_name}</p>
            </div>
          ) : (
            /* Search */
            <div className="relative flex items-center gap-2 w-full md:w-96 lg:w-[500px]" ref={searchRef}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search chats..."
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
              {searchOpen && search.trim() && filteredConvs.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] py-3 overflow-hidden">
                  <p className="text-xs text-gray-400 font-semibold px-4 pb-2">Results for "{search}"</p>
                  {filteredConvs.slice(0, 5).map((conv, i) => (
                    <div key={conv.id}
                      onClick={() => { handleSelectConv(conv); setSearchOpen(false); setSearch(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Avatar name={conv.other_person_name} size="w-8 h-8" colorIdx={i} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{conv.other_person_name}</p>
                        <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Desktop search when in chat view */}
          {mobileView === "chat" && (
            <div className="relative hidden md:flex items-center gap-2 w-96 lg:w-[500px]" ref={searchRef}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search chats..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
                className="relative text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >
                ??
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base">??</span>
                      <span className="text-sm font-bold text-gray-900">Notifications</span>
                    </div>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {conversations.filter(c => c.unread_count > 0).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                    ) : (
                      conversations.filter(c => c.unread_count > 0).map((c, i) => (
                        <div key={c.id}
                          onClick={() => { handleSelectConv(c); setNotifOpen(false); }}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar name={c.other_person_name} size="w-8 h-8" colorIdx={i} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 leading-snug">
                                <span className="font-semibold">{c.other_person_name}</span> sent you a message
                              </p>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.last_message}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                              {formatTime(c.last_message_time)}
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
              >??</button>
              {langOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] py-3 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 pb-2 border-b border-gray-100 mb-1">
                    <span className="text-base">??</span>
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

        {/* Region filters */}
        <div className={`flex items-center gap-2 px-5 py-2.5 bg-white border-b border-gray-100 overflow-x-auto
          ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Suggested Region</span>
          {regions.map((r) => (
            <button key={r.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${r.dot} inline-block`} />
              {r.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
            ?? {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">?</button>
          </div>
        )}

        {/* Messages panel */}
        <div className="flex flex-1 overflow-hidden">

          {/* Conversation list */}
          <div className={`
            flex flex-col border-r border-gray-200 bg-white flex-shrink-0 overflow-hidden
            w-full md:w-80
            ${mobileView === "list" ? "flex" : "hidden"} md:flex
          `}>
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900">Messages</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-gray-100 flex-shrink-0">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all
                    ${activeTab === tab
                      ? "bg-amber-400 text-gray-900"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {tab}
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${activeTab === tab ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-600"}`}>
                    {filteredConvs.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <>
                  {[1, 2, 3, 4, 5].map(i => <SkeletonConv key={i} />)}
                </>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <span className="text-4xl mb-3">??</span>
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a conversation with someone!</p>
                </div>
              ) : (
                filteredConvs.map((conv, i) => (
                  <div key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50
                      ${selectedConv?.id === conv.id ? "bg-amber-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={conv.other_person_name} size="w-9 h-9" colorIdx={i} />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{conv.other_person_name}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{conv.last_message}</p>
                      {conv.unread_count > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block bg-amber-100 text-amber-600">
                          {conv.unread_count} unread
                        </span>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 md:hidden flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat window */}
          <div className={`
            flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden
            ${mobileView === "chat" ? "flex" : "hidden"} md:flex
          `}>
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <span className="text-5xl mb-4">??</span>
                <p className="text-base font-semibold text-gray-700">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose from your conversations on the left</p>
              </div>
            ) : (
              <>
                {/* Chat header — desktop */}
                <div className="hidden md:flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedConv.other_person_name} size="w-9 h-9" colorIdx={0} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedConv.other_person_name}</p>
                      {selectedConv.unread_count === 0 && (
                        <p className="text-[10px] text-emerald-500 font-medium">? Online</p>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 text-lg">?</button>
                </div>

                {/* Mobile chat header */}
                <div className="flex md:hidden items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
                  <p className="text-xs text-gray-400">Active now</p>
                  <button className="text-gray-400 hover:text-gray-600 text-lg">?</button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 flex flex-col gap-4">
                  {loadingMessages ? (
                    <SkeletonMessages />
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="text-4xl mb-3">??</span>
                      <p className="text-sm text-gray-500">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Say hello to {selectedConv.other_person_name}!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.is_mine ? "items-end" : "items-start"}`}>
                        {!msg.is_mine && (
                          <p className="text-xs font-semibold text-gray-700 mb-1 ml-1">{msg.sender_name}</p>
                        )}
                        <div className={`max-w-[80%] md:max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed
                          ${msg.is_mine
                            ? "bg-gray-700 text-white rounded-tr-sm"
                            : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-tl-sm"
                          } ${msg.id.startsWith("temp-") ? "opacity-60" : ""}`}
                        >
                          {msg.message_text}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 mx-1">
                          {formatTime(msg.created_at)}
                          {msg.is_mine && (
                            <span className="ml-1">{msg.is_read ? "??" : "?"}</span>
                          )}
                        </p>
                      </div>
                    ))
                  )}
                  {/* Auto scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 md:px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSendMessage(); }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="w-8 h-8 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      {sending ? (
                        <span className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}