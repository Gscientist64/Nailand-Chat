import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Check, 
  Award, 
  Eye, 
  Play, 
  Pause, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Send, 
  Search, 
  Globe, 
  Link2, 
  ExternalLink,
  Sliders,
  AlertTriangle,
  UserCheck,
  Star,
  Download,
  Camera,
  Trash2
} from 'lucide-react';
import { CommunityFeedPost, CollabOffer, SkillRequest } from '../types';
import { useAuth } from '../lib/AuthContext';
import { useCommunities } from '../lib/CommunitiesContext';
import { feedsApi, messagesApi, communitiesApi } from '../lib/api';

interface CommunitySectionProps {
  communityName: string;
  onBackToDashboard: () => void;
}

export default function CommunitySection({ communityName, onBackToDashboard }: CommunitySectionProps) {
  const { user } = useAuth();
  const { communities } = useCommunities();
  const currentCommunity = communities.find((c) => c.name === communityName);
  const currentCommunityId = currentCommunity?.id;

  // Navigation & Toggle states
  const [activeSubTab, setActiveSubTab] = useState<'feeds' | 'offers' | 'requests'>('feeds');
  const [activeResourceTab, setActiveResourceTab] = useState<'media' | 'files' | 'links'>('media');
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  
  // Modals / Wizard states
  const [collabWizardStep, setCollabWizardStep] = useState<number>(0); // 0 means closed, 1-4 are pages
  const [isSkillRequestActive, setIsSkillRequestActive] = useState<boolean>(false);

  // Fetch feeds when community changes
  const [feeds, setFeeds] = useState<CommunityFeedPost[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);

  // Real community members from API
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);
  const [connectedMembers, setConnectedMembers] = useState<Record<string, boolean>>({});

  // Chat conversation list from API community threads
  const [communitiesForChat, setCommunitiesForChat] = useState<any[]>([]);
  const [activeChatCommunity, setActiveChatCommunity] = useState<string>('');

  // Interactive chat messages state from API
  const [chatStore, setChatStore] = useState<Record<string, Array<{ sender: string, avatar: string, content: string, time: string, isMe: boolean }>>>({});
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);

  const [typedMessage, setTypedMessage] = useState<string>('');

  // Load community members + chat threads from API
  useEffect(() => {
    if (!currentCommunityId) return;

    communitiesApi.get(currentCommunityId).then((res) => {
      if (res.success && res.data) {
        const members = (res.data.members || []).map((m: any) => ({
          name: m.userName || m.name || 'Community Member',
          rating: m.rating || 4,
          avatar: m.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
          role: m.role || 'Member',
        }));
        setCommunityMembers(members.length > 0 ? members : []);
      }
    });

    messagesApi.getThreads().then((res) => {
      if (res.success && res.data) {
        const communityThreads = (res.data as any[]).filter((t) => t.isCommunity);
        if (communityThreads.length > 0) {
          setCommunitiesForChat(communityThreads.map((t) => ({
            id: t.id,
            name: t.name,
            description: 'Community channel',
            avatar: t.avatar,
            members: 'Community',
            unreadCount: 0,
            active: false,
          })));
          setActiveChatCommunity(communityThreads[0].name);
          setActiveChatThreadId(communityThreads[0].id);
        }
      }
    });
  }, [currentCommunityId]);

  // Load chat messages for the active community thread
  useEffect(() => {
    if (!activeChatThreadId) return;
    messagesApi.getMessages(activeChatThreadId).then((res) => {
      if (res.success && res.data) {
        const mapped = (res.data as any[]).map((m) => ({
          sender: m.sender || 'Member',
          avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
          content: m.content,
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          isMe: m.senderId === user?.id,
        }));
        setChatStore((prev) => ({ ...prev, [activeChatCommunity]: mapped }));
      }
    });
  }, [activeChatThreadId, activeChatCommunity, user?.id]);

  const sendNewChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatThreadId) return;

    const newMessage = {
      sender: user?.firstName || 'You',
      avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      content: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatStore((prev) => ({
      ...prev,
      [activeChatCommunity]: [...(prev[activeChatCommunity] || []), newMessage]
    }));
    setTypedMessage('');

    await messagesApi.sendMessage(activeChatThreadId, typedMessage);
  };

  // Fetch feeds from API
  useEffect(() => {
    if (!currentCommunityId) return;
    feedsApi.getPosts(currentCommunityId).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setFeeds(res.data.map((p: any) => ({
          id: p.id,
          author: p.author || 'Member',
          authorId: p.authorId,
          authorAvatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
          rating: 5,
          timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'recent',
          content: p.content,
          images: p.images || [],
          attachmentTypes: p.attachmentTypes || [],
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
        })));
      }
      setFeedsLoading(false);
    });
  }, [currentCommunityId]);

  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(''); // Compatibility hook
  
  // Interactive attachment states for draft carousel to build Screens 1-5
  const [draftAttachments, setDraftAttachments] = useState<Array<{ type: 'image' | 'video'; url: string }>>([]);
  const [draftAttachmentIndex, setDraftAttachmentIndex] = useState<number>(0);
  const [isDraftPlayingVideo, setIsDraftPlayingVideo] = useState<boolean>(false);

  // Keep track of the slide index / playing video state inside feed streams
  const [feedMediaIndices, setFeedMediaIndices] = useState<Record<string, number>>({});
  const [playingFeeds, setPlayingFeeds] = useState<Record<string, boolean>>({});

  // Mock Preset Options for Screens 1-5 in Mockups
  const composerPresets = {
    screen1: {
      text: "From the stable of our services, and the brilliancy of our products, we create timeliness structure based on what is trending in the modern world or what you deem fit, your dream world...",
      attachments: []
    },
    screen2: {
      text: "Single elegant presentation mockup featuring high-contrast dark visual branding guidelines.",
      attachments: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800' }
      ]
    },
    screen3: {
      text: "Exploring our multi-image presentation models. Swipe through the carousel below to review the responsive layout tokens and community wires.",
      attachments: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800' }
      ]
    },
    screen4: {
      text: "Here is a quick concept video render illustrating the transitions of our staking token dashboard onboarding loop. Hit Play to watch!",
      attachments: [
        { type: 'video', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800' }
      ]
    },
    screen5: {
      text: "Hybrid mixed-media portfolio showing custom 3D blender animations alongside static layout tokens for the web3 launch.",
      attachments: [
        { type: 'video', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe505cb?q=80&w=800' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=800' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800' }
      ]
    }
  };

  const applyComposerPreset = (mode: 'screen1' | 'screen2' | 'screen3' | 'screen4' | 'screen5' | 'clear') => {
    if (mode === 'clear') {
      setNewPostText('');
      setDraftAttachments([]);
      setDraftAttachmentIndex(0);
      setIsDraftPlayingVideo(false);
    } else {
      const preset = composerPresets[mode];
      setNewPostText(preset.text);
      setDraftAttachments(preset.attachments as any);
      setDraftAttachmentIndex(0);
      setIsDraftPlayingVideo(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && draftAttachments.length === 0) return;
    if (!currentCommunityId) return;

    const res = await feedsApi.createPost(currentCommunityId, {
      content: newPostText,
      images: draftAttachments.filter(a => a.type === 'image').map(a => a.url),
      videoUrl: draftAttachments.find(a => a.type === 'video')?.url,
    });

    if (res.success && res.data) {
      const post: CommunityFeedPost = {
        id: res.data.id,
        author: user?.firstName || 'You',
        authorId: user?.id || '',
        authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
        rating: 5,
        timeAgo: 'Just now',
        content: newPostText,
        likes: 0,
        comments: 0,
        shares: 0,
        image: draftAttachments.length > 0 ? draftAttachments[0].url : undefined,
        images: draftAttachments.map(a => a.url),
        attachmentTypes: draftAttachments.map(a => a.type)
      };
      setFeeds([post, ...feeds]);
    }

    setNewPostText('');
    setDraftAttachments([]);
    setDraftAttachmentIndex(0);
    setIsDraftPlayingVideo(false);
  };

  // Multi-step form values
  const [collabFormData, setCollabFormData] = useState({
    project: 'Building a mobile app',
    briefDescription: 'I need a team of UIUX designers that can create interactive design interfaces that engage users for Naitalk metaverse company.',
    objectives: ['Scan Chat', 'Gamified Engagement Hub', 'User Profiles & Interest Tags Creation'],
    newObjInput: '',
    lookingFor: 'Front End, UI/UX Designer',
    roles: 'Front End, UI/UX Designer',
    numberOfCollaborators: '10',
    projectLength: '3 Months',
    expectedCommitment: '10 Hours / Week',
    monetaryCompensation: '100 Naitoken',
    skillExchange: 'Copy Writing'
  });

  // Simple additions to objectives
  const addObjective = () => {
    if (collabFormData.newObjInput.trim()) {
      setCollabFormData({
        ...collabFormData,
        objectives: [...collabFormData.objectives, collabFormData.newObjInput.trim()],
        newObjInput: ''
      });
    }
  };

  const removeObjective = (index: number) => {
    setCollabFormData({
      ...collabFormData,
      objectives: collabFormData.objectives.filter((_, idx) => idx !== index)
    });
  };

  const [offers, setOffers] = useState<CollabOffer[]>([]);

  // Fetch collab offers from API
  useEffect(() => {
    feedsApi.getOffers().then((res) => {
      if (res.success && res.data) {
        setOffers((res.data as any[]).map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          objectives: o.objectives || [],
          roles: o.roles || [],
          collaboratorsCount: o.collaboratorsCount || 1,
          projectLength: o.projectLength || '',
          commitment: o.commitment || '',
          monetary: o.monetary || '',
          skillExchange: o.skillExchange || '',
          creator: o.creator || 'Community Member',
          creatorAvatar: o.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
        })));
      }
    });
  }, []);

  const handleFinishCollabWizard = async () => {
    const newOffer = {
      title: collabFormData.project,
      description: collabFormData.briefDescription,
      objectives: collabFormData.objectives,
      roles: collabFormData.roles.split(',').map(r => r.trim()),
      collaboratorsCount: parseInt(collabFormData.numberOfCollaborators) || 5,
      projectLength: collabFormData.projectLength,
      commitment: collabFormData.expectedCommitment,
      monetary: collabFormData.monetaryCompensation,
      skillExchange: collabFormData.skillExchange,
    };

    const res = await feedsApi.createOffer(newOffer);
    if (res.success && res.data) {
      setOffers((prev) => [{
        ...newOffer,
        id: res.data.id,
        creator: user?.firstName || 'You',
        creatorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      }, ...prev]);
    }
    setCollabWizardStep(0); // close wizard
    setActiveSubTab('offers'); // switch to Collabs list for success confirmation
  };

  // Skill Request Form Fields state
  const [skillReqFormData, setSkillReqFormData] = useState({
    title: 'Designing Logo',
    briefDescription: 'Need help with logo design for AT&T mediaworld',
    roles: 'Graphic Designer',
    projectLength: '3 Months',
    monetaryCompensation: '100 Naitoken'
  });

  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);

  // Fetch skill requests from API
  useEffect(() => {
    feedsApi.getSkillRequests().then((res) => {
      if (res.success && res.data) {
        setSkillRequests((res.data as any[]).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          roles: r.roles || [],
          projectLength: r.projectLength || '',
          monetary: r.monetary || '',
        })));
      }
    });
  }, []);

  const handleCreateSkillRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      title: skillReqFormData.title,
      description: skillReqFormData.briefDescription,
      roles: skillReqFormData.roles.split(',').map(r => r.trim()),
      projectLength: skillReqFormData.projectLength,
      monetary: skillReqFormData.monetaryCompensation
    };

    const res = await feedsApi.createSkillRequest(newReq);
    if (res.success && res.data) {
      setSkillRequests((prev) => [{ ...newReq, id: res.data.id }, ...prev]);
    }
    setIsSkillRequestActive(false);
    setActiveSubTab('requests'); // show list
  };

  const toggleLikePost = async (postId: string) => {
    setFeeds(feeds.map(f => {
      if (f.id === postId) {
        return { ...f, likes: f.likes + 1 };
      }
      return f;
    }));
    await feedsApi.likePost(postId);
  };

  const handleConnectMember = (name: string) => {
    setConnectedMembers(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="text-left max-w-7xl mx-auto flex flex-col gap-6 font-sans bg-white min-h-screen text-stone-800" id="community-view-wrapper">
      
      {/* ----------------- CHAT MODE ACTIVE OVERLAY VIEW ----------------- */}
      {isChatActive ? (
        <div className="flex flex-col md:flex-row border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-sm h-[750px]" id="community-chat-mode-panel">
          
          {/* LEFT COLUMN: ACTIVE COMMUNITIES OR THREADS */}
          <div className="md:w-80 border-r border-stone-200 bg-stone-50 flex flex-col h-full" id="chat-sidebar-com">
            
            {/* Sidebar header */}
            <div className="p-4 border-b border-stone-200" id="chat-sidebar-header">
              <div className="flex items-center gap-3 mb-3.5">
                <button 
                  onClick={() => setIsChatActive(false)}
                  className="p-1 px-2.5 rounded-full border border-stone-300 hover:bg-stone-100 flex items-center gap-1.5 text-xs font-semibold text-stone-600 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Main View</span>
                </button>
              </div>
              <h3 className="font-sans font-extrabold text-[#FFB300] tracking-wide text-lg uppercase">Community Chat</h3>
            </div>

            {/* Filter pills */}
            <div className="px-4 py-2 flex gap-1.5 border-b border-stone-100 bg-white" id="chat-filters">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-stone-900 text-white cursor-pointer hover:opacity-90">All</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600 cursor-pointer hover:bg-stone-200">Community</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600 cursor-pointer hover:bg-stone-200">Favorites</span>
            </div>

            {/* Communities list mapping */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1" id="chat-threads-list-flow">
              {communitiesForChat.map((chCom) => {
                const isActive = activeChatCommunity === chCom.name;
                return (
                  <button
                    key={chCom.name}
                    onClick={() => setActiveChatCommunity(chCom.name)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 border transition text-left
                      ${isActive 
                        ? 'bg-white border-amber-400 shadow-sm' 
                        : 'border-transparent hover:bg-stone-200/50'}`}
                    id={`chat-thread-btn-${chCom.name}`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={chCom.avatar} 
                        alt={chCom.name} 
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col" id={`item-chat-desc-${chCom.name}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-900 truncate">{chCom.name}</span>
                        {chCom.unreadCount > 0 && (
                          <span className="bg-[#FFB300] text-amber-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                            {chCom.unreadCount}New
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{chCom.description}</p>
                      <span className="text-[9px] text-[#FF5722] font-semibold mt-1 font-mono">{chCom.members}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MIDDLE COLUMN: CHAT WINDOW SPACE */}
          <div className="flex-1 flex flex-col bg-stone-50 h-full relative" id="chat-thread-viewport">
            {/* Thread Header details */}
            <div className="p-4 bg-white border-b border-stone-200 flex justify-between items-center" id="chat-header-actions-row">
              <div className="flex items-center gap-3">
                <img 
                  src={
                    communitiesForChat.find(c => c.name === activeChatCommunity)?.avatar || 
                    'https://images.unsplash.com/photo-1628005182384-a83a8bd57fbe?q=80&w=120'
                  }
                  alt={activeChatCommunity}
                  className="w-10 h-10 rounded-full object-cover border border-amber-200"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <h4 className="font-sans font-bold text-sm text-stone-900">{activeChatCommunity}</h4>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    1.2k people online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsChatActive(false)}
                  className="bg-stone-900 border border-stone-950 text-white font-semibold text-xs px-4.5 py-2 rounded-full cursor-pointer hover:bg-stone-850 transition"
                >
                  Close Chat Room
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" id="messages-scroller-window">
              <div className="text-center">
                <span className="px-3 py-1 bg-stone-200/60 rounded-full text-[10px] font-medium text-stone-500 font-mono">
                  Today's Encrypted Stream
                </span>
              </div>

              {(chatStore[activeChatCommunity] || []).map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 max-w-[85%] ${msg.isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  id={`chat-msg-row-${i}`}
                >
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    className="w-8 h-8 rounded-full border border-stone-200 shrink-0 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-stone-400 font-medium mb-1 pl-1">
                      {msg.sender === 'You' ? 'You' : msg.sender}
                    </span>
                    <div 
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed
                        ${msg.isMe 
                          ? 'bg-amber-500 text-stone-950 rounded-tr-none font-medium' 
                          : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'}`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 pl-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Action Bar */}
            <form onSubmit={sendNewChatMessage} className="p-4 bg-white border-t border-stone-200 flex gap-2 items-center" id="chat-text-composer-form">
              <input 
                type="text" 
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type a message or discuss skills..."
                className="flex-1 bg-stone-50 text-xs border border-stone-200 rounded-full px-4.5 py-3 outline-none focus:border-[#FFB300] transition"
                id="typed-chat-input-element"
              />
              <button 
                type="submit"
                className="p-3 bg-stone-950 hover:bg-stone-800 text-white rounded-full transition flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      ) : (
        /* ----------------- CORE COMMUNITY MAIN FEEDS & DETAIL VIEW ----------------- */
        <div className="flex flex-col gap-6" id="community-core-default-panel">
          
          {/* BANNER HEADER AREA */}
          <div className="relative rounded-3xl overflow-hidden border border-stone-200 select-none bg-stone-900" id="com-jumbotron-container">
            {/* Binocular artwork backdrop from Unsplash */}
            <div className="absolute inset-0 h-full w-full opacity-60">
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200" 
                alt="Modern Binocular Abstract Illustration Backdrop" 
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Top row controls */}
            <div className="relative z-10 p-6 flex justify-between items-center" id="com-jumbotron-controls">
              <button 
                onClick={onBackToDashboard}
                className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur border border-stone-200/50 hover:bg-white text-xs font-semibold flex items-center gap-2 text-stone-800 transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
              
              <span className="px-3 py-1 bg-amber-500/90 text-stone-950 font-bold text-2xs uppercase rounded-full tracking-wider font-mono shadow-sm">
                Verified Chamber
              </span>
            </div>

            {/* Bottom Row containing community profiles, details and pills */}
            <div className="relative z-10 pt-16 p-6 md:p-8 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent text-white flex flex-col md:flex-row justify-between items-end gap-6" id="com-jumbotron-details">
              
              <div className="flex items-center gap-4 text-left" id="com-jumbotron-profile-card">
                <div className="relative shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1628005182384-a83a8bd57fbe?q=80&w=120" 
                    alt="Figma Buddies Logo Logo" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md bg-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900"></span>
                </div>
                
                <div className="flex flex-col" id="com-jumbotron-name-sub">
                  <h2 className="text-2xl font-sans font-black flex items-center gap-2 tracking-tight">
                    <span>{communityName}</span>
                  </h2>
                  <p className="text-stone-300 text-xs mt-1 max-w-lg leading-relaxed font-sans">
                    Figma Buddies is a group of designers who come together to learn, collaborate and share skills.
                    <span className="text-amber-400 font-bold ml-1 cursor-pointer hover:underline">...more</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Community Chat, Create Collab Request, Create Skill Request */}
              <div className="flex flex-wrap gap-2.5" id="com-jumbotron-action-triggers">
                <button 
                  onClick={() => setIsChatActive(true)}
                  className="bg-[#FFB300] hover:bg-[#FFA000] text-stone-950 font-extrabold text-xs px-4.5 py-2.5 rounded-full cursor-pointer transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                  id="btn-trigger-chat-mode"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Community Chat</span>
                </button>

                <button 
                  onClick={() => setCollabWizardStep(1)}
                  className="bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold text-xs px-4.5 py-2.5 rounded-full cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap"
                  id="btn-trigger-collab-wizard"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Collaboration Request</span>
                </button>

                <button 
                  onClick={() => setIsSkillRequestActive(true)}
                  className="bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold text-xs px-4.5 py-2.5 rounded-full cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap"
                  id="btn-trigger-skill-request"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Skill Request</span>
                </button>
              </div>

            </div>
          </div>

          {/* MAIN 2-COLUMN SPLIT LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="com-core-split-layout">
            
            {/* LEFT 2/3 COLUMN: FEEDS POSTS & WIDGET TILES */}
            <div className="lg:col-span-8 flex flex-col gap-6 text-left" id="com-split-column-left">
              
              {/* Write Post Box card matching screens */}
              <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col gap-4 shadow-sm" id="com-composer-post-card">
                
                {/* Visual Specifications Presets Switcher Row */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 border border-stone-150 rounded-xl" id="com-preset-selector-row">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase mr-1">Draft Demos:</span>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('screen1')} 
                    className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-400 rounded-full transition cursor-pointer"
                  >
                    S1: Text Only
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('screen2')} 
                    className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-400 rounded-full transition cursor-pointer"
                  >
                    S2: Single Image
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('screen3')} 
                    className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-400 rounded-full transition cursor-pointer"
                  >
                    S3: Carousel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('screen4')} 
                    className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-400 rounded-full transition cursor-pointer"
                  >
                    S4: Video Draft
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('screen5')} 
                    className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-400 rounded-full transition cursor-pointer"
                  >
                    S5: Mixed Media
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyComposerPreset('clear')} 
                    className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-150 ml-auto transition cursor-pointer"
                  >
                    ✕ Reset
                  </button>
                </div>

                <div className="flex gap-3" id="com-composer-body">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"
                    alt="Author avatar"
                    className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <textarea 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Create a post, or select a demo draft template above..."
                    rows={2}
                    className="flex-1 text-xs text-stone-800 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl p-3 outline-none resize-none transition min-h-[60px]"
                    id="composer-text-input"
                  />
                </div>

                {/* 🛑 HIGH-FIDELITY DYNAMIC ATTACHMENTS CAROUSEL STAGE */}
                {draftAttachments.length > 0 && (
                  <div className="relative w-full aspect-video md:max-h-72 bg-stone-950 border border-stone-200 rounded-xl overflow-hidden shadow-inner select-none" id="composer-attachment-stage">
                    <img 
                      src={draftAttachments[draftAttachmentIndex]?.url} 
                      alt="Dynamic draft presentation model" 
                      className={`w-full h-full object-cover transition-all duration-300 ${isDraftPlayingVideo && draftAttachments[draftAttachmentIndex]?.type === 'video' ? 'brightness-50' : 'brightness-90'}`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Central Play overlay button for video draft simulation */}
                    {draftAttachments[draftAttachmentIndex]?.type === 'video' && (
                      <button 
                        type="button"
                        onClick={() => setIsDraftPlayingVideo(!isDraftPlayingVideo)}
                        className="absolute inset-0 m-auto w-14 h-14 bg-black/60 backdrop-blur-xs hover:bg-black/80 text-white rounded-full flex items-center justify-center transition active:scale-95 shadow-lg border border-white/10"
                        title={isDraftPlayingVideo ? "Pause draft" : "Play draft"}
                      >
                        {isDraftPlayingVideo ? (
                          <div className="flex gap-1 items-center">
                            <span className="w-1.5 h-5 bg-[#FFB300] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1.5 h-5 bg-[#FFB300] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-1.5 h-5 bg-[#FFB300] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                          </div>
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5 text-white" />
                        )}
                      </button>
                    )}

                    {/* Playing Video simulation status feedback */}
                    {draftAttachments[draftAttachmentIndex]?.type === 'video' && isDraftPlayingVideo && (
                      <div className="absolute bottom-16 left-0 right-0 py-1.5 bg-black/50 text-[10px] text-[#FFB300] font-mono text-center tracking-wider animate-pulse">
                        ▶ Active Video Stream Simulation ok
                      </div>
                    )}

                    {/* OVERLAY BOTTOM-LEFT controls for Camera / Gallery adding or Trash removal */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const url = prompt("Enter Unsplash Image URL, or submit background template:");
                          if (url) {
                            setDraftAttachments([...draftAttachments, { type: 'image', url }]);
                            setDraftAttachmentIndex(draftAttachments.length);
                            setIsDraftPlayingVideo(false);
                          }
                        }}
                        className="w-8 h-8 bg-black/75 hover:bg-black text-white border border-white/15 rounded-full flex items-center justify-center transition active:scale-90 shadow-sm"
                        title="Attach Camera/Image"
                      >
                        <Camera className="w-4 h-4 text-stone-300 hover:text-white" />
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          const url = prompt("Enter Unsplash Video Thumbnail URL:", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800");
                          if (url) {
                            setDraftAttachments([...draftAttachments, { type: 'video', url }]);
                            setDraftAttachmentIndex(draftAttachments.length);
                            setIsDraftPlayingVideo(false);
                          }
                        }}
                        className="w-8 h-8 bg-black/75 hover:bg-black text-white border border-white/15 rounded-full flex items-center justify-center transition active:scale-90 shadow-sm"
                        title="Attach Video"
                      >
                        <VideoIcon className="w-4 h-4 text-stone-300 hover:text-white" />
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          const remaining = [...draftAttachments];
                          remaining.splice(draftAttachmentIndex, 1);
                          setDraftAttachments(remaining);
                          setDraftAttachmentIndex(0);
                          setIsDraftPlayingVideo(false);
                        }}
                        className="w-8 h-8 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-900/40 rounded-full flex items-center justify-center transition active:scale-95 shadow-sm"
                        title="Remove current item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* OVERLAY BOTTOM-RIGHT pager chevrons & indicator lines */}
                    {draftAttachments.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/80 text-white border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 select-none shadow-md">
                        <button 
                          type="button"
                          onClick={() => {
                            setDraftAttachmentIndex(prev => (prev - 1 + draftAttachments.length) % draftAttachments.length);
                            setIsDraftPlayingVideo(false);
                          }}
                          className="text-stone-300 hover:text-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {draftAttachments.map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`block rounded-full transition-all duration-300
                                ${draftAttachmentIndex === idx ? 'w-2 h-2 bg-[#FFB300]' : 'w-3 h-[2px] bg-white/40'}`}
                            />
                          ))}
                        </div>

                        <button 
                          type="button"
                          onClick={() => {
                            setDraftAttachmentIndex(prev => (prev + 1) % draftAttachments.length);
                            setIsDraftPlayingVideo(false);
                          }}
                          className="text-stone-300 hover:text-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Composers option attachments & broadcast trigger button */}
                <div className="flex justify-between items-center border-t border-stone-100 pt-3" id="com-composer-footer">
                  <div className="flex items-center gap-4 text-stone-500 text-xs font-semibold" id="com-composer-attachments">
                    <button 
                      type="button"
                      onClick={() => {
                        const imgUrl = prompt("Enter an Unsplash Image URL to attach:", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800");
                        if (imgUrl) {
                          setDraftAttachments([...draftAttachments, { type: 'image', url: imgUrl }]);
                          setDraftAttachmentIndex(draftAttachments.length);
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-stone-900 transition text-[13px] font-sans cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <span>Image</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        const vidUrl = prompt("Enter an Unsplash Video Poster URL to attach:", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800");
                        if (vidUrl) {
                          setDraftAttachments([...draftAttachments, { type: 'video', url: vidUrl }]);
                          setDraftAttachmentIndex(draftAttachments.length);
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-stone-900 transition text-[13px] font-sans cursor-pointer"
                    >
                      <VideoIcon className="w-4 h-4 text-amber-500" />
                      <span>Video</span>
                    </button>

                    {draftAttachments.length > 0 && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        ✓ {draftAttachments.length} media item(s) attached
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostText.trim() && draftAttachments.length === 0}
                    className="bg-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer transition select-none disabled:opacity-40"
                    id="composer-post-submit"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* FEED AND COMPLEMENTARY WORKSPACE TABS */}
              <div className="flex flex-col gap-4" id="com-subtabs-wrapper">
                {/* Horizontal tabs list switcher */}
                <div className="flex border-b border-[#EAEAEA] gap-6" id="com-subtabs">
                  <button 
                    onClick={() => setActiveSubTab('feeds')}
                    className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                      ${activeSubTab === 'feeds' 
                        ? 'border-amber-500 text-amber-600' 
                        : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                    id="tab-select-feeds"
                  >
                    Community Feeds
                  </button>

                  <button 
                    onClick={() => setActiveSubTab('offers')}
                    className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                      ${activeSubTab === 'offers' 
                        ? 'border-amber-500 text-amber-600' 
                        : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                    id="tab-select-offers"
                  >
                    Collaboration Offers ({offers.length})
                  </button>

                  <button 
                    onClick={() => setActiveSubTab('requests')}
                    className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                      ${activeSubTab === 'requests' 
                        ? 'border-amber-500 text-amber-600' 
                        : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                    id="tab-select-requests"
                  >
                    Skill Requests ({skillRequests.length})
                  </button>
                </div>

                {/* SUBTAB CONTENT 1: FEEDS STREAM RENDERER */}
                {activeSubTab === 'feeds' && (
                  <div className="flex flex-col gap-5" id="feed-scroller-layout">
                    {feeds.map((feed) => (
                      <div 
                        key={feed.id} 
                        className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col text-left transition duration-300 hover:shadow-xs"
                        id={`feed-row-${feed.id}`}
                      >
                        {/* Upper row meta */}
                        <div className="flex justify-between items-start mb-3" id={`feed-top-row-${feed.id}`}>
                          <div className="flex items-center gap-3" id={`feed-profile-block-${feed.id}`}>
                            <img 
                              src={feed.authorAvatar} 
                              alt={feed.author} 
                              className="w-10 h-10 rounded-full border border-stone-200 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex flex-col text-left gap-0.5" id={`feed-author-col-${feed.id}`}>
                              <span className="font-bold text-sm text-stone-900">{feed.author}</span>
                              {/* 5 Rating Stars */}
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, sIdx) => (
                                  <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-[1px]" />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" id={`feed-actions-dropdown-${feed.id}`}>
                            <span className="text-xs text-stone-400 font-mono">{feed.timeAgo}</span>
                          </div>
                        </div>

                        {/* Post Message Text Paragraph */}
                        <p className="text-[13px] text-stone-600 leading-relaxed text-left mb-4 pr-1 font-sans mt-2" id={`feed-p-text-${feed.id}`}>
                          {feed.content}
                        </p>

                        {/* Responsive interactive dynamic media stage if provided */}
                        {feed.images && feed.images.length > 0 ? (
                          (() => {
                            const activeIdx = feedMediaIndices[feed.id] || 0;
                            const activeUrl = feed.images[activeIdx];
                            const activeType = feed.attachmentTypes ? feed.attachmentTypes[activeIdx] : 'image';
                            const isPlaying = playingFeeds[feed.id] || false;

                            return (
                              <div className="w-full aspect-video md:max-h-72 bg-stone-950 border border-stone-200/60 rounded-xl overflow-hidden mb-4 relative shadow-sm group select-none" id={`feed-interactive-stage-${feed.id}`}>
                                <img 
                                  src={activeUrl} 
                                  alt="Feed presentation visual" 
                                  className={`w-full h-full object-cover transition-all duration-300 ${isPlaying && activeType === 'video' ? 'brightness-50' : 'brightness-90'}`}
                                  referrerPolicy="no-referrer"
                                />

                                {/* Central Play overlay button for video */}
                                {activeType === 'video' && (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setPlayingFeeds(prev => ({ ...prev, [feed.id]: !prev[feed.id] }));
                                    }}
                                    className="absolute inset-0 m-auto w-14 h-14 bg-black/60 backdrop-blur-xs hover:bg-black/80 text-white rounded-full flex items-center justify-center transition active:scale-95 shadow-md border border-white/10"
                                    title={isPlaying ? "Pause presentation video" : "Play presentation video"}
                                  >
                                    {isPlaying ? (
                                      <div className="flex gap-1 items-center">
                                        <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                        <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                        <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                      </div>
                                    ) : (
                                      <Play className="w-5 h-5 fill-white ml-0.5 text-white animate-pulse" />
                                    )}
                                  </button>
                                )}

                                {/* Video status simulation bar */}
                                {activeType === 'video' && isPlaying && (
                                  <div className="absolute bottom-16 left-0 right-0 px-4 py-1.5 bg-black/45 text-[9px] text-[#FFB300] font-mono text-center animate-pulse tracking-wide">
                                    ▶ Presenting Interactive Video • Click Center Circle to Pause
                                  </div>
                                )}

                                {/* Carousel dots controller for multi-media index swiping in feed */}
                                {feed.images && feed.images.length > 1 && (
                                  <div className="absolute bottom-4 right-4 bg-black/80 text-white border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2.5 shadow-md">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFeedMediaIndices(prev => {
                                          const currIdx = prev[feed.id] || 0;
                                          const nextIdx = (currIdx - 1 + feed.images!.length) % feed.images!.length;
                                          return { ...prev, [feed.id]: nextIdx };
                                        });
                                        // Reset playing state on page change
                                        setPlayingFeeds(prev => ({ ...prev, [feed.id]: false }));
                                      }}
                                      className="text-stone-300 hover:text-white transition cursor-pointer p-0.5"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                      {feed.images.map((_, dotIdx) => (
                                        <span 
                                          key={dotIdx} 
                                          className={`block rounded-full transition-all duration-300
                                            ${activeIdx === dotIdx ? 'w-2 h-2 bg-[#FFB300]' : 'w-3 h-[2px] bg-white/40'}`}
                                        />
                                      ))}
                                    </div>

                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFeedMediaIndices(prev => {
                                          const currIdx = prev[feed.id] || 0;
                                          const nextIdx = (currIdx + 1) % feed.images!.length;
                                          return { ...prev, [feed.id]: nextIdx };
                                        });
                                        setPlayingFeeds(prev => ({ ...prev, [feed.id]: false }));
                                      }}
                                      className="text-stone-300 hover:text-white transition cursor-pointer p-0.5"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          feed.image && (
                            <div className="w-full aspect-video md:max-h-80 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 mb-4" id={`feed-illustration-box-${feed.id}`}>
                              <img 
                                src={feed.image} 
                                alt="Feed illustration visual and modern graphics workspace preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )
                        )}

                        {/* Footer indicators (Like, Retweet, Comment, Share) */}
                        <div className="flex items-center gap-6 border-t border-stone-50/80 pt-3.5 text-xs text-stone-500 font-medium" id={`feed-interactive-footer-${feed.id}`}>
                          <button 
                            onClick={() => toggleLikePost(feed.id)}
                            className="flex items-center gap-1.5 hover:text-stone-900 transition whitespace-nowrap cursor-pointer"
                          >
                            <Heart className="w-4 h-4 text-stone-300 hover:text-rose-500 hover:fill-rose-500" />
                            <span>{feed.likes}</span>
                          </button>

                          <button 
                            onClick={() => {
                              alert("Post reposted with citation to your native feeds dashboard!");
                            }}
                            className="flex items-center gap-1.5 hover:text-stone-900 transition whitespace-nowrap cursor-pointer"
                          >
                            <span className="text-xs font-bold text-stone-300 hover:text-emerald-500">⇄</span>
                            <span>{feed.shares}</span>
                          </button>

                          <button 
                            onClick={() => {
                              const comment = prompt("Enter your comment text on Afolabi's post:");
                              if (comment) alert(`Comment posted contextually: "${comment}"`);
                            }}
                            className="flex items-center gap-1.5 hover:text-stone-900 transition whitespace-nowrap cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-stone-300" />
                            <span>{feed.comments}</span>
                          </button>

                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              alert("Post snippet connection link copied to your clipboard!");
                            }}
                            className="flex items-center gap-1.5 hover:text-stone-900 transition ml-auto whitespace-nowrap cursor-pointer"
                          >
                            <Share2 className="w-4 h-4 text-stone-300" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUBTAB CONTENT 2: COLLABORATION REQUESTS */}
                {activeSubTab === 'offers' && (
                  <div className="flex flex-col gap-4" id="collab-offers-layout">
                    {offers.length === 0 ? (
                      <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-100 p-6">
                        <p className="text-stone-400 text-xs">No active collaborative offers listed yet. Create the first one using "Create Collaboration Request" above!</p>
                      </div>
                    ) : (
                      offers.map((offer) => (
                        <div key={offer.id} className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col text-left transition duration-300 hover:shadow-xs" id={`offer-${offer.id}`}>
                          <div className="flex justify-between items-start gap-3 border-b border-stone-100 pb-3 mb-3">
                            <div>
                              <span className="px-2 py-0.5 bg-amber-50 rounded text-[10px] text-amber-700 font-bold mb-1.5 inline-block">COLLAB PROPOSAL</span>
                              <h4 className="font-bold text-stone-900 text-sm">{offer.title}</h4>
                              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{offer.description}</p>
                            </div>
                            <img src={offer.creatorAvatar} alt={offer.creator} className="w-9 h-9 rounded-full object-cover shrink-0 border border-stone-100" referrerPolicy="no-referrer" />
                          </div>

                          {/* Objectives lists */}
                          <div className="mb-3.5" id="collab-obj-section">
                            <span className="text-[9px] font-mono tracking-wider font-bold text-stone-400 uppercase block mb-1.5">OBJECTIVES:</span>
                            <div className="flex flex-col gap-1.5 pl-0.5">
                              {offer.objectives.map((obj, iIdx) => (
                                <div key={iIdx} className="flex items-center gap-1.5 text-xs text-stone-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  <span>{obj}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Roles required */}
                          <div className="mb-4" id="collab-roles-section">
                            <span className="text-[9px] font-mono tracking-wider font-bold text-stone-400 uppercase block mb-1.5">ROLES IN DEMAND:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {offer.roles.map((r, rIdx) => (
                                <span key={rIdx} className="px-2.5 py-0.5 bg-[#FAFAFA] border border-stone-200 text-stone-600 rounded-full font-sans text-[11px] font-medium">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Horizontal variables specs row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAFAFA] border border-stone-100 p-3 rounded-xl text-xs font-medium text-stone-600" id="collab-metrics-block">
                            <div>
                              <span className="text-[10px] text-stone-400 block font-mono">PROJECT LENGTH</span>
                              <strong className="text-stone-800 text-[11px]">{offer.projectLength}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-mono">COMMITMENT</span>
                              <strong className="text-stone-800 text-[11px]">{offer.commitment}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-mono">REWARD STIPEND</span>
                              <strong className="text-stone-800 text-[11px] flex items-center gap-0.5">
                                <span className="text-amber-500">★</span> {offer.monetary}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-mono">SKILL EXCHANGE</span>
                              <strong className="text-stone-800 text-[11px] truncate block">{offer.skillExchange}</strong>
                            </div>
                          </div>

                          {/* Collab CTA */}
                          <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-stone-50" id="collab-actions-block">
                            <span className="text-[11px] text-stone-400 font-sans">Offered by <strong className="text-stone-700">{offer.creator}</strong></span>
                            <button 
                              onClick={() => {
                                alert(`Request submitted contextually to ${offer.creator}. Check messages soon!`);
                              }}
                              className="px-4.5 py-1.5 bg-[#FFB300] hover:bg-[#FFA000] text-stone-950 text-xs font-bold rounded-full transition shadow-2xs whitespace-nowrap cursor-pointer"
                            >
                              Apply to Collab
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SUBTAB CONTENT 3: SKILL REQUESTS */}
                {activeSubTab === 'requests' && (
                  <div className="flex flex-col gap-4" id="skill-requests-layout">
                    {skillRequests.length === 0 ? (
                      <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-100 p-6">
                        <p className="text-stone-400 text-xs">No active skill requests listed. Build the first model using "Create Skill Request" above!</p>
                      </div>
                    ) : (
                      skillRequests.map((req) => (
                        <div key={req.id} className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex flex-col text-left transition duration-300 hover:shadow-xs" id={`skill-req-${req.id}`}>
                          <div className="flex justify-between items-start gap-4 mb-3 border-b border-stone-50 pb-3">
                            <div>
                              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded font-mono uppercase">DEMAND EXCHANGE</span>
                              <h4 className="font-bold text-stone-900 text-sm mt-1.5">{req.title}</h4>
                              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{req.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-3" id="skill-req-meta">
                            <div className="flex gap-6 text-xs text-stone-600 font-medium font-sans">
                              <div>
                                <span className="text-[10px] text-stone-400 block font-mono">PROJECT DURATION</span>
                                <strong className="text-stone-800">{req.projectLength}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-stone-400 block font-mono">COMPENSATION OFFERED</span>
                                <strong className="text-stone-800 flex items-center gap-0.5 text-[#FF5722]">
                                  <span>✦</span> {req.monetary}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-stone-400 block font-mono">REQUIRED SKILLS</span>
                                <strong className="text-stone-800 truncate block max-w-xs">{req.roles.join(', ')}</strong>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                alert(`Connect signal dispatched securely to partners. Direct messages opened!`);
                              }}
                              className="px-4 py-1.5 bg-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs rounded-full transition whitespace-nowrap cursor-pointer"
                            >
                              Connect & Trade
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT 1/3 SIDEBAR: SEARCH USERS WITHIN COMMUNITY */}
            <aside className="lg:col-span-4 flex flex-col gap-6" id="com-split-column-right">
              
              <div className="bg-white border border-[#EBEBEB] p-5 rounded-3xl flex flex-col gap-4 text-left shadow-2xs" id="com-sidebar-search-members-box">
                <h3 className="text-stone-900 font-sans font-extrabold text-sm tracking-tight" id="sidebar-members-box-title">
                  Find people in the community
                </h3>

                {/* Input Search Block with inline absolute search icon */}
                <div className="relative" id="sidebar-members-search-wrapper">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Search name, expert, roles..." 
                    className="w-full bg-[#FAFAFA] text-xs border border-stone-200 rounded-full pl-10 pr-4 py-3 outline-none focus:border-[#FF5722] transition"
                    id="sidebar-member-query-input"
                  />
                </div>

                {/* Vertical scroll list of community members matching screens */}
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[420px] pr-1" id="sidebar-members-scroll-flow">
                  {communityMembers.map((member) => {
                    const isConnected = connectedMembers[member.name];
                    return (
                      <div 
                        key={member.name}
                        className="flex items-center justify-between border-b border-stone-50 pb-3"
                        id={`sidebar-member-row-${member.name}`}
                      >
                        {/* Member avatar profile details */}
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-9 h-9 rounded-full object-cover border border-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col text-left gap-0.5">
                            <span className="font-bold text-[13px] text-stone-900 leading-none">{member.name}</span>
                            
                            {/* Star indicators */}
                            <div className="flex items-center">
                              {Array.from({ length: member.rating }).map((_, sIdx) => (
                                <Star key={sIdx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-stone-400 font-medium">{member.role}</span>
                          </div>
                        </div>

                        {/* Orange Connect text trigger links matching visual screens */}
                        <button 
                          onClick={() => handleConnectMember(member.name)}
                          className={`text-xs font-sans font-bold cursor-pointer transition select-none
                            ${isConnected 
                              ? 'text-emerald-650 hover:text-emerald-700' 
                              : 'text-[#FF5722] hover:text-[#E64A19] hover:underline'}`}
                          id={`btn-connect-member-${member.name}`}
                        >
                          {isConnected ? '✓ Connected' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </aside>
          </div>

          {/* OUR CORE VALUE, RULES & GROUP ANALYTICS SECTION matching screens */}
          <section className="bg-stone-50 border border-stone-150 rounded-3xl p-6 md:p-8 mt-4 grid grid-cols-1 md:grid-cols-3 gap-8 justify-between text-left select-none" id="com-additional-info-grid-box">
            
            {/* Our Core Value Column */}
            <div className="flex flex-col gap-3" id="additional-info-col-values">
              <h4 className="text-sm font-sans font-extrabold text-stone-900 uppercase tracking-wider">Our Core Value</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-stone-500 font-sans">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Inclusivity</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Collaboration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Creativity</span>
                </div>
              </div>
            </div>

            {/* Community Rules Column */}
            <div className="flex flex-col gap-3" id="additional-info-col-rules">
              <h4 className="text-sm font-sans font-extrabold text-stone-900 uppercase tracking-wider">Community Rules</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-stone-500 font-sans">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  <span>Be respectful</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  <span>Respect privacy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  <span>No spams</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  <span>Stay on topics</span>
                </div>
              </div>
            </div>

            {/* Group Analytics Column */}
            <div className="flex flex-col gap-3" id="additional-info-col-analytics">
              <h4 className="text-sm font-sans font-extrabold text-stone-900 uppercase tracking-wider">Group Analytics</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-stone-500 font-sans">
                <div className="text-[11px] font-mono text-stone-400 border-b border-stone-200 pb-1 w-full flex justify-between">
                  <span>Last 2 days activity</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 py-0.5" id="metric-analytics-1">
                  <span>25k members</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 py-0.5" id="metric-analytics-2">
                  <span>60k posts</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 py-0.5" id="metric-analytics-3">
                  <span>890k post views</span>
                </div>
              </div>
            </div>

          </section>

          {/* LOWER SECTION: SHARED MEDIA, SHARED FILES, SHARED LINKS TAB COMPONENT */}
          <section className="bg-white border border-[#EBEBEB] rounded-3xl p-6 md:p-8 flex flex-col gap-6 text-left" id="com-resource-sharing-panel">
            
            {/* Tab switch header pills */}
            <div className="flex border-b border-[#EBEBEB] gap-6" id="resource-sharing-tabs">
              <button 
                onClick={() => setActiveResourceTab('media')}
                className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                  ${activeResourceTab === 'media' 
                    ? 'border-[#FF5722] text-[#FF5722]' 
                    : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                id="btn-resource-media"
              >
                Shared Media 250+
              </button>

              <button 
                onClick={() => setActiveResourceTab('files')}
                className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                  ${activeResourceTab === 'files' 
                    ? 'border-[#FF5722] text-[#FF5722]' 
                    : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                id="btn-resource-files"
              >
                Shared Files 68+
              </button>

              <button 
                onClick={() => setActiveResourceTab('links')}
                className={`pb-3 font-sans font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer
                  ${activeResourceTab === 'links' 
                    ? 'border-[#FF5722] text-[#FF5722]' 
                    : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                id="btn-resource-links"
              >
                Shared Links 58+
              </button>
            </div>

            {/* SHARED MEDIA GRID */}
            {activeResourceTab === 'media' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="resource-media-view-grid">
                {[
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300',
                  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=300',
                  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300',
                  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300',
                  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=300',
                  'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=300'
                ].map((mSrc, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-stone-200/60 bg-stone-50 shadow-2xs group relative cursor-pointer" id={`media-thumb-${idx}`}>
                    <img 
                      src={mSrc} 
                      alt="Shared digital illustration model asset" 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-black/60 px-2 py-1 rounded-md">View asset</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SHARED FILES LIST TABLE */}
            {activeResourceTab === 'files' && (
              <div className="border border-stone-200/80 rounded-2xl overflow-hidden" id="resource-files-view-table">
                <table className="w-full text-xs font-sans text-stone-600">
                  <thead className="bg-[#FAFAFA] border-b border-borderColor text-left text-stone-500 font-bold">
                    <tr>
                      <th className="p-4 pl-5">Document Name</th>
                      <th className="p-4">File Size</th>
                      <th className="p-4">Categorized / Role tag</th>
                      <th className="p-4 pr-5 text-right">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'UXUX Document.pdf', size: '15.65kb', tag: 'interactive design', owner: 'Afolabi Ola' },
                      { name: 'Dashboard Design System v2.fig', size: '142.10kb', tag: 'UI Library tokens', owner: 'Afolabi Emmanuel' },
                      { name: 'Wireframing Guidelines Book.pdf', size: '48.95kb', tag: 'UX Research', owner: 'Afolabi Victor' },
                      { name: 'Brand Typography Layout Assets.zip', size: '280.40kb', tag: 'Brand asset pack', owner: 'Afolabi Funke' }
                    ].map((fItem, fIdx) => (
                      <tr key={fIdx} className="border-b border-stone-100 hover:bg-stone-50 transition">
                        <td className="p-4 pl-5 flex items-center gap-2 font-bold text-stone-900">
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{fItem.name}</span>
                        </td>
                        <td className="p-4 font-mono">{fItem.size}</td>
                        <td className="p-4">
                          <span className="bg-[#FAFAFA] border border-stone-200 text-stone-550 px-2 py-0.5 rounded text-[10px] font-bold">
                            {fItem.tag}
                          </span>
                        </td>
                        <td className="p-4 pr-5 text-right font-medium text-stone-700">{fItem.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SHARED LINKS GRID */}
            {activeResourceTab === 'links' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="resource-links-view-grid">
                {[
                  { title: 'Behance Workspace', desc: 'Creative digital agency visual presentation overview', url: 'https://behance.net/design-showcase', provider: 'Behance' },
                  { title: 'Figma Library Sandbox', desc: 'Active community components figma design tokens variables', url: 'https://figma.com/file/sandbox', provider: 'Figma' },
                  { title: 'Concept Presentation Video', desc: 'Youtube presentation walkthrough of onboarding user experience workflow', url: 'https://youtube.com/design-tutorial', provider: 'Youtube' }
                ].map((lItem, idx) => (
                  <a 
                    key={idx} 
                    href={lItem.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-4.5 bg-white border border-[#EBEBEB] rounded-2xl flex flex-col justify-between hover:border-[#FF5722] hover:shadow-2xs transition"
                    id={`link-card-${idx}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono uppercase">{lItem.provider}</span>
                        <Link2 className="w-4 h-4 text-stone-400" />
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-xs">{lItem.title}</h4>
                      <p className="text-[11px] text-stone-500 mt-1 lines-clamp-2 leading-relaxed">{lItem.desc}</p>
                    </div>
                    <span className="text-[10px] text-[#FF5722] font-semibold flex items-center gap-1 mt-3">
                      Visit attachment link <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            )}

          </section>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ HIGH-FIDELITY WIZARD OVERLAY: CREATING COLLABORATION OFFER TEMPLATE  */}
      {/* ========================================================================= */}
      {collabWizardStep > 0 && (
        <div className="fixed inset-0 bg-stone-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs" id="collab-offer-wizard-backdrop">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl p-8 relative shadow-2xl text-left flex flex-col gap-6" id="wizard-box-container">
            
            {/* Close button */}
            <button 
              onClick={() => setCollabWizardStep(0)}
              className="absolute right-5 top-5 font-bold text-stone-400 hover:text-stone-800 text-lg transition cursor-pointer"
            >
              ✕
            </button>

            {/* UPPER ROW DESCRIPTION */}
            <div id="wizard-upper-branding-row">
              <span className="text-[10px] font-mono tracking-widest uppercase font-black text-amber-600 block mb-1">PROPOSAL WORK DESK</span>
              <h3 className="text-xl font-sans font-black text-stone-900">Collaboration Offer Template</h3>
            </div>

            {/* 🛑 STEP 1: PROJECT HEADER & INITIAL DETAILS */}
            {collabWizardStep === 1 && (
              <div className="flex flex-col gap-4 animate-fadeIn" id="wizard-step-1">
                <div className="flex flex-col gap-1.5" id="wizard-inp-project">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-project">Project</label>
                  <input 
                    type="text" 
                    id="wiz-project"
                    required
                    value={collabFormData.project}
                    onChange={(e) => setCollabFormData({ ...collabFormData, project: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-3 text-xs outline-none focus:border-amber-400"
                    placeholder="Project Title"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-brief">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-desc">Brief Description</label>
                  <textarea 
                    id="wiz-desc"
                    required
                    value={collabFormData.briefDescription}
                    onChange={(e) => setCollabFormData({ ...collabFormData, briefDescription: e.target.value })}
                    rows={3}
                    className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-amber-400 resize-none font-sans"
                    placeholder="Describe collaboration goals..."
                  />
                </div>

                <div className="flex flex-col gap-2" id="wizard-inp-objectives">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Objective Tags</label>
                  
                  {/* Array loop mapping */}
                  <div className="flex flex-wrap gap-2 mb-1" id="wiz-obj-badges-loop">
                    {collabFormData.objectives.map((obj, oIdx) => (
                      <span key={oIdx} className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <span>{obj}</span>
                        <button type="button" onClick={() => removeObjective(oIdx)} className="text-stone-450 hover:text-stone-700 font-bold">×</button>
                      </span>
                    ))}
                  </div>

                  {/* Add visual block */}
                  <div className="flex gap-2" id="wiz-obj-action-composer">
                    <input 
                      type="text"
                      value={collabFormData.newObjInput}
                      onChange={(e) => setCollabFormData({ ...collabFormData, newObjInput: e.target.value })}
                      placeholder="Add system objective (e.g. Scan Chat, Gamified Hub)"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={addObjective}
                      className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-850 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 🛑 STEP 2: LOOKING FOR / ROLES REQUISITES */}
            {collabWizardStep === 2 && (
              <div className="flex flex-col gap-4 animate-fadeIn" id="wizard-step-2">
                <div className="flex flex-col gap-1.5" id="wizard-inp-looking-for">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-lookingfor">Looking For</label>
                  <input 
                    type="text" 
                    id="wiz-lookingfor"
                    required
                    value={collabFormData.lookingFor}
                    onChange={(e) => setCollabFormData({ ...collabFormData, lookingFor: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none"
                    placeholder="Brief description of skills"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-roles">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-roles">Roles (comma-separated list)</label>
                  <input 
                    type="text" 
                    id="wiz-roles"
                    required
                    value={collabFormData.roles}
                    onChange={(e) => setCollabFormData({ ...collabFormData, roles: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none"
                    placeholder="e.g. Front End, UI/UX Designer, Brand Auditor"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-collaborators">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-numcollabs">Number Of Collaborators Needed</label>
                  <input 
                    type="number" 
                    id="wiz-numcollabs"
                    required
                    value={collabFormData.numberOfCollaborators}
                    onChange={(e) => setCollabFormData({ ...collabFormData, numberOfCollaborators: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            )}

            {/* 🛑 STEP 3: DURATION TIME & SERVICE AGREEMENTS */}
            {collabWizardStep === 3 && (
              <div className="flex flex-col gap-4 animate-fadeIn" id="wizard-step-3">
                <div className="text-xs font-bold text-[#FFB300] uppercase tracking-wider font-mono">
                  ★ Duration Time & Work Agreement
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-length">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-projlength">Project Length</label>
                  <input 
                    type="text" 
                    id="wiz-projlength"
                    required
                    value={collabFormData.projectLength}
                    onChange={(e) => setCollabFormData({ ...collabFormData, projectLength: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none"
                    placeholder="e.g. 3 Months, 2 Weeks"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-commitment">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-commitment">Expected Commitment</label>
                  <input 
                    type="text" 
                    id="wiz-commitment"
                    required
                    value={collabFormData.expectedCommitment}
                    onChange={(e) => setCollabFormData({ ...collabFormData, expectedCommitment: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none"
                    placeholder="e.g. 10 Hours / Week, 20 Hours / Week"
                  />
                </div>
              </div>
            )}

            {/* 🛑 STEP 4: REWARDS, MONETARY COMPENSATION & PUBLISH CHECKOUT */}
            {collabWizardStep === 4 && (
              <div className="flex flex-col gap-4 animate-fadeIn" id="wizard-step-4">
                <div className="text-xs font-bold text-[#FFB300] uppercase tracking-wider font-mono">
                  ★ Rewards and Payment Settlement
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-monetary">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-compensation">Monetary Compensation</label>
                  <input 
                    type="text" 
                    id="wiz-compensation"
                    required
                    value={collabFormData.monetaryCompensation}
                    onChange={(e) => setCollabFormData({ ...collabFormData, monetaryCompensation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                    placeholder="e.g. 100 Naitoken"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="wizard-inp-skill-exchange">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-skillex">Skill Exchange Offer</label>
                  <input 
                    type="text" 
                    id="wiz-skillex"
                    required
                    value={collabFormData.skillExchange}
                    onChange={(e) => setCollabFormData({ ...collabFormData, skillExchange: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                    placeholder="e.g. Copy Writing, Sketching, Figma audit"
                  />
                </div>

                {/* Warning message block */}
                <div className="p-4 bg-amber-50 rounded-2xl flex items-center gap-3 border border-amber-200 mt-2 select-none" id="wizard-payment-safety-disclaimer">
                  <AlertTriangle className="w-5 h-5 text-[#FFB300] shrink-0" />
                  <p className="text-[11px] font-semibold text-amber-800 leading-relaxed font-sans">
                    Please ensure your Naitoken is funded for system automatic payment. System smart contracts settle escrow amounts securely.
                  </p>
                </div>
              </div>
            )}

            {/* PAGINATION PROGRESS BAR INDICATORS & ACTIONS CONTROL */}
            <div className="flex justify-between items-center border-t border-stone-150 pt-5 mt-3" id="wizard-navigation-actions-row">
              
              {/* Pagination Dots */}
              <div className="flex items-center gap-2 select-none" id="wizard-bullet-indicators">
                {[1, 2, 3, 4].map((stepIdx) => {
                  const isActive = collabWizardStep === stepIdx;
                  return (
                    <span 
                      key={stepIdx} 
                      className={`block w-2.5 h-2.5 rounded-full transition-all duration-300
                        ${isActive ? 'bg-[#FFB300] scale-120' : 'bg-stone-200'}`}
                      id={`wizard-dot-${stepIdx}`}
                    />
                  );
                })}
              </div>

              {/* Back / Next Chevron Button Controls */}
              <div className="flex gap-2" id="wizard-navigation-triggers">
                {collabWizardStep > 1 ? (
                  <button 
                    onClick={() => setCollabWizardStep(collabWizardStep - 1)}
                    className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition text-stone-600 cursor-pointer"
                    id="wizard-back-circle-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setCollabWizardStep(0)}
                    className="px-4 py-2 border border-stone-200 rounded-full hover:bg-stone-50 text-xs font-semibold text-stone-500 transition"
                  >
                    Cancel
                  </button>
                )}

                {collabWizardStep < 4 ? (
                  <button 
                    onClick={() => setCollabWizardStep(collabWizardStep + 1)}
                    className="w-10 h-10 rounded-full bg-stone-900 border border-stone-950 flex items-center justify-center text-white hover:bg-stone-850 transition cursor-pointer"
                    id="wizard-next-circle-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={handleFinishCollabWizard}
                    className="px-5 py-2.5 bg-stone-900 border border-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs rounded-full transition shadow-sm cursor-pointer whitespace-nowrap"
                    id="wizard-publish-btn"
                  >
                    Create Collaboration Request
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ HIGH-FIDELITY OVERLAY MODAL: SKILL REQUEST FORM */}
      {/* ========================================================================= */}
      {isSkillRequestActive && (
        <div className="fixed inset-0 bg-stone-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs" id="skill-request-modal-backdrop">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl text-left" id="skill-request-modal">
            
            {/* Close trigger button */}
            <button 
              onClick={() => setIsSkillRequestActive(false)}
              className="absolute right-5 top-5 font-bold text-stone-400 hover:text-stone-800 text-lg transition cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Brand */}
            <div className="mb-5" id="skill-req-bnd">
              <span className="text-[10px] font-mono tracking-widest uppercase font-black text-rose-600 block mb-1">SKILL REQUISITES</span>
              <h3 className="text-xl font-sans font-black text-stone-900">Skill Request</h3>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSkillRequest} className="flex flex-col gap-4.5" id="skill-request-form-element">
              
              <div className="flex flex-col gap-1.5" id="skill-inp-project-title">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="sk-title">Title</label>
                <input 
                  type="text" 
                  id="sk-title"
                  required
                  value={skillReqFormData.title}
                  onChange={(e) => setSkillReqFormData({ ...skillReqFormData, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-rose-400"
                  placeholder="Designing Logo, Landing Page review, icon set creation"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="skill-inp-brief-desc">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="sk-desc">Brief Description</label>
                <textarea 
                  id="sk-desc"
                  required
                  value={skillReqFormData.briefDescription}
                  onChange={(e) => setSkillReqFormData({ ...skillReqFormData, briefDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-rose-400 resize-none font-sans"
                  placeholder="Need immediate assistance with logo design for local channels..."
                />
              </div>

              <div className="flex flex-col gap-1.5" id="skill-inp-roles">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="sk-roles">Roles Needed</label>
                <input 
                  type="text" 
                  id="sk-roles"
                  required
                  value={skillReqFormData.roles}
                  onChange={(e) => setSkillReqFormData({ ...skillReqFormData, roles: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-rose-400"
                  placeholder="e.g. Graphic Designer, Logo Brand Specialist"
                />
              </div>

              <div className="grid grid-cols-2 gap-4" id="skill-req-row-length">
                <div className="flex flex-col gap-1.5" id="skill-inp-project-length">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="sk-length">Project Length</label>
                  <input 
                    type="text" 
                    id="sk-length"
                    required
                    value={skillReqFormData.projectLength}
                    onChange={(e) => setSkillReqFormData({ ...skillReqFormData, projectLength: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    placeholder="e.g. 3 Months"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="skill-inp-monetary">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500" htmlFor="wiz-comp">Monetary Compensation</label>
                  <input 
                    type="text" 
                    id="wiz-comp"
                    required
                    value={skillReqFormData.monetaryCompensation}
                    onChange={(e) => setSkillReqFormData({ ...skillReqFormData, monetaryCompensation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    placeholder="e.g. 100 Naitoken"
                  />
                </div>
              </div>

              {/* Warning box */}
              <div className="p-4 bg-amber-50 rounded-2xl flex items-center gap-3 border border-amber-200 mt-2 select-none" id="skill-req-payment-warning">
                <AlertTriangle className="w-5 h-5 text-[#FFB300] shrink-0" />
                <p className="text-[11px] font-semibold text-amber-800 leading-relaxed font-sans">
                  Please ensure your Naitoken is funded for system automatic payment. System smart contracts settle escrow amounts securely.
                </p>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex justify-end gap-3 border-t border-stone-150 pt-5 mt-3" id="skill-req-actions-bar">
                <button 
                  type="button" 
                  onClick={() => setIsSkillRequestActive(false)}
                  className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-500 rounded-full transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 border border-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs rounded-full transition shadow-sm cursor-pointer whitespace-nowrap"
                  id="skill-publish-btn"
                >
                  Create Skill Request
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
