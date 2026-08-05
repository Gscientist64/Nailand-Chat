// src/services/auth.service.ts
import { api } from './api';

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  agree_terms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface UpdateInterestsData {
  interests: string[];
}

export interface UpdateRegionData {
  region: string;
}

export const authService = {
  // Sign up
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Login
  login: async (email: string, password: string, rememberMe: boolean) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe
    });
    return response.data;
  },

  // GOOGLE LOGIN - MAKE SURE THIS EXISTS
  googleLogin: async (idToken: string) => {
    const response = await api.post('/auth/google', { id_token: idToken });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update interests
  updateInterests: async (data: UpdateInterestsData) => {
    const response = await api.put('/users/me/interests', data);
    return response.data;
  },

  // Update region
  updateRegion: async (data: UpdateRegionData) => {
    const response = await api.put('/users/me/region', data);
    return response.data;
  },

  // Get all available interests
  getInterests: async () => {
    const response = await api.get('/users/interests');
    return response.data;
  },

  // Get all available regions
  getRegions: async () => {
    const response = await api.get('/users/regions');
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string) => {
    const response = await api.post(`/auth/logout?refresh_token=${refreshToken}`);
    return response.data;
  }
};