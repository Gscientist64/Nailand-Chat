// ============================================================
// NaiLand API Client
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

// Get stored JWT token
export function getToken(): string | null {
  return localStorage.getItem('nailand_token');
}

// Store JWT token
export function setToken(token: string): void {
  localStorage.setItem('nailand_token', token);
}

// Remove JWT token
export function clearToken(): void {
  localStorage.removeItem('nailand_token');
}

// Core fetch wrapper
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: { auth?: boolean }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.auth !== false) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json: ApiResponse<T> = await res.json();

    if (!res.ok) {
      return { success: false, error: json.error || `Request failed with status ${res.status}` };
    }

    return json;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  signup: (data: { firstName: string; secondName: string; email: string; password: string; interests?: string[]; region?: string }) =>
    request<{ user: any; token: string }>('POST', '/api/auth/signup', data, { auth: false }),

  login: (data: { email: string; password: string }) =>
    request<{ user: any; token: string }>('POST', '/api/auth/login', data, { auth: false }),

  verifyCode: (data: { email: string; code: string }) =>
    request('POST', '/api/auth/verify-code', data, { auth: false }),

  getMe: () => request<any>('GET', '/api/auth/me'),

  forgotPassword: (data: { email: string }) =>
    request('POST', '/api/auth/forgot-password', data, { auth: false }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    request('POST', '/api/auth/reset-password', data, { auth: false }),
};

// ============================================================
// Users API
// ============================================================
export const usersApi = {
  getProfile: (id: string) => request<any>('GET', `/api/users/${id}`),
  list: () => request<any[]>('GET', '/api/users'),
  updateProfile: (data: { firstName?: string; secondName?: string; interests?: string[]; region?: string; avatarUrl?: string }) =>
    request<any>('PUT', '/api/users/profile', data),
};

// ============================================================
// Communities API
// ============================================================
export const communitiesApi = {
  list: () => request<any[]>('GET', '/api/communities'),
  get: (id: string) => request<any>('GET', `/api/communities/${id}`),
  create: (data: { name: string; description: string; avatar: string; tags?: string[] }) =>
    request<any>('POST', '/api/communities', data),
  join: (id: string) => request<any>('POST', `/api/communities/${id}/join`),
};

// ============================================================
// Messages API
// ============================================================
export const messagesApi = {
  getThreads: () => request<any[]>('GET', '/api/messages/threads'),
  getMessages: (threadId: string) => request<any[]>('GET', `/api/messages/threads/${threadId}/messages`),
  createThread: (data: { name: string; avatar?: string; participantIds: string[]; category?: 'chat' | 'community' }) =>
    request<any>('POST', '/api/messages/threads', data),
  sendMessage: (threadId: string, content: string) =>
    request<any>('POST', `/api/messages/threads/${threadId}/messages`, { content }),
};

// ============================================================
// Feeds API
// ============================================================
export const feedsApi = {
  getPosts: (communityId: string) => request<any[]>('GET', `/api/feeds/${communityId}`),
  createPost: (communityId: string, data: { content: string; images?: string[]; videoUrl?: string }) =>
    request<any>('POST', `/api/feeds/${communityId}`, data),
  likePost: (postId: string) => request<any>('POST', `/api/feeds/${postId}/like`),
  getOffers: () => request<any[]>('GET', '/api/feeds/offers/all'),
  createOffer: (data: any) => request<any>('POST', '/api/feeds/offers', data),
  getSkillRequests: () => request<any[]>('GET', '/api/feeds/skill-requests/all'),
  createSkillRequest: (data: any) => request<any>('POST', '/api/feeds/skill-requests', data),
};

// ============================================================
// Tasks API
// ============================================================
export const tasksApi = {
  getTasks: (threadId: string) => request<any[]>('GET', `/api/tasks/${threadId}`),
  createTask: (threadId: string, text: string) =>
    request<any>('POST', `/api/tasks/${threadId}`, { text }),
  toggleTask: (id: string) => request<any>('PATCH', `/api/tasks/${id}/toggle`),
  deleteTask: (id: string) => request<any>('DELETE', `/api/tasks/${id}`),
};

// ============================================================
// WebSocket client
// ============================================================
let socketInstance: WebSocket | null = null;
let socketReconnectTimer: ReturnType<typeof setTimeout> | null = null;

type MessageHandler = (data: any) => void;
type TypingHandler = (data: { threadId: string; userId: string; isTyping: boolean }) => void;
type OnlineHandler = (data: { userId: string; online: boolean }) => void;

const messageListeners: Set<MessageHandler> = new Set();
const typingListeners: Set<TypingHandler> = new Set();
const onlineListeners: Set<OnlineHandler> = new Set();

// Socket.IO client using HTTP long-polling fallback via fetch
// For now we use REST API for messages; WebSocket can be added later
// This is a placeholder that will connect when the server is ready
export const wsClient = {
  connect: () => {
    // WebSocket connection will be established when Socket.IO client is added
    console.log('WebSocket client ready (REST fallback active)');
  },

  joinThread: (_threadId: string) => {
    // Placeholder
  },

  sendMessage: async (threadId: string, content: string) => {
    const res = await messagesApi.sendMessage(threadId, content);
    return res;
  },

  onMessage: (handler: MessageHandler) => {
    messageListeners.add(handler);
    return () => messageListeners.delete(handler);
  },

  onTyping: (handler: TypingHandler) => {
    typingListeners.add(handler);
    return () => typingListeners.delete(handler);
  },

  onOnline: (handler: OnlineHandler) => {
    onlineListeners.add(handler);
    return () => onlineListeners.delete(handler);
  },

  disconnect: () => {
    if (socketReconnectTimer) clearTimeout(socketReconnectTimer);
    socketInstance = null;
  },
};
