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

export interface ChatMessage {
  id: string;
  threadId?: string;
  sender: string;
  senderId?: string;
  avatar: string;
  content: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
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
  unreadCount?: number;
  isCommunity?: boolean;
  communityId?: string;
  createdAt?: string;
}

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
}

export interface SkillRequest {
  id: string;
  title: string;
  description: string;
  roles: string[];
  projectLength: string;
  monetary: string;
}

export interface CommunityFeedPost {
  id: string;
  author: string;
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
}
