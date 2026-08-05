import React, { useState } from 'react';
import NaiLandLogo from './NaiLandLogo';
import { useCommunities } from '../lib/CommunitiesContext';
import { ArrowRight, Globe, Layers, Check, Search, ShieldCheck, Cpu, Smartphone, Monitor, Users, FileText, CheckSquare } from 'lucide-react';
// @ts-ignore
import sunsetSilhouette from '../assets/images/sunset_community_silhouette_1781078632097.png';

interface LandingPageProps {
  onSignUpClick: () => void;
  onLogInClick: () => void;
  onExploreSkillsClick: () => void;
}

export default function LandingPage({ onSignUpClick, onLogInClick, onExploreSkillsClick }: LandingPageProps) {
  const { communities } = useCommunities();
  const [skillSearch, setSkillSearch] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [activeScrollRow, setActiveScrollRow] = useState(0);

  const toggleSkillRef = (txt: string) => {
    if (skillSearch.toLowerCase() === txt.toLowerCase()) {
      setSkillSearch('');
    } else {
      setSkillSearch(txt);
    }
  };

  const isPillMatched = (txt: string) => {
    if (!skillSearch) return true;
    return txt.toLowerCase().includes(skillSearch.toLowerCase());
  };

  // Real community cards from API (falls back to live feed styling)
  const collabFeeds = communities.slice(0, 5).map((c, idx) => {
    const dotColors = ['bg-orange-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-600', 'bg-purple-600'];
    const badges = ['ACTIVE NOW', 'BUILDING IN PUBLIC', 'EARLY CONTRIBUTOR', 'GROWING EXPERIENCE', 'OPEN TO COLLAB'];
    return {
      id: idx + 1,
      name: c.name,
      role: (c.tags && c.tags[0]) || 'Community',
      avatar: c.avatar,
      projects: `${c.memberCount || 0} members`,
      badge: badges[idx % badges.length],
      dotColor: dotColors[idx % dotColors.length]
    };
  });

  const skillPills = [
    { text: 'Technical', isDark: false },
    { text: 'Data Analyst', isDark: true },
    { text: 'Editor', isDark: false },
    { text: 'Web Designer', isDark: true },
    { text: 'Programmer', isDark: true },
    { text: 'Data Analyst', isDark: true },
    { text: 'Technical', isDark: false },
    { text: 'UX Designer', isDark: true },
    { text: '', isDark: false, isEmptySlot: true },
    { text: 'Technical', isDark: false },
    { text: 'Copy Writer', isDark: true },
    { text: 'UI Designer', isDark: false }
  ];

  return (
    <div className="bg-[#fdfcf9] min-h-screen text-stone-800 font-sans relative overflow-x-hidden" id="landing-main-root">
      
      {/* Rectangle 3 */}
      <div 
        className="pointer-events-none select-none z-0 hidden md:block"
        style={{
          position: 'absolute',
          width: '1440px',
          height: '1056px',
          left: 'calc(50% - 1440px/2)',
          top: '0px',
          background: 'linear-gradient(180deg, rgba(255, 205, 57, 0.1) 0%, rgba(115, 115, 115, 0.1) 92.31%, rgba(255, 255, 255, 0.1) 100%)',
        }}
        id="figma-rectangle-3-gradient-bg"
      />
      
      {/* HEADER NAVBAR */}
      <header className="border-b border-stone-100 py-3 px-6 md:px-12 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50" id="landing-navbar">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})} id="nav-logo-wrap">
          <NaiLandLogo size="md" />
        </div>
        
        {/* Navigation Middle list */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600" id="nav-menu">
          <a href="#" className="text-black font-semibold border-b-2 border-stone-800 pb-0.5" id="menu-home">Home</a>
          <a href="#about" className="hover:text-amber-600 transition" id="menu-about">About</a>
          <a href="#pages" className="hover:text-amber-600 transition" id="menu-pages">Pages</a>
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-amber-600 transition" id="menu-features">
            <span>Features</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </nav>

        {/* Navigation Right triggers */}
        <div className="flex items-center gap-3" id="nav-actions">
          <button className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap" id="btn-language">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span>Language</span>
          </button>
          
          <button 
            onClick={onSignUpClick} 
            className="border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold px-4 py-1.5 rounded-full text-xs cursor-pointer transition whitespace-nowrap"
            id="btn-signup-nav"
          >
            Sign Up
          </button>
          
          <button 
            onClick={onLogInClick} 
            className="bg-[#f8c21a] hover:bg-[#e0ac10] font-semibold text-stone-900 px-4 py-1.5 rounded-full text-xs shadow-sm cursor-pointer transition whitespace-nowrap"
            id="btn-login-nav"
          >
            Log In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-12 pb-20 md:px-12 max-w-7xl mx-auto flex flex-col items-center" id="landing-hero-section">
        
        {/* Overlapping member counter overlay */}
        <div className="flex items-center gap-2.5 bg-neutral-100/80 border border-white/60 backdrop-blur px-3.5 py-1.5 rounded-full mb-6 shadow-sm" id="hero-members-counter">
          <div className="flex -space-x-2" id="avatars-overlap-row">
            <img className="w-6 h-6 rounded-full border border-white shadow-sm" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80" alt="avatar" referrerPolicy="no-referrer" />
            <img className="w-6 h-6 rounded-full border border-white shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80" alt="avatar" referrerPolicy="no-referrer" />
            <img className="w-6 h-6 rounded-full border border-white shadow-sm" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=80" alt="avatar" referrerPolicy="no-referrer" />
            <img className="w-6 h-6 rounded-full border border-white shadow-sm" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80" alt="avatar" referrerPolicy="no-referrer" />
          </div>
          <span className="text-[11px] font-mono text-stone-500 whitespace-nowrap" id="members-text">
            <strong className="text-stone-800 font-bold">55k members</strong> already waiting for you
          </span>
        </div>

        {/* Big Displays Title */}
        <h1 className="text-4xl md:text-6xl font-serif text-center font-normal text-stone-900 leading-[1.12] tracking-tight mb-4 max-w-5xl" id="hero-heading">
          A Decentralized Future Powered By Communal Prosperity.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-stone-500 font-sans text-sm md:text-base text-center mb-12 max-w-2xl" id="hero-subtitle">
          Join the community, collaborate, exchange skills, and own your future
        </p>

        {/* Floating Collage Showcase Cards */}
        <div className="relative w-full max-w-4xl h-[480px] md:h-[520px] bg-sky-50/20 rounded-3xl overflow-visible border border-stone-100 p-6 flex items-center justify-center" id="hero-collage">
          {/* Main Central Card (Damilola O.) */}
          <div className="relative z-20 w-80 h-[400px] bg-white rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden flex flex-col group p-3 text-left" id="card-central">
            <img 
              className="w-full h-[310px] object-cover rounded-xl" 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600" 
              alt="Damilola O." 
              referrerPolicy="no-referrer"
              id="central-image"
            />
            <div className="mt-3 px-1 flex flex-col" id="central-details">
              <span className="font-serif font-bold text-lg text-stone-900" id="central-name">Damilola O.</span>
              <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5" id="central-description">
                <span>📱</span> Mobile App Developer
              </span>
            </div>
          </div>

          {/* Floating Card 1: Top Left (Hello Afolabi👋 - Deposit) */}
          <div className="absolute top-6 left-1/4 -start-4 md:left-4 z-30 bg-white/95 border border-amber-100 shadow-lg px-4 py-3.5 rounded-2xl w-72 text-left backdrop-blur-sm hover:scale-[1.02] transition" id="float-card-1">
            <div className="flex items-center gap-2 mb-1.5" id="float-1-header">
              <span className="font-semibold text-xs text-stone-800" id="hello-afolabi-title">Hello Afolabi</span>
              <span>👋</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-2" id="float-1-body">
              20k NaiToken has just been deposited in your NaiWallet
            </p>
            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono" id="float-1-footer">
              <span className="text-emerald-500 font-bold" id="dot-indicator">●</span>
              <span>1.5% token value</span>
            </div>
          </div>

          {/* Floating Card 2: Top Right (Favour John 👩 - Collaborate Request) */}
          <div className="absolute top-12 right-1/4 -end-4 md:right-4 z-30 bg-white/95 border border-stone-200/60 shadow-lg p-4 rounded-2xl w-64 text-left backdrop-blur-sm hover:scale-[1.02] transition animate-bounce-slow" id="float-card-2">
            <div className="flex items-center gap-2 mb-2" id="float-2-header">
              <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120" alt="Favour" referrerPolicy="no-referrer" />
              <div className="flex flex-col" id="float-2-meta">
                <span className="font-semibold text-xs text-stone-900" id="float-2-name">Favour John</span>
                <span className="text-[9px] text-stone-400 font-mono" id="float-2-role">UIUX Designer</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 mb-2" id="float-2-body">I will like to collaborate with you</p>
            <div className="flex items-center gap-1.5" id="float-2-actions">
              <button 
                onClick={onSignUpClick} 
                className="bg-amber-100 hover:bg-amber-200 text-[#ea580c] font-semibold text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition whitespace-nowrap"
                id="btn-accept-float"
              >
                Accept collaboration
              </button>
              <button className="text-stone-400 hover:text-stone-600 font-medium text-[10px] px-1 py-1 whitespace-nowrap" id="btn-decline-float">Decline</button>
            </div>
          </div>

          {/* Floating Card 3: Bottom Left (NFT Community) */}
          <div className="absolute bottom-6 left-1/4 -start-8 md:left-8 z-30 bg-white/95 border border-stone-200 shadow-md p-4 rounded-2xl w-72 text-left backdrop-blur-sm" id="float-card-3">
            <div className="flex items-center gap-2 mb-2" id="float-3-header">
              <span className="p-1 bg-emerald-50 rounded-md text-emerald-600">🟢</span>
              <span className="font-semibold text-xs text-stone-900" id="float-3-title">NFT Community</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-1.5" id="float-3-body">
              22K Comment on your recent post in the community
            </p>
            <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono border-t border-stone-50 pt-2" id="float-3-footer">
              <span className="flex items-center gap-1" id="float-3-collab-cnt">
                <span className="text-stone-700 font-bold" id="num-3">3</span> Collaborations
              </span>
              <span className="flex items-center gap-1 text-purple-600" id="float-3-tag">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span> Open to collaboration
              </span>
            </div>
          </div>

          {/* Floating Card 4: Bottom Right (First Contribution) */}
          <div className="absolute bottom-12 right-1/4 -end-8 md:right-8 z-30 bg-white/95 border border-stone-100 shadow-md p-4 rounded-2xl w-64 text-left" id="float-card-4">
            <div className="flex items-center gap-2 mb-2" id="float-4-header">
              <span className="text-stone-500">💼</span>
              <span className="font-semibold text-xs text-stone-900" id="float-4-title">First Contribution</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-3" id="float-4-body">Shipped Mobile feature to production</p>
            <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono" id="float-4-footer">
              <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-sans text-[9px]" id="float-4-tech">Flutter</span>
              <span className="flex items-center gap-1" id="float-4-collab">👥 2 Collaborators</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE COLLABORATION FEED SECTION */}
      <section className="py-[100px] px-6 md:px-12 bg-white" id="live-collaboration-row">
        <div className="max-w-[1384px] mx-auto flex flex-col items-center gap-[50px]" id="live-collab-grid">
          
          {/* Group 9: Holds the cards layout and the burgundy panel background securely with absolute metrics */}
          <div className="relative w-full h-auto md:h-[623px]" id="group-9-wrapper">
            
            {/* Rectangle 3: Burgundy Solid Background Underlay Box (top: 327px, height: 296px) */}
            <div 
              className="absolute inset-x-0 top-[327px] h-[296px] bg-[#3B0A0F] rounded-[20px] z-0 shadow-lg hidden md:block" 
              id="burgundy-bg-panel"
            />
            
            {/* Frame 1618875532: Header + Cards Container (top: 100px, height: 446px, left centered) */}
            <div 
              className="relative md:absolute md:top-[100px] md:h-[446px] w-full max-w-[1212px] md:left-1/2 md:-translate-x-1/2 flex flex-col md:items-end gap-[16px] z-10" 
              id="frame-1618875532"
            >
              
              {/* Frame 1618875533: Top Header Row with Title Badge and Serif Statement */}
              <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:h-[90px]" id="brand-badge-box">
                <div className="shrink-0 select-none pb-1 md:pb-0" id="live-collab-text-wrapper">
                  <div className="w-[203px] h-[30px] border border-dashed border-[#BEBEBE] rounded-[4px] flex items-center justify-center p-[4px_6px] select-none bg-white" id="live-collab-text">
                    <span className="font-sans font-normal text-[14px] leading-[22px] tracking-[0.003em] text-[#100F0F] text-center uppercase whitespace-nowrap">
                      LIVE COLLABORATION FEED
                    </span>
                  </div>
                </div>
                <div className="max-w-[598px] w-full text-left md:text-right" id="collab-desc-box">
                  <p className="text-[#797575] text-[24px] font-serif leading-[30px] tracking-[-0.0025em]" id="collab-p">
                    Meet and have global refined interaction on a social blockchain based virtual reality platform where boundaries and consent are respected
                  </p>
                </div>
              </div>

              {/* 1200 Frame: Cards Row Layered over the burgundy panel (flex-start aligned) */}
              <div 
                className="w-full max-w-[1182px] mx-auto flex flex-col md:flex-row items-center md:items-start justify-center p-2 gap-[20px] md:h-[340px] md:overflow-visible overflow-x-auto snap-x snap-mandatory relative" 
                id="live-cards-flow-grid"
              >
                {/* Burgundy background underlay for mobile layout */}
                <div className="absolute inset-x-0 top-[120px] bottom-0 bg-[#3B0A0F] rounded-[20px] -z-10 md:hidden" />

                {collabFeeds.map((u) => {
                  let cardClass = "";
                  let avatarBg = "#ECF4FD";
                  let IconComponent = Smartphone;
                  let bgHex = "#f97316"; // Orange

                  if (u.id === 1) {
                    cardClass = "w-[220px] h-[280px] p-4 flex flex-col items-center justify-between text-center bg-[#FEFEFE] border border-[rgba(219,219,219,0.6)] rounded-[16px] shadow-sm shrink-0 snap-center";
                    avatarBg = "#ECF4FD";
                    IconComponent = Smartphone;
                    bgHex = "#f97316";
                  } else if (u.id === 2) {
                    cardClass = "w-[220px] h-[304px] pt-12 pb-4 px-4 flex flex-col items-center justify-between text-center bg-[#FEFEFE] border border-[rgba(219,219,219,0.6)] rounded-[16px] shadow-sm shrink-0 snap-center";
                    avatarBg = "#F6EAFB";
                    IconComponent = Users;
                    bgHex = "#ec4899";
                  } else if (u.id === 3) {
                    cardClass = "w-[220px] h-[280px] pt-6 pb-4 px-4 flex flex-col items-center justify-between text-center bg-[#FEFEFE] border border-[rgba(219,219,219,0.6)] rounded-[16px] shadow-sm shrink-0 snap-center";
                    avatarBg = "#E5FBE8";
                    IconComponent = Cpu;
                    bgHex = "#2563eb";
                  } else if (u.id === 4) {
                    cardClass = "w-[220px] h-[272px] p-4 flex flex-col items-center justify-between text-center bg-[#FBFBFB] border border-[rgba(219,219,219,0.6)] rounded-[16px] shadow-sm shrink-0 snap-center";
                    avatarBg = "#FEF0E8";
                    IconComponent = Layers;
                    bgHex = "#ef4444";
                  } else if (u.id === 5) {
                    cardClass = "w-[220px] h-[324px] pt-16 pb-4 px-4 flex flex-col items-center justify-between text-center bg-[#FEFEFE] border border-[rgba(219,219,219,0.6)] rounded-[16px] shadow-sm shrink-0 snap-center";
                    avatarBg = "#FDE6F5";
                    IconComponent = CheckSquare;
                    bgHex = "#a855f7";
                  }

                  return (
                    <div 
                      key={u.id} 
                      className={`${cardClass} transition hover:shadow-lg hover:scale-[1.03] duration-300 md:mb-0 mb-6`} 
                      id={`user-card-${u.id}`}
                    >
                      {/* Image & Name+Role */}
                      <div className="flex flex-col items-center gap-4 w-full" id={`card-top-${u.id}`}>
                        {/* Circular Avatar Placeholder wrapper */}
                        <div 
                          className="relative w-[128px] h-[128px] rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm" 
                          style={{ backgroundColor: avatarBg }} 
                          id={`avatar-frame-${u.id}`}
                        >
                          <img 
                            className="w-full h-full object-cover select-none" 
                            src={u.avatar} 
                            alt={u.name} 
                            referrerPolicy="no-referrer" 
                            id={`user-avatar-${u.id}`} 
                          />
                        </div>
                        
                        {/* Name + Role Column */}
                        <div className="flex flex-col items-center gap-1 w-full" id={`name-role-col-${u.id}`}>
                          <h3 className="font-sans font-semibold text-[#0D0C0C] text-[16px] leading-[24px] text-center" id={`user-name-${u.id}`}>
                            {u.name}
                          </h3>
                          <p className="font-sans font-normal text-[#797575] text-[12px] leading-[16px] text-center" id={`user-role-${u.id}`}>
                            {u.role}
                          </p>
                        </div>
                      </div>
                      
                      {/* Collab Metric & Status Footer */}
                      <div className="flex flex-col items-center gap-1 w-full" id={`collab-status-col-${u.id}`}>
                        {/* Collaboration icon + metric */}
                        <div className="flex items-center justify-center gap-1.5" id={`user-projects-count-${u.id}`}>
                          <IconComponent className="w-4 h-4 text-[#4C4949] shrink-0" />
                          <span className="font-sans font-semibold text-[12px] leading-[16px] text-[#4C4949] whitespace-nowrap">
                            {u.projects}
                          </span>
                        </div>
                        
                        {/* Sub-status text with custom bullet indicator */}
                        <div className="inline-flex items-center justify-center gap-[10px]" id={`user-badge-wrap-${u.id}`}>
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: bgHex }}
                            id={`user-dot-${u.id}`}
                          />
                          <span className="font-sans font-normal text-[12px] leading-[16px] tracking-[0.04em] text-[#6A6666] uppercase whitespace-nowrap" id={`user-badge-${u.id}`}>
                            {u.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Underlay Footer Navigation Buttons - CTAs */}
          <div className="relative z-20 flex flex-col sm:flex-row justify-center items-center gap-[40px] w-full max-w-[453px] h-auto md:mt-0 mt-[40px]" id="home-action-buttons">
            <button 
              onClick={onSignUpClick}
              className="w-full sm:w-[203px] h-[60px] bg-[#100F0F] hover:bg-stone-900 text-[#FDFDFD] font-sans font-semibold text-[18px] leading-[28px] rounded-[40px] cursor-pointer transition flex items-center justify-center px-8 py-4 select-none active:scale-95 shadow whitespace-nowrap"
              id="join-community-cta"
            >
              Join Community
            </button>
            <button 
              onClick={onExploreSkillsClick}
              className="w-full sm:w-[210px] h-[60px] bg-white border border-[#100F0F] hover:bg-stone-50 text-[#100F0F] font-sans font-normal text-[18px] leading-[28px] rounded-[40px] cursor-pointer transition flex items-center justify-center px-8 py-4 select-none active:scale-95 shadow-sm whitespace-nowrap"
              id="learn-more-cta"
            >
              Learn More
            </button>
          </div>

        </div>
      </section>

      {/* SKILLS EXPLORER LIST */}
      <section className="py-24 px-4 sm:px-6 bg-white border-t border-stone-100 flex justify-center items-center overflow-hidden" id="skills-explorer-section">
        {/* Frame 1618875579 */}
        <div 
          className="relative w-full text-left flex flex-col md:flex-row items-center justify-between"
          style={{
            maxWidth: '1440px',
            paddingLeft: 'var(--skills-padding-l, 197px)',
            paddingRight: 'var(--skills-padding-r, 197px)',
            gap: '70px',
          }}
          id="skills-frame-1618875579"
        >
          {/* Custom style values dynamically configured via responsive CSS variables to prevent layout squeezing */}
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1400px) {
              #skills-frame-1618875579 {
                --skills-padding-l: 197px;
                --skills-padding-r: 197px;
                --title-font-size: 40px;
                --title-line-height: 48px;
                --badge-width: 110px;
                --badge-height: 48px;
                --badge-font-size: 22px;
                --badge-line-height: 30px;
                --skills-gap-1: 98px;
                --skills-gap-2: 65px;
                --skills-gap-3: 96px;
                --pill-font-size: 16px;
                --pill-line-height: 22px;
              }
            }
            @media (min-width: 1200px) and (max-width: 1399px) {
              #skills-frame-1618875579 {
                --skills-padding-l: 100px;
                --skills-padding-r: 100px;
                --title-font-size: 34px;
                --title-line-height: 42px;
                --badge-width: 100px;
                --badge-height: 42px;
                --badge-font-size: 18px;
                --badge-line-height: 24px;
                --skills-gap-1: 65px;
                --skills-gap-2: 45px;
                --skills-gap-3: 63px;
                --pill-font-size: 15px;
                --pill-line-height: 20px;
              }
            }
            @media (min-width: 1024px) and (max-width: 1199px) {
              #skills-frame-1618875579 {
                --skills-padding-l: 40px;
                --skills-padding-r: 40px;
                --title-font-size: 30px;
                --title-line-height: 36px;
                --badge-width: 90px;
                --badge-height: 38px;
                --badge-font-size: 16px;
                --badge-line-height: 22px;
                --skills-gap-1: 40px;
                --skills-gap-2: 30px;
                --skills-gap-3: 38px;
                --pill-font-size: 14px;
                --pill-line-height: 18px;
              }
            }
            @media (max-width: 1023px) {
              #skills-frame-1618875579 {
                --skills-padding-l: 16px;
                --skills-padding-r: 16px;
                --title-font-size: 24px;
                --title-line-height: 30px;
                --badge-width: 80px;
                --badge-height: 34px;
                --badge-font-size: 14px;
                --badge-line-height: 18px;
                --skills-gap-1: 16px;
                --skills-gap-2: 12px;
                --skills-gap-3: 16px;
                --pill-font-size: 13px;
                --pill-line-height: 18px;
              }
            }
          `}} />

          {/* Frame 1618875577 */}
          <div 
            className="flex flex-col items-start w-full"
            style={{
              maxWidth: '960px',
              gap: '100px'
            }}
            id="skills-frame-1618875577"
          >
            {/* Frame 1618875555 */}
            <div 
              className="flex flex-col items-start w-full"
              style={{
                maxWidth: '871px',
                gap: '16px'
              }}
              id="skills-frame-1618875555"
            >
              {/* Frame 1618875554 */}
              <div 
                className="flex flex-wrap md:flex-row items-center w-full"
                style={{
                  maxWidth: '100%',
                  gap: '16px'
                }}
                id="skills-frame-1618875554"
              >
                {/* Growing, Exchanging of Thousands */}
                <span 
                  className="text-stone-900"
                  style={{
                    fontFamily: '"Lora", "Playfair Display", Georgia, serif',
                    fontWeight: 400,
                    fontSize: 'var(--title-font-size, 48px)',
                    lineHeight: 'var(--title-line-height, 56px)',
                    letterSpacing: '-0.005em',
                    color: '#0D0C0C'
                  }}
                  id="growing-exchanging-of-thousands-text"
                >
                  Growing, Exchanging of Thousands
                </span>

                {/* Frame 1618875553 (Skills Badge) */}
                <div 
                  className="flex flex-row justify-center items-center shadow-sm select-none"
                  style={{
                    boxSizing: 'border-box',
                    padding: '10px',
                    gap: '10px',
                    width: 'var(--badge-width, 151px)',
                    height: 'var(--badge-height, 64px)',
                    border: '1px solid #000000',
                    borderRadius: '50px'
                  }}
                  id="skills-frame-1618875553"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", "Playfair Display", Georgia, serif',
                      fontWeight: 600,
                      fontSize: 'var(--badge-font-size, 36px)',
                      lineHeight: 'var(--badge-line-height, 44px)',
                      letterSpacing: '-0.005em',
                      color: '#100F0F'
                    }}
                    id="skills-inner-badge-text"
                  >
                    Skills
                  </span>
                </div>
              </div>

              {/* Frame 1618875579 (Search / Text Input Wrapper Row) */}
              <div 
                className="flex flex-row items-center justify-between w-full"
                style={{
                  maxWidth: '871px',
                  height: '48px',
                  gap: '50px'
                }}
                id="skills-frame-inner-1618875579"
              >
                {/* Text Input */}
                <div 
                  className="flex flex-col items-start w-full relative"
                  style={{
                    maxWidth: '797px',
                    height: '48px'
                  }}
                  id="text-input-wrapper-container"
                >
                  {/* Label Container is Display: none */}

                  {/* Text Container */}
                  <div 
                    className="flex flex-row items-center w-full bg-white transition-all cursor-text focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200"
                    style={{
                      boxSizing: 'border-box',
                      padding: '11px 16px',
                      gap: '8px',
                      width: '100%',
                      height: '48px',
                      border: '1px solid #D7D7D7',
                      borderRadius: '8px'
                    }}
                    id="text-container-input-frame"
                  >
                    {/* Input Frame */}
                    <div 
                      className="flex flex-row items-center w-full"
                      style={{
                        height: '22px',
                        gap: '10px'
                      }}
                      id="input-holder-frame"
                    >
                      <input 
                        type="text"
                        placeholder="Enter Skills"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 placeholder-stone-400"
                        style={{
                          fontFamily: "'Public Sans', Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '22px',
                          letterSpacing: '0.003em',
                          color: '#222222',
                        }}
                        id="skills-search-input"
                      />
                      {skillSearch && (
                        <button 
                          onClick={() => setSkillSearch('')}
                          className="text-stone-400 hover:text-stone-700 text-xs px-1 cursor-pointer"
                          id="clear-skill-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* MagnifyingGlass button outside input box at the right */}
                <button 
                  onClick={onExploreSkillsClick}
                  className="flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer whitespace-nowrap"
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                  id="btn-skills-search-magnifier"
                >
                  <Search className="w-5 h-5 text-[#141414]" />
                </button>
              </div>
            </div>

            {/* Frame 1618875576 (Skills Grids rows segment) */}
            <div 
              className="flex flex-col items-start w-full overflow-x-auto scrollbar-none"
              style={{
                maxWidth: '960px',
                gap: '50px'
              }}
              id="skills-frame-1618875576"
            >
              {/* Row 1: Frame 1618875573 */}
              <div 
                className="flex flex-row items-center w-max md:w-full transition-all duration-300"
                style={{
                  height: '52.01px',
                  gap: 'var(--skills-gap-1, 98px)',
                  opacity: activeScrollRow === 0 ? 1 : 0.55,
                }}
                onMouseEnter={() => setActiveScrollRow(0)}
                id="skills-row-1618875573"
              >
                {/* Technical */}
                <div 
                  onClick={() => toggleSkillRef('Technical')}
                  className={`flex items-center justify-center border hover:border-stone-900 transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Technical') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'technical' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '137px',
                    height: '52.01px',
                    borderColor: 'rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-technical-1"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#797575'
                    }}
                  >
                    Technical
                  </span>
                </div>

                {/* Data Analyst (Dark) */}
                <div 
                  onClick={() => toggleSkillRef('Data Analyst')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Data Analyst') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'data analyst' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '169px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-dataanalyst-1"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    Data Analyst
                  </span>
                </div>

                {/* Editor */}
                <div 
                  onClick={() => toggleSkillRef('Editor')}
                  className={`flex items-center justify-center border hover:border-stone-900 transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Editor') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'editor' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '100px',
                    height: '52.01px',
                    borderColor: 'rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-editor"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#797575'
                    }}
                  >
                    Editor
                  </span>
                </div>

                {/* Web Designer (Dark) */}
                <div 
                  onClick={() => toggleSkillRef('Web Designer')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Web Designer') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'web designer' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '186px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-webdesigner"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    Web Designer
                  </span>
                </div>
              </div>

              {/* Row 2: Frame 1618875574 */}
              <div 
                className="flex flex-row items-center w-max md:w-full transition-all duration-300"
                style={{
                  height: '52.01px',
                  gap: 'var(--skills-gap-2, 65px)',
                  opacity: activeScrollRow === 1 ? 1 : 0.55,
                }}
                onMouseEnter={() => setActiveScrollRow(1)}
                id="skills-row-1618875574"
              >
                {/* Programmer (Dark) */}
                <div 
                  onClick={() => toggleSkillRef('Programmer')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Programmer') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'programmer' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '171px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-programmer"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    Programmer
                  </span>
                </div>

                {/* Data Analyst (Dark) - 2nd slot */}
                <div 
                  onClick={() => toggleSkillRef('Data Analyst')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Data Analyst') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'data analyst' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '169px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-dataanalyst-2"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    Data Analyst
                  </span>
                </div>

                {/* Technical (2nd slot) */}
                <div 
                  onClick={() => toggleSkillRef('Technical')}
                  className={`flex items-center justify-center border hover:border-stone-900 transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Technical') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'technical' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '186px',
                    height: '52px',
                    borderColor: 'rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-technical-2"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#797575'
                    }}
                  >
                    Technical
                  </span>
                </div>

                {/* UX Designer (Dark) */}
                <div 
                  onClick={() => toggleSkillRef('UX Designer')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('UX Designer') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'ux designer' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '170px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-uxdesigner"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    UX Designer
                  </span>
                </div>
              </div>

              {/* Row 3: Frame 1618875575 */}
              <div 
                className="flex flex-row items-center w-max md:w-full transition-all duration-300"
                style={{
                  height: '52.01px',
                  gap: 'var(--skills-gap-3, 96px)',
                  opacity: activeScrollRow === 2 ? 1 : 0.55,
                }}
                onMouseEnter={() => setActiveScrollRow(2)}
                id="skills-row-1618875575"
              >
                {/* Empty / Styled Frame 1618875571 */}
                <div 
                  className="rounded-[9px] cursor-not-allowed select-none transition-all"
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '137px',
                    height: '52.01px',
                    background: 'rgba(219, 219, 219, 0.3)',
                    border: '1px solid rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-empty"
                />

                {/* Technical (3rd slot) */}
                <div 
                  onClick={() => toggleSkillRef('Technical')}
                  className={`flex items-center justify-center border hover:border-stone-900 transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Technical') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'technical' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '137px',
                    height: '52.01px',
                    borderColor: 'rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-technical-3"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#797575'
                    }}
                  >
                    Technical
                  </span>
                </div>

                {/* Copy Writer (Dark) */}
                <div 
                  onClick={() => toggleSkillRef('Copy Writer')}
                  className={`flex items-center justify-center border transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('Copy Writer') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'copy writer' ? 'ring-2 ring-amber-300' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '171px',
                    height: '52.01px',
                    background: '#0D0C0C',
                    borderColor: '#888383',
                  }}
                  id="skill-pill-copywriter"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#FAFAFA'
                    }}
                  >
                    Copy Writer
                  </span>
                </div>

                {/* UI Designer */}
                <div 
                  onClick={() => toggleSkillRef('UI Designer')}
                  className={`flex items-center justify-center border hover:border-stone-900 transition-all cursor-pointer select-none rounded-[9px]
                    ${!isPillMatched('UI Designer') ? 'opacity-25 scale-95' : 'opacity-100 scale-100'} ${skillSearch.toLowerCase() === 'ui designer' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                  style={{
                    boxSizing: 'border-box',
                    padding: '15px',
                    gap: '15px',
                    width: '162px',
                    height: '52.01px',
                    borderColor: 'rgba(219, 219, 219, 0.6)',
                  }}
                  id="skill-pill-uidesigner"
                >
                  <span 
                    style={{
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: 'var(--pill-font-size, 16px)',
                      lineHeight: 'var(--pill-line-height, 22px)',
                      letterSpacing: '-0.0025em',
                      color: '#797575'
                    }}
                  >
                    UI Designer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Frame 571 (The Custom Scrollbar on the right side) - Visible on medium and larger displays */}
          <div 
            className="hidden md:flex flex-row items-center select-none"
            style={{
              padding: '80px 0px 0px',
              gap: '10px',
              width: '18px',
              height: '409px'
            }}
            id="skills-frame-571"
          >
            {/* Scrollbar — Custom */}
            <div 
              className="relative bg-[#E8E8E8] rounded-[100px] shadow-inner cursor-pointer"
              style={{
                width: '8px',
                height: '329px'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const ratio = clickY / rect.height;
                if (ratio < 0.33) {
                  setActiveScrollRow(0);
                } else if (ratio < 0.66) {
                  setActiveScrollRow(1);
                } else {
                  setActiveScrollRow(2);
                }
              }}
              id="scrollbar-custom-track"
            >
              {/* Bar */}
              <div 
                className="absolute bg-[#7A7A7A] rounded-[100px]"
                style={{
                  width: '8px',
                  height: '33px',
                  left: 'calc(50% - 8px/2)',
                  top: '0px',
                  transform: `translateY(${activeScrollRow === 0 ? 0 : activeScrollRow === 1 ? 148 : 296}px)`,
                  transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                id="scrollbar-bar-element"
              />
            </div>
          </div>

        </div>
      </section>

      {/* WEB3 COMMUNITY GRADIENT SECTION */}
      <section className="relative w-full bg-[#0E0907] flex justify-center items-center overflow-hidden py-10" id="web3-community-figma-section">
        {/* Style block to ensure responsiveness and exact layout properties */}
        <style dangerouslySetInnerHTML={{__html: `
          #community-parent-box {
            isolation: isolate;
          }
          @media (max-width: 1439px) {
            #community-outer-scroll {
              overflow-x: auto;
              scrollbar-width: none; /* Firefox */
            }
            #community-outer-scroll::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          }
        `}} />

        {/* Outer scrolling container for responsive mobile swiping */}
        <div className="w-full max-w-full" id="community-outer-scroll">
          
          {/* Frame 574 - Self Container */}
          <div 
            className="relative mx-auto shrink-0 select-none overflow-hidden"
            style={{
              width: '1440px',
              height: '964px',
              background: 'linear-gradient(89.68deg, #0E0907 2.5%, #AA0F20 99.72%)',
            }}
            id="community-parent-box"
          >
            {/* Ellipse 4 - Glowing golden background orb */}
            <div 
              style={{
                position: 'absolute',
                width: '606px',
                height: '606px',
                left: '-192px',
                top: '386px',
                borderRadius: '50%',
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(234, 179, 0, 0.45) 56.24%, #301405 100%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
                zIndex: 1
              }}
              id="ellipse-glow-4"
            />

            {/* Ellipse 5 - Glowing golden background orb */}
            <div 
              style={{
                position: 'absolute',
                width: '878px',
                height: '875px',
                left: '518px',
                top: '-229px',
                borderRadius: '50%',
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(234, 179, 0, 0.45) 56.24%, #301405 100%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
                zIndex: 1
              }}
              id="ellipse-glow-5"
            />

            {/* Frame 617 - Auto Layout holding Content */}
            <div 
              className="absolute flex flex-col items-start"
              style={{
                width: '1440px',
                height: '856px',
                left: '0px',
                top: '100px',
                gap: '50px',
                zIndex: 10
              }}
              id="community-frame-617"
            >
              
              {/* Frame 561 - Text banner and Button action row */}
              <div 
                className="flex flex-row items-start shrink-0"
                style={{
                  width: '1440px',
                  height: '202px',
                  padding: '0px 0px 0px 124px',
                  gap: '171px'
                }}
                id="community-frame-561"
              >
                
                {/* Frame 560 - Info Content */}
                <div 
                  className="flex flex-col items-start text-left shrink-0"
                  style={{
                    width: '832px',
                    height: '202px',
                    gap: '30px'
                  }}
                  id="community-frame-560"
                >
                  {/* Heading Title */}
                  <h2 
                    style={{
                      width: '754px',
                      height: '112px',
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: '48px',
                      lineHeight: '56px',
                      letterSpacing: '-0.005em',
                      color: '#FDFDFD'
                    }}
                    id="community-title-heading"
                  >
                    Create Your Web3 Experience Community
                  </h2>

                  {/* Deep description */}
                  <p 
                    style={{
                      width: '832px',
                      height: '60px',
                      fontFamily: '"Lora", Georgia, serif',
                      fontWeight: 400,
                      fontSize: '24px',
                      lineHeight: '30px',
                      letterSpacing: '-0.0025em',
                      color: '#FDFDFD',
                      opacity: 0.95
                    }}
                    id="community-desc-para"
                  >
                    Creates space for people to build real experience, trade skills, collaborate on project and earn NaiPoint through honest collaboration
                  </p>
                </div>

                {/* Yellow black action pill Button */}
                <button 
                  onClick={onSignUpClick}
                  className="shrink-0 transition-all duration-300 hover:brightness-105 active:scale-95 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 cursor-pointer whitespace-nowrap"
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px 24px',
                    gap: '16px',
                    width: '193px',
                    height: '48px',
                    background: '#FFC107',
                    border: '1px solid #100F0F',
                    borderRadius: '40px'
                  }}
                  id="community-btn-join"
                >
                  <span 
                    style={{
                      fontFamily: '"Public Sans", Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0.002em',
                      color: '#100F0F',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                    id="community-btn-text"
                  >
                    Create Community
                  </span>
                </button>

              </div>

              {/* Image gallery box container - F1F1F1 background */}
              <div 
                className="shrink-0 relative"
                style={{
                  width: '1440px',
                  height: '604px',
                  background: '#F1F1F1'
                }}
                id="community-image-gallery"
              >
                
                {/* Frame 14419 - Top Row containing 3 image columns */}
                <div 
                  className="absolute flex flex-row items-start"
                  style={{
                    width: '723px',
                    height: '224px',
                    left: '0px',
                    top: '0px',
                    padding: '0px'
                  }}
                  id="gallery-frame-14419"
                >
                  {/* Frame 14411 */}
                  <div 
                    style={{
                      width: '243px',
                      height: '224px',
                      backgroundImage: 'url("https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=400")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRight: '1.5px solid #F1F1F1',
                      borderBottom: '1.5px solid #F1F1F1'
                    }}
                    id="gallery-frame-14411"
                  />
                  {/* Frame 14412 */}
                  <div 
                    style={{
                      width: '240px',
                      height: '224px',
                      backgroundImage: 'url("https://images.unsplash.com/photo-1531535934208-95d4eb87557c?auto=format&fit=crop&q=80&w=400")',
                      backgroundColor: '#B88888',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRight: '1.5px solid #F1F1F1',
                      borderBottom: '1.5px solid #F1F1F1'
                    }}
                    id="gallery-frame-14412"
                  />
                  {/* Frame 14417 */}
                  <div 
                    style={{
                      width: '240px',
                      height: '224px',
                      backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRight: '1.5px solid #F1F1F1',
                      borderBottom: '1.5px solid #F1F1F1'
                    }}
                    id="gallery-frame-14417"
                  />
                </div>

                {/* Frame 14413 (First occurrence) - Middle span background overlay block */}
                <div 
                  className="absolute"
                  style={{
                    left: '0px',
                    right: '0px',
                    top: '224px',
                    bottom: '224px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800")',
                    backgroundColor: '#B88888',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 40%',
                    borderBottom: '1.5px solid #F1F1F1'
                  }}
                  id="gallery-frame-14413-primary"
                />

                {/* Frame 14413 (Second occurrence) - Flipped bottom-left overlay */}
                <div 
                  className="absolute"
                  style={{
                    left: '0px',
                    right: '479px',
                    top: '380px',
                    bottom: '0px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'matrix(1, 0, 0, -1, 0, 0)',
                    borderRight: '1.5px solid #F1F1F1'
                  }}
                  id="gallery-frame-14413-scnd"
                />

                {/* Frame 14413 (Third occurrence) - Top right flipped span */}
                <div 
                  className="absolute"
                  style={{
                    left: '243px',
                    right: '0px',
                    top: '0px',
                    bottom: '380px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800")',
                    backgroundColor: '#FEDCDC',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'matrix(1, 0, 0, -1, 0, 0)',
                    borderLeft: '1.5px solid #F1F1F1'
                  }}
                  id="gallery-frame-14413-third"
                />

                {/* Frame 14414 - Mid-bottom span */}
                <div 
                  className="absolute"
                  style={{
                    left: '243px',
                    right: '0px',
                    top: '448px',
                    bottom: '0px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800")',
                    backgroundColor: '#8B6F6F',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderLeft: '1.5px solid #F1F1F1'
                  }}
                  id="gallery-frame-14414"
                />

                {/* Frame 14415 - Flipped overlapping rectangle in bottom right */}
                <div 
                  className="absolute"
                  style={{
                    left: '482px',
                    right: '0px',
                    top: '380px',
                    bottom: '156px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600")',
                    backgroundColor: '#9F4343',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'matrix(1, 0, 0, -1, 0, 0)'
                  }}
                  id="gallery-frame-14415"
                />

                {/* Frame 14416 - Flipped extreme bottom-right strip */}
                <div 
                  className="absolute"
                  style={{
                    left: '482px',
                    right: '0px',
                    top: '529px',
                    bottom: '0px',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1581291518655-9523c932dedf?auto=format&fit=crop&q=80&w=600")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'matrix(1, 0, 0, -1, 0, 0)'
                  }}
                  id="gallery-frame-14416"
                />

                {/* Heart 3 placeholder with absolute coordinates (hidden as requested) */}
                <div 
                  style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    width: '164px',
                    height: '142.29px',
                    left: '38px',
                    top: '41px',
                    background: '#FFFFFF'
                  }}
                  id="gallery-heart-3"
                />

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* GET STARTED WALLET 3 EASY STEPS SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white" id="wallet-three-steps-section">
        <div className="max-w-7xl mx-auto" id="wallet-three-container">
          
          <div className="text-left mb-16" id="wallet-three-header">
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4 max-w-2xl leading-snug" id="wallet-h2">
              Get started with Web3 wallet in 3 easy steps
            </h2>
            <p className="text-stone-400 text-sm max-w-3xl leading-relaxed" id="wallet-p">
              As we push the boundaries of this new financial frontier, staying informed and adopting robust asset management practices is the best way to turn market volatility into opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" id="wallet-steps-flex">
            
            {/* Left Steps List cards */}
            <div className="flex flex-col gap-4 text-left" id="wallet-steps-cards">
              
              <div 
                onClick={() => setActiveStep(1)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex gap-5 items-center
                  ${activeStep === 1 ? 'border-amber-400' : 'border-stone-100 hover:border-stone-200'}`}
                id="step-card-1"
                style={{
                  background: activeStep === 1 ? 'rgba(219, 219, 219, 0.2)' : '#FFFFFF',
                  boxShadow: activeStep === 1 ? '0px 0px 4px rgba(140, 140, 140, 0.5)' : 'none',
                  borderRadius: '20px'
                }}
              >
                {/* Ellipse 6 */}
                <div 
                  className="w-[52.84px] h-[52.84px] shrink-0 border-[1.3209px] rounded-full flex items-center justify-center font-serif text-[#FFC107]"
                  style={{
                    borderColor: '#FFC107',
                    fontSize: '36px',
                    lineHeight: '44px'
                  }}
                  id="step-number-1"
                >
                  1
                </div>
                <div id="step-desc-1">
                  <h3 
                    style={{
                      fontFamily: 'Lora',
                      fontSize: '30px',
                      lineHeight: '38px',
                      color: '#100F0F'
                    }}
                    className="font-serif font-normal"
                    id="step-title-1"
                  >
                    Create your account
                  </h3>
                  <p 
                    style={{
                      fontFamily: '"Public Sans", Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#797575'
                    }}
                    className="mt-1 font-normal"
                    id="step-text-1"
                  >
                    Start with creating your account
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setActiveStep(2)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex gap-5 items-center
                  ${activeStep === 2 ? 'border-amber-400' : 'border-stone-100 hover:border-stone-200'}`}
                id="step-card-2"
                style={{
                  background: activeStep === 2 ? 'rgba(219, 219, 219, 0.2)' : '#FFFFFF',
                  boxShadow: activeStep === 2 ? '0px 0px 4px rgba(140, 140, 140, 0.5)' : 'none',
                  borderRadius: '20px'
                }}
              >
                {/* Ellipse 6 */}
                <div 
                  className="w-[52.84px] h-[52.84px] shrink-0 border-[1.3209px] rounded-full flex items-center justify-center font-serif text-[#FFC107]"
                  style={{
                    borderColor: '#FFC107',
                    fontSize: '36px',
                    lineHeight: '44px'
                  }}
                  id="step-number-2"
                >
                  2
                </div>
                <div id="step-desc-2">
                  <h3 
                    style={{
                      fontFamily: 'Lora',
                      fontSize: '30px',
                      lineHeight: '38px',
                      color: '#100F0F'
                    }}
                    className="font-serif font-normal"
                    id="step-title-2"
                  >
                    Create your wallet
                  </h3>
                  <p 
                    style={{
                      fontFamily: '"Public Sans", Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#797575'
                    }}
                    className="mt-1 font-normal"
                    id="step-text-2"
                  >
                    By create wallet, you are able to take action consist of buying, trading, and investing
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setActiveStep(3)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex gap-5 items-center
                  ${activeStep === 3 ? 'border-amber-400' : 'border-stone-100 hover:border-stone-200'}`}
                id="step-card-3"
                style={{
                  background: activeStep === 3 ? 'rgba(219, 219, 219, 0.2)' : '#FFFFFF',
                  boxShadow: activeStep === 3 ? '0px 0px 4px rgba(140, 140, 140, 0.5)' : 'none',
                  borderRadius: '20px'
                }}
              >
                {/* Ellipse 6 */}
                <div 
                  className="w-[52.84px] h-[52.84px] shrink-0 border-[1.3209px] rounded-full flex items-center justify-center font-serif text-[#FFC107]"
                  style={{
                    borderColor: '#FFC107',
                    fontSize: '36px',
                    lineHeight: '44px'
                  }}
                  id="step-number-3"
                >
                  3
                </div>
                <div id="step-desc-3">
                  <h3 
                    style={{
                      fontFamily: 'Lora',
                      fontSize: '30px',
                      lineHeight: '38px',
                      color: '#100F0F'
                    }}
                    className="font-serif font-normal"
                    id="step-title-3"
                  >
                    Buy and sell your digital asset
                  </h3>
                  <p 
                    style={{
                      fontFamily: '"Public Sans", Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#797575'
                    }}
                    className="mt-1 font-normal"
                    id="step-text-3"
                  >
                    Any asset that you chose to buy on the market
                  </p>
                </div>
              </div>

            </div>

            {/* Right Interactive Mock Mobile Wallet */}
            <div 
              className="p-6 max-w-sm mx-auto w-full select-none flex items-center justify-center shrink-0 self-center" 
              style={{
                width: '534px',
                height: '542px',
                background: '#FFFFFF',
                boxShadow: '0px 0px 4px rgba(182, 183, 200, 0.5)',
                borderRadius: '20px'
              }}
              id="wallet-right-mock"
            >
              {/* Outer Phone Bezel Frame */}
              <div 
                className="relative w-full max-w-[310px] mx-auto bg-stone-950 rounded-[44px] p-3 shadow-2xl border-[4.5px] border-stone-800 flex flex-col justify-between"
                style={{
                  height: '495px'
                }}
                id="wallet-device-frame"
              >
                
                {/* Speaker/Camera Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg z-30 flex items-center justify-center gap-1">
                  <div className="w-8 h-0.5 bg-neutral-800 rounded-full"></div>
                </div>

                {/* Internal Screen Content */}
                <div className="bg-white rounded-[32px] overflow-hidden text-left flex flex-col relative h-full bg-[#FFFFFF]" id="wallet-mock-screen">
                  
                  {activeStep === 1 && (
                    <div className="flex-1 flex flex-col bg-white p-4 justify-between h-full" id="screen-step-1">
                      <div className="text-center pt-6">
                        <span className="text-[10px] font-mono tracking-widest text-[#FFC107] font-bold uppercase">NaiWallet</span>
                        <h4 className="font-serif text-[18px] text-stone-900 font-bold mt-1">Create Account</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Start with creating your account</p>
                      </div>

                      <div className="flex flex-col gap-2.5 my-3 text-stone-800">
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-stone-400 block font-semibold mb-1 col-span-1">E-mail address</label>
                          <input 
                            type="text" 
                            disabled 
                            placeholder="tom.afolabi@nailand.org" 
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[10px] text-stone-750 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-stone-400 block font-semibold mb-1">Protected Password</label>
                          <input 
                            type="password" 
                            disabled 
                            placeholder="••••••••••••••" 
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveStep(2)}
                        className="w-full bg-[#f8c21a] hover:bg-[#e0ac10] font-bold text-stone-950 py-2.5 px-3 rounded-full text-[10px] shadow transition cursor-pointer text-center whitespace-nowrap active:scale-95"
                      >
                        Create Secure Account →
                      </button>

                      <div className="flex justify-center items-center gap-1 border-t border-stone-100 pt-2 text-[8px] text-stone-400 text-center font-mono">
                        🔒 Encrypted hardware security active
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="flex-1 flex flex-col bg-stone-900 p-4 justify-between h-full text-white" id="screen-step-2">
                      <div className="text-center pt-6">
                        <span className="text-[9px] font-mono tracking-widest text-[#FFC107] font-bold uppercase">SECRET RECOVERY TYPE</span>
                        <h4 className="font-serif text-[18px] text-white font-medium mt-1">Backup Keyphrase</h4>
                      </div>

                      <div className="my-auto py-2">
                        <span className="text-[8px] block text-stone-300 mb-2 text-center leading-normal">
                          Store these 6 backup phrase words offline in exact order.
                        </span>

                        <div className="grid grid-cols-2 gap-1 px-1">
                          <div className="bg-stone-800 text-[9px] font-mono p-1.5 rounded border border-stone-700">#1 trust</div>
                          <div className="bg-stone-850 text-[9px] font-mono p-1.5 rounded border border-stone-700">#2 digital</div>
                          <div className="bg-stone-800 text-[9px] font-mono p-1.5 rounded border border-stone-700">#3 shield</div>
                          <div className="bg-stone-850 text-[9px] font-mono p-1.5 rounded border border-stone-700">#4 future</div>
                          <div className="bg-stone-800 text-[9px] font-mono p-1.5 rounded border border-stone-700">#5 ocean</div>
                          <div className="bg-stone-850 text-[9px] font-mono p-1.5 rounded border border-stone-700">#6 yield</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveStep(3)}
                        className="w-full bg-white text-stone-900 font-bold py-2 px-3 rounded-full text-[10px] shadow transition cursor-pointer text-center whitespace-nowrap active:scale-95"
                      >
                        I wrote it down Safely 🔑
                      </button>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="flex-1 flex flex-col justify-between bg-white text-[#100F0F] h-full" id="screen-step-3">
                      
                      {/* Top Cover Solid Golden Section */}
                      <div className="bg-[#cca013] text-white pt-8 pb-3.5 px-3 flex flex-col shrink-0" id="wallet-screen-gold-header">
                        <div className="flex justify-between items-center text-[9px] tracking-wider mb-3" id="wallet-mock-header">
                          <div className="relative w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-[10px]">🔔</span>
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                          </div>
                          <span className="text-white font-semibold text-[10px]">NaiWallet</span>
                          <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-[10px]">⛶</span>
                          </div>
                        </div>

                        <span className="text-[7.5px] text-white/80 tracking-widest font-bold uppercase" id="lbl-balance">TOTAL BALANCE</span>
                        <div className="flex items-baseline gap-0.5 mt-0.5" id="balance-big-display">
                          <span className="text-xl font-bold text-white font-serif">$37,758,767</span>
                          <span className="text-xs text-white/90 font-medium font-semibold">.90</span>
                        </div>

                        <div className="inline-flex self-start items-center gap-0.5 bg-[#ccfbf1] text-[#1C7C54] text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 font-mono" id="balance-trend">
                          <span>▲</span>
                          <span>+2,5% this week</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mt-3" id="wallet-control-btns">
                          <button className="bg-white text-stone-900 hover:bg-neutral-50 px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center justify-center gap-0.5 cursor-pointer transition shadow-xs whitespace-nowrap border border-black/5" id="btn-send-mock">
                            <span>📤</span> Send
                          </button>
                          <button className="bg-white text-stone-900 hover:bg-neutral-50 px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center justify-center gap-0.5 cursor-pointer transition shadow-xs whitespace-nowrap border border-black/5" id="btn-receive-mock">
                            <span>📥</span> Receive
                          </button>
                        </div>

                      </div>

                      {/* Screen White Bottom Container */}
                      <div className="bg-white px-3 py-2 pb-3.5 flex flex-col flex-1 min-h-0" id="wallet-screen-white-body">
                        {/* Sub-tabs list */}
                        <div className="flex border-b border-stone-100 text-[8.5px] font-semibold text-stone-400 mb-2 pb-1 gap-3.5 shrink-0" id="wallet-mock-tabs">
                          <span className="text-stone-900 border-b-2 border-stone-950 pb-1 cursor-pointer font-bold">Asset</span>
                          <span className="cursor-pointer hover:text-stone-900 pb-1">Collection</span>
                          <span className="cursor-pointer hover:text-stone-900 pb-1">Activity</span>
                        </div>

                        {/* Search inside the mock phone screen */}
                        <div className="w-full flex items-center bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 mb-2 shrink-0 animate-pulse-slow" id="lens-search-phone">
                          <input 
                            type="text" 
                            placeholder="Placeholder Label" 
                            disabled 
                            className="w-full bg-transparent border-none outline-none text-[8px] text-stone-300"
                          />
                          <Search className="w-2.5 h-2.5 text-stone-300 shrink-0" />
                        </div>

                        {/* Asset row list */}
                        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1 max-h-[120px]" id="asset-scroller-phone">
                          
                          {/* Row 1 - NaiToken */}
                          <div className="flex justify-between items-center bg-white border border-stone-100 p-1.5 rounded-lg shrink-0" id="asset-row-mock-1">
                            <div className="flex items-center gap-1.5" id="asset-meta-1">
                              <div className="w-6 h-6 rounded-full bg-stone-950 text-[#f8c21a] text-[10px] font-bold flex items-center justify-center shadow-xs shrink-0">
                                N
                              </div>
                              <div className="flex flex-col" id="asset-names-1">
                                <span className="text-[9px] font-bold text-stone-900">NaiToken</span>
                                <span className="text-[7.5px] text-stone-400 font-mono mt-0.5">$100.00 USD</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end font-mono" id="asset-balances-1">
                              <span className="text-[9px] font-bold text-stone-900">250</span>
                              <span className="text-[7.5px] text-stone-400 mt-0.5">$100.00 USD</span>
                            </div>
                          </div>

                          {/* Row 2 - NFT */}
                          <div className="flex justify-between items-center bg-white border border-stone-100 p-1.5 rounded-lg shrink-0" id="asset-row-mock-2">
                            <div className="flex items-center gap-1.5" id="asset-meta-2">
                              <div className="w-6 h-6 rounded-full bg-[#A566FF] text-white text-[8px] font-black flex items-center justify-center shadow-xs shrink-0 border border-black/10">
                                NFT
                              </div>
                              <div className="flex flex-col" id="asset-names-2">
                                <span className="text-[9px] font-bold text-stone-900">NFT</span>
                                <span className="text-[7.5px] text-stone-400 font-mono mt-0.5">$100.00 USD</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end font-mono" id="asset-balances-2">
                              <span className="text-[9px] font-bold text-stone-900">250</span>
                              <span className="text-[7.5px] text-stone-400 mt-0.5">$100.00 USD</span>
                            </div>
                          </div>

                          {/* Row 3 - BTC */}
                          <div className="flex justify-between items-center bg-white border border-stone-100 p-1.5 rounded-lg shrink-0" id="asset-row-mock-3">
                            <div className="flex items-center gap-1.5" id="asset-meta-3">
                              <div className="w-6 h-6 rounded-full bg-[#EAB300] text-white text-[9px] font-bold flex items-center justify-center shadow-xs shrink-0">
                                ₿
                              </div>
                              <div className="flex flex-col" id="asset-names-3">
                                <span className="text-[9px] font-bold text-stone-900">BTC</span>
                                <span className="text-[7.5px] text-stone-400 font-mono mt-0.5">$100.00 USD</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end font-mono" id="asset-balances-3">
                              <span className="text-[9px] font-bold text-stone-900 font-mono">250</span>
                              <span className="text-[7.5px] text-stone-400 mt-0.5">$100.00 USD</span>
                            </div>
                          </div>

                          {/* Row 4 - COPPER */}
                          <div className="flex justify-between items-center bg-white border border-stone-100 p-1.5 rounded-lg shrink-0" id="asset-row-mock-4">
                            <div className="flex items-center gap-1.5" id="asset-meta-4">
                              <div className="w-6 h-6 rounded-full bg-amber-850 text-white text-[8px] font-bold flex items-center justify-center shadow-sm shrink-0">
                                CO
                              </div>
                              <div className="flex flex-col" id="asset-names-4 font-sans">
                                <span className="text-[9px] font-bold text-stone-900">COPPER</span>
                                <span className="text-[7.5px] text-stone-400 font-mono mt-0.5">$100.00 USD</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end font-mono" id="asset-balances-4">
                              <span className="text-[9px] font-bold text-stone-900 font-mono">250</span>
                              <span className="text-[7.5px] text-stone-400 mt-0.5">$100.00 USD</span>
                            </div>
                          </div>

                        </div>

                        {/* Manage Asset */}
                        <div className="mt-auto pt-1 flex justify-center shrink-0" id="wallet-screen-white-footer">
                          <div 
                            className="bg-stone-950 hover:bg-black text-[7.5px] text-white flex items-center gap-1 rounded-full px-2 py-0.5 cursor-pointer transition font-mono"
                            onClick={() => alert("Manage Assets panel loaded!")}
                          >
                            <span>⚙️</span> Manage Asset
                          </div>
                        </div>

                      </div>

                      {/* Bottom tabbar links */}
                      <div className="bg-stone-950 py-1.5 px-3.5 flex justify-between items-center text-stone-400 text-[10px] shrink-0 border-t border-stone-900" id="wallet-bottom-rail">
                        <span className="cursor-pointer hover:text-white">📁</span>
                        <span className="cursor-pointer hover:text-white">💬</span>
                        <div className="w-6 h-6 bg-amber-400 hover:bg-amber-500 rounded-full flex items-center justify-center text-stone-950 cursor-pointer font-bold transition">
                          ⇄
                        </div>
                        <span className="cursor-pointer hover:text-white">✉️</span>
                        <span className="cursor-pointer hover:text-white">⚙️</span>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* READY TO GET STARTED BLACK BANNER SECTION */}
      <section className="py-[50px] px-6 md:px-[100px] max-w-[1402px] mx-auto relative flex justify-center" id="banner-rocket-section">
        <div 
          className="rounded-[20px] relative overflow-hidden flex items-center justify-center p-6 md:p-12 w-full lg:w-[1202px]"
          style={{
            minHeight: '400px',
            background: 'linear-gradient(89.68deg, #0E0907 2.5%, #4F0E14 99.72%)'
          }}
          id="black-get-started-box"
        >
          {/* Ellipse 4 */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '606px',
              height: '606px',
              left: '-192px',
              top: '226px',
              background: '#050505',
              filter: 'blur(50px)',
              opacity: 0.9,
              zIndex: 1
            }}
          />

          {/* Ellipse 5 */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '878px',
              height: '875px',
              left: '561px',
              top: '-246px',
              background: '#050505',
              filter: 'blur(50px)',
              opacity: 0.9,
              zIndex: 1
            }}
          />

          {/* Frame 615 - Layout */}
          <div 
            className="w-full max-w-[1056px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10"
            style={{ minHeight: '370px' }}
            id="frame-615"
          >
            {/* Frame 614 */}
            <div 
              className="flex flex-col items-start gap-8 md:gap-[60px] max-w-full md:max-w-[704px]"
              id="frame-614"
            >
              {/* Frame 613 */}
              <div className="flex flex-col items-start gap-[30px] w-full" id="frame-613">
                {/* Frame 1618875552 */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[50px] w-full" id="frame-1618875552">
                  <h2 
                    className="font-serif font-normal"
                    style={{
                      width: '352px',
                      maxWidth: '100%',
                      fontSize: '36px',
                      lineHeight: '44px',
                      letterSpacing: '-0.005em',
                      color: '#FDFDFD'
                    }}
                    id="banner-h2"
                  >
                    Ready To Get Started
                  </h2>

                  <button 
                    onClick={onSignUpClick}
                    className="flex flex-row justify-center items-center py-3 px-6 gap-4 border border-[#100F0F] bg-[#FFC107] hover:bg-[#e0ac10] text-[#100F0F] rounded-[40px] cursor-pointer transition whitespace-nowrap active:scale-95"
                    style={{
                      width: '193px',
                      height: '48px'
                    }}
                    id="btn-create-community"
                  >
                    <span 
                      className="font-sans font-normal text-base leading-6 tracking-[0.002em]"
                    >
                      Create Community
                    </span>
                  </button>
                </div>

                <p 
                  className="font-serif font-normal text-left"
                  style={{
                    width: '704px',
                    maxWidth: '100%',
                    fontSize: '20px',
                    lineHeight: '26px',
                    letterSpacing: '-0.0025em',
                    color: '#FDFDFD'
                  }}
                  id="banner-sub"
                >
                  You can start for free with download the app or install the extension form your PC browser
                </p>
              </div>

              {/* Frame 102 */}
              <div className="flex flex-wrap md:flex-row items-start gap-[33px]" id="frame-102">
                <button 
                  className="flex items-center justify-center p-[15px_30px] gap-2.5 bg-white text-[#100F0F] hover:bg-stone-50 transition shadow-xs rounded-[40px] cursor-pointer group active:scale-95" 
                  style={{ width: '165px', height: '74px' }}
                  id="download-mobile-banner"
                >
                  <Smartphone className="w-[19px] h-[34px] shrink-0 text-stone-950 border-stone-950 group-hover:scale-110 transition" style={{ strokeWidth: 1.5 }} />
                  <span className="w-[76px] font-sans font-semibold text-xs leading-[22px] tracking-[0.003em] text-left">Download Mobile App</span>
                </button>

                <button 
                  className="flex items-center justify-center p-[15px_30px] gap-2.5 bg-white text-[#100F0F] hover:bg-stone-50 transition shadow-xs rounded-[40px] cursor-pointer group active:scale-95" 
                  style={{ width: '174.25px', height: '74px' }}
                  id="download-extension-banner"
                >
                  <Monitor className="w-[38.25px] h-[34px] shrink-0 text-white p-1 bg-black rounded group-hover:scale-110 transition" style={{ strokeWidth: 1.5 }} />
                  <span className="w-[66px] font-sans font-semibold text-xs leading-[22px] tracking-[0.003em] text-left">Download Extension</span>
                </button>
              </div>
            </div>

            {/* rocket-dynamic-color in Horizontal Mirror */}
            <div 
              className="relative shrink-0 select-none flex items-center justify-center animate-bounce-slow" 
              style={{
                width: '304px',
                height: '370px',
                transform: 'matrix(-1, 0, 0, 1, 0, 0)'
              }}
              id="banner-rocket-side"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full" id="rocket-svg">
                <defs>
                  <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                  <linearGradient id="rocket-fin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                {/* Stars particles in backdrop */}
                <circle cx="20" cy="50" r="1.5" fill="#fff" opacity="0.4" />
                <circle cx="180" cy="140" r="1.5" fill="#fff" opacity="0.6" />
                <circle cx="160" cy="30" r="2" fill="#fff" opacity="0.3" />
                <circle cx="40" cy="170" r="2.5" fill="#fff" opacity="0.5" />

                {/* Fire jet exhausts */}
                <path d="M 120,135 C 130,170 110,185 110,175 C 105,185 85,170 95,135 Z" fill="#f87171" />
                <path d="M 115,135 C 120,155 110,165 110,155 C 105,165 95,155 100,135 Z" fill="#fbbf24" />

                {/* Main Body */}
                <path d="M 100,30 C 130,70 135,120 120,135 C 105,138 95,138 80,135 C 65,120 70,70 100,30 Z" fill="url(#rocket-body)" />
                
                {/* Fins */}
                <path d="M 75,110 C 50,120 50,140 70,135 C 75,130 75,120 75,110 Z" fill="url(#rocket-fin)" />
                <path d="M 125,110 C 150,120 150,140 130,135 C 125,130 125,120 125,110 Z" fill="url(#rocket-fin)" />
                <path d="M 100,110 C 90,135 100,145 100,145 C 100,145 110,135 100,110 Z" fill="#ef4444" />
                
                {/* Porthole view window */}
                <circle cx="100" cy="80" r="15" fill="#1e293b" stroke="#cbd5e1" strokeWidth="3" />
                <circle cx="95" cy="75" r="5" fill="#fff" opacity="0.6" />
                
                {/* Rocket Nose Tip */}
                <path d="M 100,30 C 108,40 114,50 113,54 C 105,52 95,52 87,54 C 86,50 92,40 100,30 Z" fill="#3b82f6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-100 border-t border-stone-200 py-16 px-6 md:px-12 text-stone-600" id="landing-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12" id="footer-nested-grid">
          
          <div className="flex flex-col items-start text-left" id="footer-branding">
            <NaiLandLogo size="sm" className="mb-4" />
            <p className="text-[11px] text-stone-400 leading-relaxed active:scale-95 transition" id="footer-sub-text">
              A collaboration-first space to build real experience and visibility.
            </p>
          </div>

          <div className="flex flex-col items-start text-left text-xs gap-3" id="footer-prod-cols">
            <span className="font-bold text-stone-800 uppercase tracking-widest text-[10px]" id="lbl-col-1">Product</span>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-prod-1">How-It-works</a>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-prod-2">FAQ</a>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-prod-3">Join Waitlist</a>
          </div>

          <div className="flex flex-col items-start text-left text-xs gap-3" id="footer-comm-cols">
            <span className="font-bold text-stone-800 uppercase tracking-widest text-[10px]" id="lbl-col-2">Community</span>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-comm-1">Join Discord</a>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-comm-2">Join Telegram</a>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-comm-3">Follow on X</a>
            <a href="#" className="hover:text-[#f8c21a] transition" id="link-comm-4">Follow on LinkedIn</a>
          </div>

          <div className="flex flex-col items-start text-left text-xs gap-3" id="footer-contact-cols">
            <span className="font-bold text-stone-800 uppercase tracking-widest text-[10px]" id="lbl-col-3">Contact</span>
            <a href="mailto:hello@nailand.com" className="hover:text-[#f8c21a] transition font-mono text-[11px]" id="link-contact-email">
              hello@nailand.com
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-200 mt-12 pt-6 flex flex-col sm:flex-row justify-between text-[10px] text-stone-400 font-mono" id="footer-bottom">
          <span id="copyright">© 2026 NAILAND</span>
          <div className="flex gap-4 mt-2 sm:mt-0" id="footer-terms">
            <span className="hover:text-stone-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
