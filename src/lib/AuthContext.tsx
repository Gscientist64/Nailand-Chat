import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setToken, clearToken, getToken } from './api';
import type { UserProfile } from '../../shared/types';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (data: { firstName: string; secondName: string; email: string; password: string; interests?: string[]; region?: string }) => Promise<string | null>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      authApi.getMe().then((res) => {
        if (res.success && res.data) {
          setUser({
            id: res.data.id,
            firstName: res.data.firstName,
            secondName: res.data.secondName,
            email: res.data.email,
            interests: res.data.interests || [],
            region: res.data.region || 'Africa',
            avatarUrl: res.data.avatarUrl,
          });
          localStorage.setItem('nailand_user_id', res.data.id);
        } else {
          clearToken();
          setTokenState(null);
          localStorage.removeItem('nailand_user_id');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setTokenState(res.data.token);
      setUser({
        id: res.data.user.id,
        firstName: res.data.user.firstName,
        secondName: res.data.user.secondName,
        email: res.data.user.email,
        interests: res.data.user.interests || [],
        region: res.data.user.region || 'Africa',
        avatarUrl: res.data.user.avatarUrl,
      });
      localStorage.setItem('nailand_user_id', res.data.user.id);
      return null;
    }
    return res.error || 'Login failed';
  }, []);

  const signup = useCallback(async (data: { firstName: string; secondName: string; email: string; password: string; interests?: string[]; region?: string }): Promise<string | null> => {
    const res = await authApi.signup(data);
    if (res.success && res.data) {
      setToken(res.data.token);
      setTokenState(res.data.token);
      setUser({
        id: res.data.user.id,
        firstName: res.data.user.firstName,
        secondName: res.data.user.secondName,
        email: res.data.user.email,
        interests: res.data.user.interests || [],
        region: res.data.user.region || 'Africa',
        avatarUrl: res.data.user.avatarUrl,
      });
      return null;
    }
    return res.error || 'Signup failed';
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<string | null> => {
    const res = await authApi.verifyCode({ email, code });
    if (res.success) return null;
    return res.error || 'Verification failed';
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('nailand_user_id');
  }, []);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        verifyCode,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
