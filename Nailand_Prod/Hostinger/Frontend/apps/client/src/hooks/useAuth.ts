// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { initializeGoogleOneTap, promptGoogleOneTap } from '../lib/firebase';

export const useAuth = () => {
  const navigate = useNavigate();
  const store = useAuthStore();
  
  const { 
    user, 
    isLoading, 
    error, 
    login, 
    signup,
    googleLogin,
    updateInterests,
    updateRegion,
    logout,
    clearError,
    setSignupData,
    signupData
  } = store;

  // Initialize Google One Tap
  useEffect(() => {
    initializeGoogleOneTap(async (credential) => {
      console.log('One Tap credential received, sending to backend...');
      try {
        await googleLogin(credential);
        console.log('Google login successful, navigating to dashboard...');
        navigate('/dashboard', {
          state: { 
            success: true, 
            message: 'Google login successful! Welcome to NaiLand Metaverse!' 
          }
        });
      } catch (error: any) {
        console.error('Google login error:', error);
      }
    });
  }, []);

  const handleGoogleLogin = () => {
    console.log('Prompting Google One Tap...');
    promptGoogleOneTap();
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard', { 
        state: { 
          success: true, 
          message: 'Login successful! Welcome back to NaiLand Metaverse!' 
        } 
      });
    } catch (error) {
      // Error handled in store
    }
  };

  const handleSignup = async (formData: any, currentStep: number) => {
    if (currentStep === 1) {
      try {
        const response = await signup(formData);
        console.log('Raw signup response:', response);
        return response;
      } catch (error) {
        console.error('Signup error in hook:', error);
        throw error;
      }
    }
  };

  const handleUpdateInterests = async (interests: string[]) => {
    try {
      await updateInterests(interests);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateRegion = async (region: string) => {
    try {
      await updateRegion(region);
      navigate('/dashboard', { 
        state: { 
          success: true, 
          message: 'Account created successfully! Welcome to NaiLand Metaverse!' 
        } 
      });
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signupData,
    login: handleLogin,
    signup: handleSignup,
    googleLogin: handleGoogleLogin,
    logout: handleLogout,
    updateInterests: handleUpdateInterests,
    updateRegion: handleUpdateRegion,
    clearError,
    setSignupData
  };
};