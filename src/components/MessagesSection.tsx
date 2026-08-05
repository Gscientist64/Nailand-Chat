import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatMessage } from '../types';
import { messagesApi, tasksApi } from '../lib/api';
import { Send, Paperclip, Mic, Search, Check, ThumbsUp, FileText, CheckSquare, Square, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagesSectionProps {
  threads: ChatThread[];
  setThreads: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  initialChatWith?: string;
  initialAvatar?: string;
  clearDirectChatTrigger?: () => void;
}

export default function MessagesSection({ 
  threads, 
  setThreads, 
  activeThreadId, 
  setActiveThreadId, 
  initialChatWith, 
  initialAvatar,
  clearDirectChatTrigger
}: MessagesSectionProps) {
  // Filter active chat threads Category
  const [activeCategory, setActiveCategory] = useState<'all' | 'community' | 'chat'>('all');
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Custom typing indicator tracker
  const [isTyping, setIsTyping] = useState<string | null>(null);

  // Scroll anchor reference
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle direct message pass on load and flush the router trigger params
  useEffect(() => {
    if (initialChatWith) {
      const match = threads.find(t => t.name === initialChatWith);
      if (match) {
        setActiveThreadId(match.id);
      }
      clearDirectChatTrigger?.();
    }
  }, [initialChatWith, clearDirectChatTrigger]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (!activeThreadId) return;
    setMessagesLoading(true);
    messagesApi.getMessages(activeThreadId).then((res) => {
      if (res.success && res.data) {
        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: res.data.map((m: any) => ({
                id: m.id,
                threadId: m.threadId,
                sender: m.sender || 'User',
                senderId: m.senderId,
                avatar: m.avatar || '',
                content: m.content,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                isMe: m.senderId === localStorage.getItem('nailand_user_id'),
                createdAt: m.createdAt,
              })),
            };
          }
          return t;
        }));
      }
      setMessagesLoading(false);
    });
  }, [activeThreadId]);

  const [messageText, setMessageText] = useState('');

  // Countdowns ticking calculations: Days:Hours:Mins:Seconds
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 55,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Shared task checklists from API
  const [tasks, setTasks] = useState<any[]>([]);

  // Fetch tasks for the active thread
  useEffect(() => {
    if (!activeThreadId) return;
    tasksApi.getTasks(activeThreadId).then((res) => {
      if (res.success && res.data) {
        setTasks(res.data);
      }
    });
  }, [activeThreadId]);

  const toggleTask = async (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
    await tasksApi.toggleTask(id);
  };

  // Find active thread
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  // Scroll to bottom helper
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll on mount and when active thread changes or messages list updates
  useEffect(() => {
    scrollToBottom('auto');
  }, [activeThreadId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeThread?.messages?.length, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentThreadId = activeThreadId;
    const textToSend = messageText;

    // Optimistically add message to UI
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      threadId: currentThreadId,
      sender: 'Me',
      senderId: 'me',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setThreads(prev => prev.map(t => {
      if (t.id === currentThreadId) {
        return {
          ...t,
          lastMessage: textToSend,
          timeString: 'Just now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    setMessageText('');

    // Send via API
    await messagesApi.sendMessage(currentThreadId, textToSend);
  };

  // Filter threads
  const filteredThreads = threads.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-60px)] md:h-[calc(100vh-60px)] font-sans" id="messages-section-root">
      
      {/* LEFT CHATS THREADS PANEL */}
      <div className="w-full md:w-80 h-full border-r border-stone-100 flex flex-col bg-stone-50/40 shrink-0" id="threads-lhs-panel">
        
        {/* Dynamic header row filter tabs */}
        <div className="p-4 border-b border-stone-100 flex flex-col gap-3 text-left" id="threads-header-wrap">
          <span className="text-[9px] font-mono tracking-widest text-[#ea580c] font-bold">CONVERSATIONS</span>
          <h3 className="font-serif font-bold text-sm text-stone-900">Workspace Chats</h3>
          
          <div className="flex border border-stone-200 rounded-lg p-0.5 text-[10px] font-semibold bg-stone-100/50" id="threads-tabs">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`flex-1 py-1.5 rounded cursor-pointer transition whitespace-nowrap ${activeCategory === 'all' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-450 hover:text-stone-600'}`}
              id="chat-tab-all"
            >
              All
            </button>
            <button 
              onClick={() => setActiveCategory('community')}
              className={`flex-1 py-1.5 rounded cursor-pointer transition whitespace-nowrap ${activeCategory === 'community' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-450 hover:text-stone-600'}`}
              id="chat-tab-community"
            >
              Chambers
            </button>
            <button 
              onClick={() => setActiveCategory('chat')}
              className={`flex-1 py-1.5 rounded cursor-pointer transition whitespace-nowrap ${activeCategory === 'chat' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-450 hover:text-stone-600'}`}
              id="chat-tab-direct"
            >
              Direct Chats
            </button>
          </div>
        </div>

        {/* List of active threads */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-left" id="threads-scrollable">
          {filteredThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-3.5 rounded-2xl flex gap-3 cursor-pointer select-none transition-all duration-300
                  ${isActive 
                    ? 'bg-amber-50/60 border border-amber-200/50 shadow-sm' 
                    : 'hover:bg-stone-50 border border-transparent'}`}
                id={`thread-item-${thread.id}`}
              >
                {/* Thread Avatar graphic */}
                <div className="shrink-0" id={`thread-avatar-frame-${thread.id}`}>
                  {thread.avatar.startsWith('http') ? (
                    <img className="w-10 h-10 rounded-full object-cover border border-stone-200" src={thread.avatar} alt={thread.name} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shadow-inner">
                      {thread.avatar}
                    </div>
                  )}
                </div>

                {/* Text descripts */}
                <div className="flex-1 overflow-hidden" id={`thread-meta-desc-${thread.id}`}>
                  <div className="flex justify-between items-baseline mb-0.5" id="thread-nm-row">
                    <span className="font-serif font-bold text-xs text-stone-900 truncate">{thread.name}</span>
                    <span className="text-[8px] font-mono text-stone-400 shrink-0">{thread.timeString}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 truncate leading-relaxed" id={`thread-last-msg-${thread.id}`}>
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MIDDLE PANEL: CHAT INTERACTIVE BOARD */}
      <div className="flex-1 h-full flex flex-col bg-white" id="middle-chat-lobby">
        {/* Chat partner header rows */}
        <div className="px-5 py-4.5 border-b border-stone-100 flex justify-between items-center bg-white/50 backdrop-blur-md shrink-0" id="chat-receiver-header">
          <div className="flex items-center gap-2.5 text-left" id="receiver-meta">
            {activeThread.avatar.startsWith('http') ? (
              <img className="w-9 h-9 rounded-full object-cover" src={activeThread.avatar} alt={activeThread.name} referrerPolicy="no-referrer" />
            ) : (
              <span className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-lg flex items-center justify-center">{activeThread.avatar}</span>
            )}
            <div className="flex flex-col" id="receiver-titles">
              <span className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1">
                <span>{activeThread.name}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" id="dot-alive"></span>
              </span>
              <span className="text-[9px] font-mono text-emerald-600">Verified Peer • Active Workspace Channel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2" id="header-action-indicators">
            <span className="text-[8px] font-mono bg-amber-50 text-amber-900 border border-amber-100 rounded px-2 py-0.5">
              SECURE MESSAGE SHA-256
            </span>
          </div>
        </div>

        {/* Conversation Bubbles Scroller */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-stone-50/20" id="conversation-bubbles-window">
          {activeThread.messages.map((ms) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              key={ms.id}
              className={`flex gap-2.5 max-w-[75%] ${ms.isMe ? 'self-end flex-row-reverse text-right' : 'self-start text-left'}`}
              id={`bubble-${ms.id}`}
            >
              {/* Message avatar */}
              <img className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-200/50" src={ms.avatar} alt={ms.sender} referrerPolicy="no-referrer" />
              
              <div className="flex flex-col gap-0.5" id={`bubble-box-${ms.id}`}>
                <span className="text-[8px] font-mono text-stone-400 pl-1">{ms.sender}</span>
                
                <div 
                  className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm
                    ${ms.isMe 
                      ? 'bg-amber-100 border border-amber-200 text-stone-900 rounded-tr-none' 
                      : 'bg-white border border-stone-200/60 text-stone-700 rounded-tl-none'}`}
                >
                  {ms.content}
                </div>
                
                <span className="text-[8px] font-mono text-stone-300 pr-1 mt-0.5">{ms.time}</span>
              </div>
            </motion.div>
          ))}

          {isTyping === activeThread.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 max-w-[75%] self-start text-left"
              id="typing-indicator"
            >
              <img className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-200/50" src={activeThread.avatar} alt={activeThread.name} referrerPolicy="no-referrer" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-stone-400 pl-1">{activeThread.name}</span>
                <div className="bg-white border border-stone-200/60 p-3 py-2.5 rounded-2xl rounded-tl-none text-[11px] text-stone-400 flex items-center gap-1.5 shadow-sm">
                  <span className="font-mono text-[9px] uppercase tracking-wider">Typing</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Messages inputs form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-100 bg-white/70 backdrop-blur shrink-0" id="messages-form">
          <div className="flex items-center bg-stone-50 border border-stone-200/80 rounded-full px-4.5 py-2.5 shadow-inner focus-within:border-amber-400 transition" id="messages-input-row">
            
            <button type="button" className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer whitespace-nowrap" id="btn-msg-clip">
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              placeholder={`Write message to ${activeThread.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none text-xs text-stone-700 px-3.5"
              id="message-input-text"
            />

            <div className="flex items-center gap-2">
              <button type="button" className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer whitespace-nowrap" id="btn-msg-mic">
                <Mic className="w-4 h-4" />
              </button>
              
              <button 
                type="submit" 
                className="p-2 bg-[#f8c21a] hover:bg-stone-950 hover:text-white rounded-full text-stone-900 transition cursor-pointer shadow-sm whitespace-nowrap"
                id="btn-msg-send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* RIGHT PANEL: CODES WORKSPACE STATUS RAIL */}
      <aside className="hidden lg:flex w-72 h-full border-l border-stone-100 flex-col bg-white overflow-y-auto p-5 shrink-0" id="workspace-rhs-rail">
        <div className="border-b border-stone-50 pb-4 mb-4 text-left" id="workspace-rail-hdr">
          <span className="text-[8px] font-mono tracking-widest text-[#ea580c] font-bold">WORKSPACE MATRIX</span>
          <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 mt-0.5">
            <span>Mobile App Product</span>
            <Sparkles className="w-3.5 h-3.5 text-[#f8c21a] animate-pulse" />
          </h4>
        </div>

        {/* Interactive ticking countdown layout block exactly like target design */}
        <div className="bg-stone-950 text-white rounded-2xl border border-stone-900 p-4 text-left mb-5 shadow-lg" id="ticking-countdown-box">
          <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest block mb-1.5">COLLAB DELIVERY COUNTDOWN</span>
          
          <div className="grid grid-cols-4 gap-1 text-center font-mono select-none" id="ticking-numbers-grid">
            <div className="bg-stone-900 border border-white/5 p-2 rounded-lg" id="cntd-d">
              <strong className="text-sm font-bold block text-[#f8c21a]" id="val-days">
                {String(timeLeft.days).padStart(2, '0')}
              </strong>
              <span className="text-[7px] text-stone-500 uppercase tracking-wide">Days</span>
            </div>
            <div className="bg-stone-900 border border-white/5 p-2 rounded-lg" id="cntd-h">
              <strong className="text-sm font-bold block text-white" id="val-hours">
                {String(timeLeft.hours).padStart(2, '0')}
              </strong>
              <span className="text-[7px] text-stone-500 uppercase tracking-wide font-medium">Hours</span>
            </div>
            <div className="bg-stone-900 border border-white/5 p-2 rounded-lg" id="cntd-m">
              <strong className="text-sm font-bold block text-white" id="val-mins">
                {String(timeLeft.minutes).padStart(2, '0')}
              </strong>
              <span className="text-[7px] text-stone-500 uppercase tracking-wide">Mins</span>
            </div>
            <div className="bg-stone-900 border border-white/5 p-2 rounded-lg" id="cntd-s">
              <strong className="text-sm font-bold block text-[#ef4444] animate-pulse" id="val-secs">
                {String(timeLeft.seconds).padStart(2, '0')}
              </strong>
              <span className="text-[7px] text-stone-500 uppercase tracking-wide">Secs</span>
            </div>
          </div>
        </div>

        {/* Progress Bar and Metra */}
        <div className="mb-5 text-left" id="workspace-prod-progress">
          <div className="flex justify-between items-baseline text-[10px] text-stone-500 font-mono mb-1.5" id="val-perc-lbl">
            <span>WORK PRODUCT INTEGRITY</span>
            <strong className="text-stone-800 font-medium">82% completed</strong>
          </div>
          
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden" id="bar-back">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Collab checklist interactive card tasks layout */}
        <div className="mb-5 text-left" id="workspace-checklist-block">
          <span className="text-[8px] font-mono tracking-widest text-stone-400 uppercase font-bold block mb-2">SHARED COLLAB TASKS</span>
          
          <div className="flex flex-col gap-2" id="checklist-tasks">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-2 cursor-pointer select-none group"
                onClick={() => toggleTask(task.id)}
                id={`task-row-${task.id}`}
              >
                {task.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-300 group-hover:text-amber-500 shrink-0" />
                )}
                <span className={`text-[10px] leading-relaxed transition ${task.checked ? 'text-stone-400 line-through' : 'text-stone-600 font-medium'}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Links documentation assets list panel */}
        <div className="text-left" id="workspace-shared-assets">
          <span className="text-[8px] font-mono tracking-widest text-stone-400 uppercase font-bold block mb-2">SHARED MEDIA & FILES</span>
          
          <div className="flex flex-col gap-2" id="shared-assets-rows">
            <div className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-155 rounded-xl flex items-center gap-2.5 cursor-pointer" id="pdf-asset-card">
              <FileText className="w-6 h-6 text-rose-500 shrink-0" />
              <div className="flex flex-col overflow-hidden text-left" id="pdf-lbl">
                <span className="text-[9px] font-bold text-stone-800 truncate">figma-buddies-wireframes.pdf</span>
                <span className="text-[7px] text-stone-400 font-mono">4.2 MB • Adobe Reader Draft</span>
              </div>
            </div>

            <div className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-155 rounded-xl flex items-center gap-2.5 cursor-pointer" id="zip-asset-card">
              <FileText className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="flex flex-col overflow-hidden text-left" id="zip-lbl">
                <span className="text-[9px] font-bold text-stone-800 truncate">nailand-brand-guidelines.zip</span>
                <span className="text-[7px] text-stone-400 font-mono">12.8 MB • WinZip Archive Asset</span>
              </div>
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
}
