import React from 'react';
import NaiLandLogo from './NaiLandLogo';
import { DashboardTab, UserProfile } from '../types';
import { LayoutDashboard, MessageSquareCode, Users, HelpCircle, LogOut, Menu, X, Bell, Globe, Settings, SlidersHorizontal } from 'lucide-react';

interface DashboardLayoutProps {
  user: UserProfile;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, activeTab, setActiveTab, onLogout, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Menu lists
  const menuItems = [
    { id: 'dashboard' as DashboardTab, text: 'Dash Board', icon: LayoutDashboard },
    { id: 'messages' as DashboardTab, text: 'Messages', icon: MessageSquareCode },
    { id: 'community' as DashboardTab, text: 'Community', icon: Users },
  ];

  const subItems = [
    { id: 'help' as DashboardTab, text: 'Help Desk', icon: HelpCircle },
    { id: 'logout' as DashboardTab, text: 'Log Out', icon: LogOut, action: onLogout },
  ];

  // Afolabi Ola profile avatar matching the image
  const profileAvatarUrl = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=120';

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-stone-800 flex flex-col md:flex-row font-sans" id="app-layout-root">
      
      {/* MOBILE BAR */}
      <div className="md:hidden bg-white border-b border-stone-100 px-4 py-3 flex justify-between items-center z-50 sticky top-0" id="mobile-topbar">
        <NaiLandLogo size="sm" />
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 text-stone-400 hover:text-stone-800 whitespace-nowrap" id="btn-mobile-bells">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
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

      {/* SIDEBAR NAVIGATION LAYOUT */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#EFEFEF] flex flex-col transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 h-screen shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="app-sidebar"
      >
        {/* Sidebar Header Logo */}
        <div className="p-6 pb-8 flex justify-start items-center" id="sidebar-logo-container">
          <NaiLandLogo size="sm" />
        </div>

        {/* Menu Items lists */}
        <nav className="flex-1 px-0 flex flex-col justify-between" id="sidebar-menu">
          <div className="flex flex-col gap-1" id="sidebar-main-group">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-semibold select-none cursor-pointer transition-all whitespace-nowrap text-left
                    ${isActive 
                      ? 'bg-[#FFC107] text-stone-950 font-bold border-none' 
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
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
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-semibold select-none cursor-pointer transition-all whitespace-nowrap text-left
                    ${isActive 
                      ? 'bg-[#FFC107] text-stone-950 font-bold border-none' 
                      : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'}`}
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

      {/* Main View Port content */}
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto" id="app-viewport">
        
        {/* Persistent Desktop Header matching the screenshot exactly */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-white border-b border-[#EFEFEF] sticky top-0 z-30 h-[80px]" id="desktop-persistent-header">
          {/* Wider search container with filter funnel button inside the input */}
          <div className="relative w-full max-w-[500px]" id="desktop-search-wrapper">
            <input 
              type="text" 
              placeholder="Search for..."
              className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl pl-5 pr-12 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-[#FFC107] transition-all font-sans"
              id="inp-header-search"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 cursor-pointer transition" id="btn-header-filter">
              <SlidersHorizontal className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            </button>
          </div>

          {/* User profile, notifications indicators and settings on right line */}
          <div className="flex items-center gap-5" id="header-right-side">
            {/* Globe icon representing region */}
            <button className="p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition cursor-pointer" id="btn-hdr-globe">
              <Globe className="w-[20px] h-[20px]" style={{ strokeWidth: 1.8 }} />
            </button>

            {/* Notification bell with red status dot */}
            <button className="p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition cursor-pointer relative" id="btn-hdr-bell">
              <Bell className="w-[20px] h-[20px]" style={{ strokeWidth: 1.8 }} />
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#E53935] rounded-full border border-white"></span>
            </button>

            {/* Dynamic Active User Profile Avatar */}
            <div className="flex items-center gap-2.5 ml-1 select-none" id="avatar-container-head">
              <div className="relative w-10 h-10" id="avatar-ring-head">
                <img 
                  src={profileAvatarUrl} 
                  alt="Afolabi Ola" 
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                  id="img-hdr-avatar"
                />
                
                {/* Active Indicator green bubble on bottom left */}
                <span className="absolute bottom-0 left-0 w-[11px] h-[11px] bg-[#4CAF50] rounded-full border-2 border-white"></span>
                
                {/* Micro cog settings gear overlay on bottom right */}
                <span className="absolute -bottom-0.5 -right-1 bg-stone-100 hover:bg-stone-200 rounded-full p-[2px] border border-stone-200 cursor-pointer transition-shadow" id="badge-hdr-gear">
                  <SlidersHorizontal className="w-[10px] h-[10px] text-stone-600 rotate-90" />
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white" id="main-content-scrollable">
          {children}
        </div>
      </main>

    </div>
  );
}
