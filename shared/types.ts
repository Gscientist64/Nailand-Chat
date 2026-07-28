// ============================================================
// SHARED TYPES — Used by both frontend (React) and backend (Express)
// ============================================================

// --- Enums ---
export enum ActiveView {
  LANDING = 'LANDING',
  SIGN_UP = 'SIGN_UP',
  CONFIRMATION_CODE = 'CONFIRMATION_CODE',
  INTERESTS = 'INTERESTS',
  SUGGESTED_REGIONS = 'SUGGESTED_REGIONS',
  LOGIN = 'LOGIN',
  PASSWORD_RESET_CODE = 'PASSWORD_RESET_CODE',
  NEW_PASSWORD = 'NEW_PASSWORD',
  APP_LAYOUT = 'APP_LAYOUT'
}

export type DashboardTab = 'dashboard' | 'messages' | 'community' | 'help' | 'logout';

// --- Users ---
export interface UserProfile {
  id: string;
  firstName: string;
  secondName: string;
  email: string;
  interests: string[];
  region: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  threadId: string;
  sender: string;
  senderId: string;
  avatar: string;
  content: string;
  time: string;
  isMe: boolean;
  createdAt?: string;
}

export interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timeString: string;
  category: 'all' | 'community' | 'chat';
  messages: ChatMessage[];
  status?: string;
  isCommunity?: boolean;
  communityId?: string;
}

// --- Communities ---
export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  tags?: string[];
  createdAt?: string;
}

export interface CommunityMember {
  userId: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  joinedAt: string;
}

// --- Skills & Collaboration ---
export interface SkillNeedCard {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  text: string;
  compensation: string;
}

export interface CollabOffer {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  roles: string[];
  collaboratorsCount: number;
  projectLength: string;
  commitment: string;
  monetary: string;
  skillExchange: string;
  creator: string;
  creatorAvatar: string;
  createdAt?: string;
}

export interface SkillRequest {
  id: string;
  title: string;
  description: string;
  roles: string[];
  projectLength: string;
  monetary: string;
  createdAt?: string;
  creatorId?: string;
}

// --- Feed ---
export interface CommunityFeedPost {
  id: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  rating: number;
  timeAgo: string;
  content: string;
  image?: string;
  videoUrl?: string;
  images?: string[];
  attachmentTypes?: string[];
  likes: number;
  comments: number;
  shares: number;
  saved?: boolean;
  createdAt?: string;
  communityId?: string;
}

// --- Tasks ---
export interface Task {
  id: number;
  threadId: string;
  text: string;
  checked: boolean;
  createdBy: string;
  createdAt: string;
}

// --- API Response wrapper ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
