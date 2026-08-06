import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import { ActiveView, DashboardTab, ChatThread } from './types';

// Shared app state for threads (preserved across route navigation)
function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Chat Threads state fetched from API (lifted so it persists across tabs)
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

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
            unreadCount: t.unreadCount || 0,
            isCommunity: t.isCommunity,
            communityId: t.communityId,
          }));
          setThreads(mapped);
        }
      });
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    navigate('/app/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Direct chat: create/find thread then navigate to messages
  const handleSelectDirectChat = async (personName: string, avatar: string, participantId?: string) => {
    const match = threads.find(t => t.name === personName);
    let threadId = match?.id;

    if (!match) {
      // createThread requires at least one participant; fall back to self if no other user id is available
      const res = await messagesApi.createThread({
        name: personName,
        avatar: avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80',
        participantIds: participantId ? [participantId] : [user!.id],
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
        threadId = newTh.id;
      }
    }

    navigate('/app/messages', { state: { chatWith: personName, avatar, threadId } });
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
      <div id="mount-view-container" className="relative">
        <Routes>
          {/* LANDING */}
          <Route
            path="/"
            element={
              <LandingPage
                onSignUpClick={() => navigate('/signup')}
                onLogInClick={() => navigate('/login')}
                onExploreSkillsClick={() => navigate('/app/dashboard')}
              />
            }
          />

          {/* AUTH FLOW */}
          <Route
            path="/signup"
            element={
              <div className="py-8 bg-stone-50/50 min-h-screen" id="auth-flow-mounted-wrap">
                <AuthFlow
                  initialView={ActiveView.SIGN_UP}
                  onSuccess={handleAuthSuccess}
                  onBackToHome={() => navigate('/')}
                  onLogInInstead={() => navigate('/login')}
                />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="py-8 bg-stone-50/50 min-h-screen" id="auth-flow-mounted-wrap">
                <AuthFlow
                  initialView={ActiveView.LOGIN}
                  onSuccess={handleAuthSuccess}
                  onBackToHome={() => navigate('/')}
                  onLogInInstead={() => navigate('/signup')}
                />
              </div>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <div className="py-8 bg-stone-50/50 min-h-screen" id="auth-flow-mounted-wrap">
                <AuthFlow
                  initialView={ActiveView.PASSWORD_RESET_CODE}
                  onSuccess={handleAuthSuccess}
                  onBackToHome={() => navigate('/')}
                  onLogInInstead={() => navigate('/login')}
                />
              </div>
            }
          />

          {/* PROTECTED APP */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout user={user!} onLogout={handleLogout} onSelectDirectChat={handleSelectDirectChat} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DashboardHome
                  user={user!}
                  onSelectCommunity={(comName) => navigate(`/app/community/${encodeURIComponent(comName)}`)}
                  onSelectDirectChat={handleSelectDirectChat}
                />
              }
            />
            <Route
              path="messages"
              element={
                <MessagesSection
                  threads={threads}
                  setThreads={setThreads}
                  activeThreadId={activeThreadId}
                  setActiveThreadId={setActiveThreadId}
                  initialChatWith={(location.state as any)?.chatWith}
                  initialAvatar={(location.state as any)?.avatar}
                  clearDirectChatTrigger={() => {
                    navigate('/app/messages', { replace: true, state: null });
                  }}
                />
              }
            />
            <Route
              path="community"
              element={
                <CommunityDirectory
                  onSelectCommunity={(comName) => navigate(`/app/community/${encodeURIComponent(comName)}`)}
                />
              }
            />
            <Route
              path="community/:communityName"
              element={
                <CommunitySection
                  communityName={decodeURIComponent((useParams().communityName || ''))}
                  onBackToDashboard={() => navigate('/app/community')}
                />
              }
            />
            <Route
              path="help"
              element={
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
              }
            />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CommunitiesProvider>
          <AppContent />
        </CommunitiesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
