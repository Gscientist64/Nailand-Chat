// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  region?: string;
  is_verified: boolean;
  interests: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  signupData: any | null;
  
  // Actions
  setSignupData: (data: any) => void;
  signup: (data: any) => Promise<any>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;  // Make sure this is here!
  updateInterests: (interests: string[]) => Promise<void>;
  updateRegion: (region: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      signupData: null,

      setSignupData: (data) => set({ signupData: data }),

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signup(data);
          set({ signupData: data, isLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Signup failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      login: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password, rememberMe);
          set({ 
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoading: false 
          });
          localStorage.setItem('accessToken', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refreshToken', response.refresh_token);
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      // GOOGLE LOGIN FUNCTION - MAKE SURE THIS EXISTS
      googleLogin: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.googleLogin(idToken);
          set({ 
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoading: false 
          });
          localStorage.setItem('accessToken', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refreshToken', response.refresh_token);
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Google login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateInterests: async (interests) => {
        set({ isLoading: true, error: null });
        try {
          await authService.updateInterests({ interests });
          const user = get().user;
          if (user) {
            set({ 
              user: { ...user, interests },
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to update interests', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateRegion: async (region) => {
        set({ isLoading: true, error: null });
        try {
          await authService.updateRegion({ region });
          const user = get().user;
          if (user) {
            set({ 
              user: { ...user, region },
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to update region', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authService.logout(refreshToken);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      loadUser: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken 
      })
    }
  )
);