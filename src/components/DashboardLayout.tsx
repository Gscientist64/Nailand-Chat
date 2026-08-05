import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import NaiLandLogo from './NaiLandLogo';
import { UserProfile } from '../types';
import { notificationsApi, dashboardApi, communitiesApi } from '../lib/api';
import {
  LayoutDashboard, MessageSquareCode, Users, HelpCircle, LogOut,
  Menu, X, Bell, Globe, SlidersHorizontal, Check, Search, Send, Users as UsersIcon
} from 'lucide-react';

interface DashboardLayoutProps {
  user: UserProfile;
  onLogout: () => void;
}

// ============================================================
// Notifications Dropdown
// ============================================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsApi.list().then((res) => {
      if (res.success && res.data) setNotifications(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 overflow-hidden text-left" id="notif-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/60">
        <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">Notifications</span>
        <button onClick={markAllRead} className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer flex items-center gap-1">
          <Check className="w-3 h-3" /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto" id="notif-list">
        {loading && (
          <div className="p-4 text-xs text-stone-400 animate-pulse">Loading notifications...</div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-4 text-xs text-stone-400 text-center">You're all caught up 🎉</div>
        )}

        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-amber-50/40 transition cursor-pointer flex gap-2.5
              ${n.isRead ? 'opacity-60' : 'bg-amber-50/30'}`}
            id={`notif-item-${n.id}`}
          >
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#FFB300]" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-bold text-stone-900 leading-tight">{n.title}</span>
              {n.body && <span className="text-[11px] text-stone-500 leading-snug">{n.body}</span>}
              <span className="text-[9px] font-mono text-stone-400">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Global Search Dropdown
// ============================================================
function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ users: any[]; communities: any[] }>({ users: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = (q: string) => {
    if (!q.trim()) {
      setResults({ users: [], communities: [] });
      setOpen(false);
      return;
    }
    setLoading(true);
    Promise.all([
      dashboardApi.searchUsers(q),
      communitiesApi.search(q),
    ]).then(([uRes, cRes]) => {
      setResults({
        users: (uRes.success && uRes.data) ? uRes.data : [],
        communities: (cRes.success && cRes.data) ? cRes.data : [],
      });
      setOpen(true);
      setLoading(false);
    });
  };

  const handleChange = (v: string) => {
    setQuery(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(v), 300);
  };

  return (
    <div className="relative w-full max-w-[500px]" ref={wrapRef} id="desktop-search-wrapper">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" style={{ strokeWidth: 1.8 }} />
        <input
          type="text"
          placeholder="Search users, communities..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl pl-11 pr-12 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-[#FFC107] transition-all font-sans"
          id="inp-header-search"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 cursor-pointer transition" id="btn-header-filter">
          <SlidersHorizontal className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-12 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 overflow-hidden text-left" id="search-panel">
          <div className="max-h-96 overflow-y-auto p-2">
            {loading && <div className="p-3 text-xs text-stone-400 animate-pulse">Searching...</div>}

            {!loading && results.users.length === 0 && results.communities.length === 0 && (
              <div className="p-3 text-xs text-stone-400 text-center">No results found</div>
            )}

            {results.users.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest">Users</div>
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setOpen(false); setQuery(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50/50 cursor-pointer text-left"
                  >
                    <img src={u.avatarUrl || ''} alt={u.firstName} className="w-8 h-8 rounded-full object-cover border border-stone-200" referrerPolicy="no-referrer" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-stone-900 truncate">{u.firstName} {u.secondName}</span>
                      <span className="text-[10px] text-stone-400 truncate">{u.interests?.slice(0, 3).join(', ') || 'Member'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.communities.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest">Communities</div>
                {results.communities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                      navigate(`/app/community/${encodeURIComponent(c.name)}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50/50 cursor-pointer text-left"
                  >
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-stone-200" referrerPolicy="no-referrer" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-stone-900 truncate">{c.name}</span>
                      <span className="text-[10px] text-stone-400">{c.memberCount || 0} members</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Dashboard Layout
// ============================================================
export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const path = location.pathname;
  const activeTab =
    path.includes('/messages') ? 'messages' :
    path.includes('/community') ? 'community' :
    path.includes('/help') ? 'help' : 'dashboard';

  // Load unread notification count
  const loadUnread = () => {
    notificationsApi.unreadCount().then((res) => {
      if (res.success && res.data) setUnreadNotifs(res.data.count);
    });
  };

  useEffect(() => {
    loadUnread();
    const iv = setInterval(loadUnread, 30000);
    return () => clearInterval(iv);
  }, []);

  const go = (tab: string) => {
    setSidebarOpen(false);
    setNotifOpen(false);
    if (tab === 'logout') { onLogout(); return; }
    navigate(`/app/${tab}`);
  };

  const menuItems = [
    { id: 'dashboard', text: 'Dash Board', icon: LayoutDashboard },
    { id: 'messages', text: 'Messages', icon: MessageSquareCode },
    { id: 'community', text: 'Community', icon: Users },
  ];

  const subItems = [
    { id: 'help', text: 'Help Desk', icon: HelpCircle },
    { id: 'logout', text: 'Log Out', icon: LogOut, action: onLogout },
  ];

  const profileAvatarUrl = user.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=120';

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-stone-800 flex flex-col md:flex-row font-sans" id="app-layout-root">

      {/* MOBILE BAR */}
      <div className="md:hidden bg-white border-b border-stone-100 px-4 py-3 flex justify-between items-center z-50 sticky top-0" id="mobile-topbar">
        <NaiLandLogo size="sm" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-1.5 text-stone-400 hover:text-stone-800 whitespace-nowrap"
            id="btn-mobile-bells"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg whitespace-nowrap"
            id="btn-mobile-hamburger"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-2 mb-0.5 text-[#100F0F] font-bold" />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#EFEFEF] flex flex-col transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 h-screen shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="app-sidebar"
      >
        <div className="p-6 pb-8 flex justify-start items-center" id="sidebar-logo-container">
          <NaiLandLogo size="sm" />
        </div>

        <nav className="flex-1 px-0 flex flex-col justify-between" id="sidebar-menu">
          <div className="flex flex-col gap-1" id="sidebar-main-group">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-semibold select-none cursor-pointer transition-all whitespace-nowrap text-left
                    ${isActive ? 'bg-[#FFC107] text-stone-950 font-bold border-none' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
                  id={`nav-item-${item.id}`}
                >
                  <IconComp className={`w-5 h-5 ${isActive ? 'text-stone-950 stroke-[2.2px]' : 'text-stone-400'}`} />
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 mb-6" id="sidebar-sub-group">
            {subItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-semibold select-none cursor-pointer transition-all whitespace-nowrap text-left
                    ${isActive ? 'bg-[#FFC107] text-stone-950 font-bold border-none' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'}`}
                  id={`nav-item-${item.id}`}
                >
                  <IconComp className={`w-5 h-5 ${isActive ? 'text-stone-950 stroke-[2.2px]' : 'text-stone-400'}`} />
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto" id="app-viewport">

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-white border-b border-[#EFEFEF] sticky top-0 z-30 h-[80px]" id="desktop-persistent-header">
          <GlobalSearch />

          <div className="flex items-center gap-5" id="header-right-side">
            <button className="p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition cursor-pointer" id="btn-hdr-globe">
              <Globe className="w-[20px] h-[20px]" style={{ strokeWidth: 1.8 }} />
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition cursor-pointer relative"
                id="btn-hdr-bell"
              >
                <Bell className="w-[20px] h-[20px]" style={{ strokeWidth: 1.8 }} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#E53935] rounded-full border border-white"></span>
                )}
              </button>
              {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2.5 ml-1 select-none" id="avatar-container-head">
              <div className="relative w-10 h-10" id="avatar-ring-head">
                <img
                  src={profileAvatarUrl}
                  alt={`${user.firstName} ${user.secondName}`}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                  id="img-hdr-avatar"
                />
                <span className="absolute bottom-0 left-0 w-[11px] h-[11px] bg-[#4CAF50] rounded-full border-2 border-white"></span>
                <span className="absolute -bottom-0.5 -right-1 bg-stone-100 hover:bg-stone-200 rounded-full p-[2px] border border-stone-200 cursor-pointer transition-shadow" id="badge-hdr-gear">
                  <SlidersHorizontal className="w-[10px] h-[10px] text-stone-600 rotate-90" />
                </span>
              </div>
              <div className="flex flex-col text-left hidden lg:block">
                <span className="text-xs font-bold text-stone-900 leading-tight">{user.firstName} {user.secondName}</span>
                <span className="text-[9px] text-stone-400">{user.region || 'Member'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white" id="main-content-scrollable">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
