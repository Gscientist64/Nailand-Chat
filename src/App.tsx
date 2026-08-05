import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { CommunitiesProvider } from './lib/CommunitiesContext';
import { messagesApi } from './lib/api';
import LandingPage from './components/LandingPage';
import AuthFlow from './components/AuthFlow';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import CommunitySection from './components/CommunitySection';
import CommunityDirectory from './components/CommunityDirectory';
import MessagesSection from './components/MessagesSection';
import { ActiveView, DashboardTab, UserProfile, ChatThread, ChatMessage } from './types';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Navigation & States
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.LANDING);
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  // Direct Chat trigger parameters
  const [directChatUser, setDirectChatUser] = useState<string | undefined>(undefined);
  const [directChatAvatar, setDirectChatAvatar] = useState<string | undefined>(undefined);

  // Chat Threads state fetched from API
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');

  // Fetch threads when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      messagesApi.getThreads().then((res) => {
        if (res.success && res.data) {
          const mapped: ChatThread[] = res.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            avatar: t.avatar,
            lastMessage: t.lastMessage || '',
            timeString: t.timeString || '',
            category: t.category === 'community' ? 'community' : 'chat',
            messages: [],
            isCommunity: t.isCommunity,
            communityId: t.communityId,
          }));
          setThreads(mapped);
          if (mapped.length > 0) setActiveThreadId(mapped[0].id);
        }
      });
    }
  }, [isAuthenticated]);

  // Handlers
  const handleAuthSuccess = () => {
    setSelectedCommunity(null);
    setActiveTab('dashboard');
    setActiveView(ActiveView.APP_LAYOUT);
  };

  const handleSelectDirectChat = async (personName: string, avatar: string) => {
    setDirectChatUser(personName);
    setDirectChatAvatar(avatar);

    const match = threads.find(t => t.name === personName);
    if (match) {
      setActiveThreadId(match.id);
    } else {
      // Create thread via API
      const res = await messagesApi.createThread({
        name: personName,
        avatar: avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80',
        participantIds: [],
        category: 'chat',
      });
      if (res.success && res.data) {
        const newTh: ChatThread = {
          id: res.data.id,
          name: res.data.name,
          avatar: res.data.avatar,
          lastMessage: 'Let us start chatting!',
          timeString: 'Just now',
          category: 'chat',
          messages: [],
        };
        setThreads(prev => [newTh, ...prev]);
        setActiveThreadId(newTh.id);
      }
    }
    setActiveTab('messages');
  };

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && activeView === ActiveView.LANDING) {
      setActiveView(ActiveView.APP_LAYOUT);
    }
  }, [isLoading, isAuthenticated, activeView]);

  const handleLogout = () => {
    logout();
    setActiveView(ActiveView.LANDING);
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="text-stone-400 font-mono text-xs animate-pulse">Loading NaiLand...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] relative text-stone-800" id="app-root-container">
      
      {/* MAIN ACTIVE MOUNT DIRECTORY */}
      <div id="mount-view-container" className="relative">
        
        {/* VIEW 1: LANDING PAGE */}
        {activeView === ActiveView.LANDING && (
          <LandingPage 
            onSignUpClick={() => setActiveView(ActiveView.SIGN_UP)}
            onLogInClick={() => setActiveView(ActiveView.LOGIN)}
            onExploreSkillsClick={() => {
              setActiveView(ActiveView.APP_LAYOUT);
              setActiveTab('dashboard');
              setSelectedCommunity(null);
            }}
          />
        )}

        {/* VIEW 2: AUTHORIZATION FLOW WIZARDS */}
        {(activeView === ActiveView.SIGN_UP || 
          activeView === ActiveView.CONFIRMATION_CODE || 
          activeView === ActiveView.INTERESTS || 
          activeView === ActiveView.SUGGESTED_REGIONS || 
          activeView === ActiveView.LOGIN || 
          activeView === ActiveView.PASSWORD_RESET_CODE || 
          activeView === ActiveView.NEW_PASSWORD) && (
          <div className="py-8 bg-stone-50/50 min-h-screen" id="auth-flow-mounted-wrap">
            <AuthFlow 
              initialView={activeView}
              onSuccess={handleAuthSuccess}
              onBackToHome={() => setActiveView(ActiveView.LANDING)}
              onLogInInstead={() => setActiveView(ActiveView.SIGN_UP)}
            />
          </div>
        )}

        {/* VIEW 3: IN-APP ACTIVE DASHBOARD LAYOUTS */}
        {activeView === ActiveView.APP_LAYOUT && user && (
          <DashboardLayout 
            user={user}
            activeTab={activeTab}
            setActiveTab={(t) => {
              if (t === 'logout') {
                handleLogout();
                return;
              }
              setActiveTab(t);
              setSelectedCommunity(null);
            }}
            onLogout={handleLogout}
          >
            {activeTab === 'dashboard' && (
              <DashboardHome 
                user={user}
                onSelectCommunity={(comName) => {
                  setSelectedCommunity(comName);
                  setActiveTab('community');
                }}
                onSelectDirectChat={handleSelectDirectChat}
              />
            )}

            {activeTab === 'community' && (
              selectedCommunity ? (
                <CommunitySection 
                  communityName={selectedCommunity}
                  onBackToDashboard={() => {
                    setSelectedCommunity(null);
                  }}
                />
              ) : (
                <CommunityDirectory 
                  onSelectCommunity={(comName) => {
                    setSelectedCommunity(comName);
                  }}
                />
              )
            )}

            {activeTab === 'messages' && (
              <MessagesSection 
                threads={threads}
                setThreads={setThreads}
                activeThreadId={activeThreadId}
                setActiveThreadId={setActiveThreadId}
                initialChatWith={directChatUser} 
                initialAvatar={directChatAvatar} 
                clearDirectChatTrigger={() => {
                  setDirectChatUser(undefined);
                  setDirectChatAvatar(undefined);
                }}
              />
            )}

            {activeTab === 'help' && (
              <div className="p-10 text-left max-w-5xl mx-auto flex flex-col gap-6" id="help-deck">
                <div className="bg-white border border-stone-200/50 p-6 rounded-2xl" id="help-card">
                  <span className="text-[10px] tracking-widest font-mono text-amber-600 font-bold block mb-1">NAILAND USER ASSIST</span>
                  <h3 className="font-serif font-bold text-xl text-stone-900 border-b border-stone-50 pb-4 mb-4">Workspace Knowledge Hub</h3>
                  
                  <div className="flex flex-col gap-4 text-xs leading-relaxed text-stone-600" id="help-questions">
                    <div>
                      <strong className="text-stone-800 text-sm">💡 What is Nailand peer-mesh network?</strong>
                      <p className="mt-1">NaiLand is a decentralized social platform that enables developers, writers, designers, and builders to coordinate hackathons, audit smart code, and exchange digital assets through collaborative barter consensus protocols.</p>
                    </div>

                    <div>
                      <strong className="text-stone-800 text-sm">💡 How does the ticking delivery countdown timer operate?</strong>
                      <p className="mt-1">The countdown widget tracks milestone synchronization. In the message workspaces, participants observe remaining schedules to ship elements securely before gas fee fluctuations occur.</p>
                    </div>

                    <div>
                      <strong className="text-stone-800 text-sm">💡 Are coordinates values dynamic?</strong>
                      <p className="mt-1">Yes! Selecting nodes scattered on the Interactive Map displays immediate peer names, feedback indexes, and enables triggering direct message conversations.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DashboardLayout>
        )}

      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CommunitiesProvider>
        <AppContent />
      </CommunitiesProvider>
    </AuthProvider>
  );
}
