// frontend/src/services/dashboard.service.ts
import { api } from './api';

export type Collaboration = {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string;
  required_skills: string[];
  budget_min?: number;
  budget_max?: number;
  duration_days?: number;
  views_count: number;
  engagements_count: number;
  created_at: string;
}

export type SkillRequest = {
  id: string;
  user_id: string;
  user_name: string;
  skill_name: string;
  description: string;
  payment_min?: number;
  payment_max?: number;
  created_at: string;
}

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  actions: string[];
  is_read: boolean;
  created_at: string;
}

export type MapPin = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  created_at: string;
}

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  region?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  rating: number;
  skills: Array<{ skill_name: string; proficiency_level: number; years_experience: number }>;
  interests: string[];
}

export type DashboardStats = {
  collaborations: number;
  skill_requests: number;
  notifications: number;
  skills: number;
  rating: number;
}

export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get trending collaborations
  getTrendingCollabs: async (limit: number = 10): Promise<Collaboration[]> => {
    const response = await api.get('/dashboard/trending-collabs', { params: { limit } });
    return response.data;
  },

  // Get skills needed
  getSkillsNeeded: async (limit: number = 20, interest?: string): Promise<SkillRequest[]> => {
    const response = await api.get('/dashboard/skills-needed', { params: { limit, interest } });
    return response.data;
  },

  // Get user notifications
  getNotifications: async (unreadOnly: boolean = false, limit: number = 20): Promise<Notification[]> => {
    const response = await api.get('/dashboard/notifications', { params: { unread_only: unreadOnly, limit } });
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await api.post(`/dashboard/notifications/${notificationId}/read`);
  },

  // Get map pins
  getMapPins: async (category?: string): Promise<MapPin[]> => {
    const response = await api.get('/dashboard/map-pins', { params: { category } });
    return response.data;
  },

  // Create map pin
  createMapPin: async (pinData: { title: string; description?: string; latitude: number; longitude: number; category?: string }): Promise<MapPin> => {
    const response = await api.post('/dashboard/map-pins', pinData);
    return response.data;
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/dashboard/user-profile');
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put('/dashboard/user-profile', profileData);
    return response.data;
  },

  // Update user skills
  updateUserSkills: async (skills: Array<{ skill_name: string; proficiency_level: number; years_experience: number }>): Promise<any> => {
    const response = await api.put('/dashboard/user-skills', { skills });
    return response.data;
  },

  // Search users
  searchUsers: async (query: string, searchType: 'name' | 'interest' | 'skill', limit: number = 10): Promise<any[]> => {
    const response = await api.get('/dashboard/search-users', { params: { q: query, search_type: searchType, limit } });
    return response.data;
  },

  // Create collaboration
  createCollaboration: async (collabData: { title: string; description: string; required_skills: string[]; budget_min?: number; budget_max?: number; duration_days?: number }): Promise<Collaboration> => {
    const response = await api.post('/dashboard/collaborations', collabData);
    return response.data;
  },

  // Create skill request
  createSkillRequest: async (requestData: { skill_name: string; description: string; payment_min?: number; payment_max?: number }): Promise<SkillRequest> => {
    const response = await api.post('/dashboard/skill-requests', requestData);
    return response.data;
  }
};