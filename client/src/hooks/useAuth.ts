// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { getGoogleIdToken } from '../lib/firebase';

export const useAuth = () => {
  const navigate = useNavigate();
  const store = useAuthStore(); // Get the entire store
  
  // Destructure AFTER getting the store
  const { 
    user, 
    isLoading, 
    error, 
    login, 
    signup,
    googleLogin,  // Make sure this is included
    updateInterests,
    updateRegion,
    logout,
    clearError,
    setSignupData,
    signupData
  } = store;

  const handleGoogleLogin = async () => {
    console.log('1. handleGoogleLogin called');
    try {
      console.log('2. Getting Google ID token...');
      const idToken = await getGoogleIdToken();
      console.log('3. Got ID token, calling store.googleLogin...');
      await googleLogin(idToken);
      console.log('4. Google login successful, navigating to dashboard...');
      navigate('/dashboard', {  // Changed from '/' to '/dashboard'
        state: { 
          success: true, 
          message: 'Google login successful! Welcome to NaiLand Metaverse!' 
        } 
      });
    } catch (error: any) {
      console.error('5. Google login failed:', error);
    }
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      await login(email, password, rememberMe);
      // Redirect to dashboard which has the game
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
        
        // Return the response directly - don't modify it
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
      // Redirect to dashboard which has the game
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

  // Return ALL the functions, including googleLogin
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signupData,
    login: handleLogin,
    signup: handleSignup,
    googleLogin: handleGoogleLogin,  // This is the key!
    logout: handleLogout,
    updateInterests: handleUpdateInterests,
    updateRegion: handleUpdateRegion,
    clearError,
    setSignupData
  };
};