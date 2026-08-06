import React, { useState, useEffect } from 'react';
import NaiLandLogo from './NaiLandLogo';
import { ActiveView, UserProfile } from '../types';
import { useAuth } from '../lib/AuthContext';
import { authApi } from '../lib/api';
import { ArrowLeft, Check, ShieldAlert, KeyRound, Mail, User, Eye, EyeOff } from 'lucide-react';

interface AuthFlowProps {
  initialView: ActiveView;
  onSuccess: () => void;
  onBackToHome: () => void;
  onLogInInstead: () => void;
}

export default function AuthFlow({ initialView, onSuccess, onBackToHome, onLogInInstead }: AuthFlowProps) {
  const auth = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<ActiveView>(initialView);

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);
  
  // Registration Inputs
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Confirmation Code Inputs (6-digit)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [confirmState, setConfirmState] = useState<'success' | 'error'>('success');
  const [resentNotice, setResentNotice] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendCode = async () => {
    if (!email) return;
    setIsResending(true);
    const err = await authApi.resendCode(email);
    setIsResending(false);
    if (!err) {
      setCode(['', '', '', '', '', '']);
      setResentNotice(true);
      setTimeout(() => setResentNotice(false), 3000);
    } else {
      setApiError(err);
    }
  };
  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    // Autofocus next input logic
    if (val && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Accordion Interests State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string>('Data Analyst');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Regions List
  const [selectedRegion, setSelectedRegion] = useState<string>('Africa');
  const regions = [
    { name: 'Africa', emoji: '🌍', members: '24k active collaborators' },
    { name: 'Asia', emoji: '🌏', members: '12k collaborators' },
    { name: 'Europe', emoji: '🇪🇺', members: '9k collaborators' },
    { name: 'North America', emoji: '🌎', members: '15k collaborators' },
    { name: 'South America', emoji: '🌎', members: '4k collaborators' }
  ];

  // Pass Reset flow helpers
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);

  const handleSendResetToken = async () => {
    if (!resetEmail) {
      setApiError('Please enter your email address');
      return;
    }
    setApiError(null);
    setIsSubmitting(true);
    const res = await authApi.forgotPassword({ email: resetEmail });
    setIsSubmitting(false);
    if (res.success) {
      setResetCodeSent(true);
    } else {
      setApiError(res.error || 'Failed to send reset token');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setApiError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setApiError('Passwords do not match');
      return;
    }
    if (resetCode.length !== 6) {
      setApiError('Please enter the 6-digit code from your email');
      return;
    }
    setApiError(null);
    setIsSubmitting(true);
    const res = await authApi.resetPassword({ email: resetEmail, code: resetCode, newPassword });
    setIsSubmitting(false);
    if (res.success) {
      alert('Password reset successful! You can now log in.');
      setCurrentView(ActiveView.LOGIN);
    } else {
      setApiError(res.error || 'Password reset failed');
    }
  };

  // Signup: validate first, then go to confirmation
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setApiError('You must agree to the terms');
      return;
    }
    setApiError(null);
    setIsSubmitting(true);
    const err = await auth.signup({ firstName, secondName, email, password });
    setIsSubmitting(false);
    if (err) {
      setApiError(err);
    } else {
      setCurrentView(ActiveView.CONFIRMATION_CODE);
    }
  };

  const handleConfirmCode = async () => {
    const entered = code.join('');
    setApiError(null);
    setIsSubmitting(true);
    const err = await auth.verifyCode(email, entered);
    setIsSubmitting(false);
    if (err) {
      setConfirmState('error');
      setApiError(err);
    } else {
      setConfirmState('success');
      setTimeout(() => {
        setCurrentView(ActiveView.INTERESTS);
      }, 600);
    }
  };

  const handleInterestsNext = () => {
    auth.updateUser({ interests: selectedInterests });
    setCurrentView(ActiveView.SUGGESTED_REGIONS);
  };

  const handleAccessDashboard = () => {
    auth.updateUser({ region: selectedRegion });
    onSuccess();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);
    const err = await auth.login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (err) {
      setApiError(err);
    } else {
      onSuccess();
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setApiError(null);
    setGoogleLoading(true);
    const err = await auth.googleSignIn();
    setGoogleLoading(false);
    if (err) {
      setApiError(err);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="bg-[#fdfcf9] min-h-screen text-stone-800 flex flex-col items-center justify-start py-8 px-4 font-sans select-none" id="auth-flow-root">
      
      {/* Small Back Chevron indicator */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between" id="auth-nav-top">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-800 transition cursor-pointer font-medium whitespace-nowrap"
          id="btn-auth-back-chevron"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </button>
        <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2.5 py-1 rounded" id="auth-flow-tag">
          SECURE BLOCKCHAIN GATEWAY
        </span>
      </div>

      {(currentView === ActiveView.SIGN_UP || currentView === ActiveView.LOGIN) ? (
        <div 
          className="relative bg-white border border-[#DBDBDB]/65 rounded-xl flex flex-col items-center justify-start z-10 transition-shadow hover:shadow-lg w-full max-w-[502px] mx-auto px-4 sm:px-8 md:px-10"
          style={{
            boxSizing: 'border-box',
            minHeight: currentView === ActiveView.SIGN_UP ? '956px' : '780px',
            borderWidth: '1px',
            borderColor: 'rgba(219, 219, 219, 0.6)',
            borderRadius: '12px',
            paddingTop: currentView === ActiveView.SIGN_UP ? '98px' : '65px',
            paddingBottom: '40px'
          }}
          id="auth-main-card"
        >
          {/* Soft Star decorative element simulated relative to card parent container offsets */}
          <div 
            className="absolute -right-24 top-10 pointer-events-none rounded-full w-[139px] h-[150px] bg-stone-300/40 mix-blend-multiply filter blur-3xl"
            style={{
              zIndex: 1
            }}
            id="soft-star-bg"
          />

          {currentView === ActiveView.SIGN_UP ? (
            <form 
              onSubmit={handleSignUpSubmit}
              className="flex flex-col items-start w-full relative z-10"
              style={{
                width: '422px',
                maxWidth: '100%',
                minHeight: '818px',
                gap: '41px'
              }}
              id="form-signup"
            >
            {/* Progress Bar */}
            <div 
              className="relative bg-[#DBDBDB] rounded-sm shrink-0 w-full"
              style={{
                width: '422px',
                maxWidth: '100%',
                height: '8px',
                borderRadius: '4px'
              }}
              id="signup-progress-bar"
            >
              {/* Rectangle 1 - progress tracker line */}
              <div 
                className="absolute bg-[#0D0C0C] rounded-md h-full"
                style={{
                  left: '-0.16%',
                  width: '24.84%', // left: -0.16% right: 75.16%
                  borderRadius: '8px'
                }}
                id="progress-indicator"
              />
            </div>

            {/* Frame 1 - main interactive form sequence */}
            <div 
              className="flex flex-col items-start w-full"
              style={{
                gap: '20px',
                width: '422px',
                maxWidth: '100%'
              }}
              id="signup-form-frame-1"
            >
              {/* Frame 2 - title layout */}
              <div 
                className="flex flex-row flex-wrap items-start content-start w-full justify-between"
                style={{
                  gap: '20px',
                  width: '422px',
                  maxWidth: '100%',
                  minHeight: '56px'
                }}
                id="signup-header-frame-2"
              >
                {/* Frame 26962 - text titles */}
                <div 
                  className="flex flex-col items-start shrink-0 text-left"
                  style={{
                    gap: '4px',
                    width: '291px',
                    maxWidth: '100%'
                  }}
                  id="signup-header-titles"
                >
                  <h2 
                    className="font-lora font-normal text-left"
                    style={{
                      width: '85px',
                      height: '30px',
                      fontSize: '24px',
                      lineHeight: '30px',
                      letterSpacing: '-0.0025em',
                      color: '#100F0F'
                    }}
                    id="signup-h2"
                  >
                    Sign up
                  </h2>
                  <p 
                    className="font-sans font-normal text-left"
                    style={{
                      width: '192px',
                      height: '22px',
                      fontSize: '14px',
                      lineHeight: '22px',
                      letterSpacing: '0.003em',
                      color: '#4C4949'
                    }}
                    id="signup-p"
                  >
                    Enter credentials to continue
                  </p>
                </div>

                {/* IMG-20250407-WA0035 4 - fallback branding logo container */}
                <div 
                  className="shrink-0 flex items-center justify-center bg-stone-50 rounded-xl overflow-hidden border border-stone-200/50 hover:bg-stone-100/80 transition"
                  style={{
                    width: '64px',
                    height: '54px'
                  }}
                  id="img-logo-wa0035"
                >
                  <NaiLandLogo size="sm" />
                </div>
              </div>

              <span 
                className="font-sans font-semibold text-center block w-full select-none"
                style={{
                  width: '422px',
                  maxWidth: '100%',
                  height: '16px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0.004em',
                  color: '#4C4949'
                }}
              >
                Create your account
              </span>

              {/* Sign in with Google */}
              {auth.isGoogleEnabled && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="flex flex-row justify-center items-center bg-[#F9F9F9] border border-[#DBDBDB] hover:bg-stone-100 active:scale-[0.98] transition rounded-xl cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      boxSizing: 'border-box',
                      padding: '8px 16px',
                      gap: '12px',
                      width: '422px',
                      maxWidth: '100%',
                      height: '48px',
                      borderRadius: '12px'
                    }}
                    id="signup-google-btn"
                  >
                    {googleLoading ? (
                      <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span
                      className="font-sans font-semibold text-center select-none whitespace-nowrap text-sm"
                      style={{ color: '#797575' }}
                    >
                      {googleLoading ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                  </button>

                  {/* Divider */}
                  <div
                    className="flex flex-row justify-center items-center w-full"
                    style={{ gap: '10px', width: '422px', maxWidth: '100%', height: '20px' }}
                  >
                    <div className="flex-1" style={{ border: '1px solid #DBDBDB' }} />
                    <span className="text-[11px] font-sans text-stone-400">or</span>
                    <div className="flex-1" style={{ border: '1px solid #DBDBDB' }} />
                  </div>
                </>
              )}

              {/* Text Input 1 (First name) */}
              <div 
                className="flex flex-col items-start w-full gap-1"
                style={{
                  width: '422px',
                  maxWidth: '100%',
                  height: '70px'
                }}
                id="signup-fn-box-frame"
              >
                <div className="flex flex-row items-center w-full" style={{ height: '24px' }}>
                  <label 
                    className="font-sans font-normal block w-full text-left"
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0.002em',
                      color: '#100F0F'
                    }}
                    htmlFor="inp-firstname"
                  >
                    First name
                  </label>
                </div>
                
                {/* Text Container */}
                <div 
                  className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                  style={{
                    boxSizing: 'border-box',
                    padding: '8px 16px',
                    gap: '8px',
                    height: '42px',
                    borderRadius: '8px'
                  }}
                >
                  <User className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                  <input 
                    type="text" 
                    id="inp-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans placeholder-stone-300 h-full"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              {/* Text Input 2 (Second name) */}
              <div 
                className="flex flex-col items-start w-full gap-1"
                style={{
                  width: '422px',
                  maxWidth: '100%',
                  height: '68px'
                }}
                id="signup-sn-box-frame"
              >
                <div className="flex flex-row items-center w-full" style={{ height: '24px' }}>
                  <label 
                    className="font-sans font-normal block w-full text-left"
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0.002em',
                      color: '#100F0F'
                    }}
                    htmlFor="inp-secondname"
                  >
                    Second name
                  </label>
                </div>
                
                {/* Text Container */}
                <div 
                  className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                  style={{
                    boxSizing: 'border-box',
                    padding: '8px 16px',
                    gap: '8px',
                    height: '40px',
                    borderRadius: '8px'
                  }}
                >
                  <User className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                  <input 
                    type="text" 
                    id="inp-secondname"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans placeholder-stone-300 h-full"
                    placeholder="Enter second name"
                    required
                  />
                </div>
              </div>

              {/* Text Input 3 (Email Address) */}
              <div 
                className="flex flex-col items-start w-full gap-1"
                style={{
                  width: '422px',
                  maxWidth: '100%',
                  height: '68px'
                }}
                id="signup-email-box-frame"
              >
                <div className="flex flex-row items-center w-full" style={{ height: '24px' }}>
                  <label 
                    className="font-sans font-normal block w-full text-left"
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0.002em',
                      color: '#100F0F'
                    }}
                    htmlFor="inp-email"
                  >
                    Email Address
                  </label>
                </div>
                
                {/* Text Container */}
                <div 
                  className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                  style={{
                    boxSizing: 'border-box',
                    padding: '8px 16px',
                    gap: '8px',
                    height: '40px',
                    borderRadius: '8px'
                  }}
                >
                  <Mail className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                  <input 
                    type="email" 
                    id="inp-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans placeholder-stone-300 h-full"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Text Input 4 (Protected Password) */}
              <div 
                className="flex flex-col items-start w-full gap-1"
                style={{
                  width: '422px',
                  maxWidth: '100%',
                  height: '68px'
                }}
                id="signup-pass-box-frame"
              >
                <div className="flex flex-row items-center w-full justify-between" style={{ height: '24px' }}>
                  <label 
                    className="font-sans font-normal block text-left"
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0.002em',
                      color: '#100F0F'
                    }}
                    htmlFor="inp-password"
                  >
                    Protected Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-stone-400 hover:text-stone-700 text-[11px] underline font-sans whitespace-nowrap"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                
                {/* Text Container */}
                <div 
                  className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                  style={{
                    boxSizing: 'border-box',
                    padding: '8px 16px',
                    gap: '8px',
                    height: '40px',
                    borderRadius: '8px'
                  }}
                >
                  <KeyRound className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="inp-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans h-full placeholder-stone-300"
                    placeholder="Create strong password"
                    required
                  />
                </div>
              </div>

              {/* Frame 12 - Checkbox / Agree Terms */}
              <div 
                className="flex flex-row items-center w-full select-none"
                style={{
                  gap: '8px',
                  width: '422px',
                  maxWidth: '100%',
                  height: '43px'
                }}
                id="checkbox-consent-row"
              >
                {/* Checkbox basic active checked */}
                <div 
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="w-6 h-6 shrink-0 flex items-center justify-center cursor-pointer rounded-sm border font-serif font-black transition text-stone-900 active:scale-90"
                  style={{
                    width: '24px',
                    height: '24px',
                    background: agreeTerms ? '#DBDBDB' : '#F4F4F4',
                    borderWidth: '1px',
                    borderColor: agreeTerms ? '#909090' : '#D7D7D7'
                  }}
                  id="agree-check-box"
                >
                  {agreeTerms && (
                    <span className="text-[12px] font-bold text-stone-950 font-sans">
                      ✓
                    </span>
                  )}
                </div>

                <span 
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="font-sans font-normal text-left cursor-pointer hover:underline"
                  style={{
                    width: '197px',
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0.004em',
                    color: '#797575'
                  }}
                  id="agree-lbl"
                >
                  Agree with the terms and condition
                </span>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="w-full text-center">
                  <span className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded">{apiError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex flex-row justify-center items-center py-3 px-6 gap-4 border border-[#100F0F] bg-[#FFC107] hover:bg-[#e0ac10] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#100F0F] rounded-[40px] cursor-pointer transition w-full active:scale-95 text-center"
                style={{
                  boxSizing: 'border-box',
                  width: '422px',
                  height: '48px'
                }}
                id="submit-signup-btn"
              >
                <span 
                  className="font-sans font-normal text-base leading-6 tracking-[0.002em] block text-center"
                  style={{
                    width: '75px',
                    height: '24px'
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Sign Up'}
                </span>
              </button>

              {/* Divider Line under Button */}
              <div 
                className="w-full shrink-0" 
                style={{
                  width: '422px',
                  height: '0px',
                  border: '1px solid #E3E8EF'
                }}
              />

              {/* Frame 13 - Switch to Login Link text */}
              <div 
                className="flex flex-col items-start w-full text-right"
                style={{
                  gap: '12px',
                  width: '422px',
                  maxWidth: '100%',
                  height: '22px'
                }}
              >
                <span 
                  className="font-sans font-normal text-right block w-full select-none"
                  style={{
                    width: '422px',
                    fontSize: '14px',
                    lineHeight: '22px',
                    letterSpacing: '0.003em',
                    color: '#4C4949'
                  }}
                >
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setCurrentView(ActiveView.LOGIN)} 
                    className="underline text-stone-950 hover:text-amber-500 font-bold font-sans cursor-pointer whitespace-nowrap"
                    id="btn-trigger-login-view"
                  >
                    Log In
                  </button>
                </span>
              </div>

            </div>
          </form>
          ) : (
            <form 
              onSubmit={handleLoginSubmit}
              className="flex flex-col items-start w-full relative z-10 font-sans"
              style={{
                width: '422px',
                maxWidth: '100%',
                minHeight: '600px',
                gap: '24px'
              }}
              id="form-login"
            >
              <div 
                className="flex flex-col items-start w-full"
                style={{
                  gap: '20px',
                  width: '422px',
                  maxWidth: '100%'
                }}
                id="login-form-frame"
              >
                {/* Header Title with Logo Row */}
                <div 
                  className="flex flex-row flex-wrap items-start content-start w-full justify-between"
                  style={{
                    gap: '20px',
                    width: '422px',
                    maxWidth: '100%',
                    minHeight: '56px'
                  }}
                  id="login-header-frame"
                >
                  <div 
                    className="flex flex-col items-start shrink-0 text-left"
                    style={{
                      gap: '4px',
                      width: '291px',
                      maxWidth: '100%'
                    }}
                    id="login-header-titles"
                  >
                    <h2 
                      className="font-lora font-normal text-left"
                      style={{
                        width: '85px',
                        height: '30px',
                        fontSize: '24px',
                        lineHeight: '30px',
                        letterSpacing: '-0.0025em',
                        color: '#100F0F'
                      }}
                      id="login-h2"
                    >
                      Log in
                    </h2>
                    <p 
                      className="font-sans font-normal text-left"
                      style={{
                        width: '240px',
                        height: '22px',
                        fontSize: '14px',
                        lineHeight: '22px',
                        letterSpacing: '0.003em',
                        color: '#4C4949'
                      }}
                      id="login-p"
                    >
                      Enter credentials to continue
                    </p>
                  </div>

                  <div 
                    className="shrink-0 flex items-center justify-center bg-stone-50 rounded-xl overflow-hidden border border-stone-200/50 hover:bg-stone-100/80 transition"
                    style={{
                      width: '64px',
                      height: '54px'
                    }}
                    id="img-login-logo"
                  >
                    <NaiLandLogo size="sm" />
                  </div>
                </div>

                <span 
                  className="font-sans font-semibold text-center block w-full select-none"
                  style={{
                    width: '422px',
                    maxWidth: '100%',
                    height: '16px',
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0.004em',
                    color: '#4C4949'
                  }}
                >
                  Sign in with your email
                </span>

                {/* Sign in with Google */}
                {auth.isGoogleEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="flex flex-row justify-center items-center bg-[#F9F9F9] border border-[#DBDBDB] hover:bg-stone-100 active:scale-[0.98] transition rounded-xl cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        boxSizing: 'border-box',
                        padding: '8px 16px',
                        gap: '12px',
                        width: '422px',
                        maxWidth: '100%',
                        height: '48px',
                        borderRadius: '12px'
                      }}
                      id="login-google-btn"
                    >
                      {googleLoading ? (
                        <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span
                        className="font-sans font-semibold text-center select-none whitespace-nowrap text-sm"
                        style={{ color: '#797575' }}
                      >
                        {googleLoading ? 'Connecting...' : 'Sign in with Google'}
                      </span>
                    </button>

                    {/* Divider */}
                    <div
                      className="flex flex-row justify-center items-center w-full"
                      style={{ gap: '10px', width: '422px', maxWidth: '100%', height: '20px' }}
                    >
                      <div className="flex-1" style={{ border: '1px solid #DBDBDB' }} />
                      <span className="text-[11px] font-sans text-stone-400">or</span>
                      <div className="flex-1" style={{ border: '1px solid #DBDBDB' }} />
                    </div>
                  </>
                )}

                {/* Email input field */}
                <div 
                  className="flex flex-col items-start w-full gap-1"
                  style={{
                    width: '422px',
                    maxWidth: '100%',
                    height: '68px'
                  }}
                  id="login-email-box-frame"
                >
                  <div className="flex flex-row items-center w-full" style={{ height: '24px' }}>
                    <label 
                      className="font-sans font-normal block w-full text-left"
                      style={{
                        fontSize: '16px',
                        lineHeight: '24px',
                        letterSpacing: '0.002em',
                        color: '#100F0F'
                      }}
                      htmlFor="inp-login-email-new"
                    >
                      Email Address
                    </label>
                  </div>
                  
                  <div 
                    className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                    style={{
                      boxSizing: 'border-box',
                      padding: '8px 16px',
                      gap: '8px',
                      height: '40px',
                      borderRadius: '8px'
                    }}
                  >
                    <Mail className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                    <input 
                      type="email" 
                      id="inp-login-email-new"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans placeholder-stone-300 h-full"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Password input field */}
                <div 
                  className="flex flex-col items-start w-full gap-1"
                  style={{
                    width: '422px',
                    maxWidth: '100%',
                    height: '68px'
                  }}
                  id="login-pass-box-frame"
                >
                  <div className="flex flex-row items-center w-full justify-between" style={{ height: '24px' }}>
                    <label 
                      className="font-sans font-normal block text-left"
                      style={{
                        fontSize: '16px',
                        lineHeight: '24px',
                        letterSpacing: '0.002em',
                        color: '#100F0F'
                      }}
                      htmlFor="inp-login-password-new"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-400 hover:text-stone-700 text-[11px] underline font-sans whitespace-nowrap"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  
                  <div 
                    className="flex flex-row items-center w-full border border-[#D7D7D7] rounded-md px-4 focus-within:border-[#100F0F] transition bg-[#FFFFFF]"
                    style={{
                      boxSizing: 'border-box',
                      padding: '8px 16px',
                      gap: '8px',
                      height: '40px',
                      borderRadius: '8px'
                    }}
                  >
                    <KeyRound className="w-6 h-6 shrink-0 text-[#141414]" style={{ strokeWidth: 1.5 }} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="inp-login-password-new"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-transparent text-sm border-none outline-none text-[#100F0F] font-sans h-full placeholder-stone-300"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                {/* Assist / Forgot password */}
                <div className="flex justify-between items-center w-full mt-1 px-1">
                  <button 
                    type="button"
                    onClick={() => setCurrentView(ActiveView.PASSWORD_RESET_CODE)}
                    className="text-xs text-amber-600 hover:text-amber-700 underline font-sans font-medium whitespace-nowrap"
                    id="btn-forgot-password-new"
                  >
                    Reset or Forgot Password?
                  </button>
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="w-full text-center mt-1">
                    <span className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded">{apiError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-row justify-center items-center py-3 px-6 gap-4 border border-[#100F0F] bg-[#FFC107] hover:bg-[#e0ac10] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#100F0F] rounded-[40px] cursor-pointer transition w-full active:scale-95 text-center mt-2 shadow-sm"
                  style={{
                    boxSizing: 'border-box',
                    width: '422px',
                    height: '48px'
                  }}
                  id="submit-login-btn-new"
                >
                  <span 
                    className="font-sans font-normal text-base leading-6 tracking-[0.002em] block text-center font-semibold"
                    style={{
                      width: '75px',
                      height: '24px'
                    }}
                  >
                    Log In
                  </span>
                </button>

                {/* Switch to Sign Up */}
                <div 
                  className="flex flex-col items-start w-full text-right mt-3"
                  style={{
                    gap: '12px',
                    width: '422px',
                    maxWidth: '100%',
                    height: '22px'
                  }}
                >
                  <span 
                    className="font-sans font-normal text-right block w-full select-none"
                    style={{
                      width: '422px',
                      fontSize: '14px',
                      lineHeight: '22px',
                      letterSpacing: '0.003em',
                      color: '#4C4949'
                    }}
                  >
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => setCurrentView(ActiveView.SIGN_UP)} 
                      className="underline text-stone-950 hover:text-amber-500 font-bold font-sans cursor-pointer whitespace-nowrap"
                      id="btn-trigger-signup-view"
                    >
                      Sign Up
                    </button>
                  </span>
                </div>

              </div>
            </form>
          )}
        </div>
      ) : (
        <div 
          className={
            currentView === ActiveView.CONFIRMATION_CODE
              ? "w-full max-w-[526px] min-w-0 bg-white border border-[#DBDBDB]/60 rounded-xl p-5 md:p-10 relative overflow-hidden transition-all duration-300 mx-auto"
              : (currentView === ActiveView.INTERESTS || currentView === ActiveView.SUGGESTED_REGIONS)
                ? "w-full max-w-[502px] bg-white border border-[#DBDBDB]/60 rounded-xl p-5 md:p-10 relative overflow-hidden transition-all duration-300 mx-auto"
                : "w-full max-w-md bg-white border border-stone-200/60 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 mx-auto"
          }
          style={{
            minHeight: currentView === ActiveView.CONFIRMATION_CODE 
              ? (confirmState === 'success' ? '446px' : '474px') 
              : undefined
          }}
          id="auth-main-card"
        >
          {/* ✦ Pointing Star in top right of cards on onboarding steps */}
          {(currentView === ActiveView.INTERESTS || currentView === ActiveView.SUGGESTED_REGIONS || currentView === ActiveView.CONFIRMATION_CODE) && (
            <svg 
              className="absolute top-5 right-5 w-6 h-6 text-stone-900 pointer-events-none select-none z-20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              id="star-badge-ornament"
            >
              <path d="M12 0c0 6.627-5.373 12-12 12 6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
            </svg>
          )}

          {/* Sits only on steps that do not require centered Nailand logo badge */}
          {!(currentView === ActiveView.INTERESTS || currentView === ActiveView.SUGGESTED_REGIONS || currentView === ActiveView.CONFIRMATION_CODE) ? (
            /* LOGO CONTAINER AT TOP OF EVERY SCREEN */
            <div className="flex justify-center mb-6" id="auth-logo-row">
              <NaiLandLogo size="md" />
            </div>
          ) : (currentView === ActiveView.INTERESTS || currentView === ActiveView.SUGGESTED_REGIONS) ? (
            /* ONBOARDING PROGRESS BAR */
            <div 
              className="relative bg-[#DBDBDB] rounded-sm shrink-0 w-full mb-8"
              style={{
                height: '8px',
                borderRadius: '4px'
              }}
              id="onboarding-top-progress-bar"
            >
              <div 
                className="absolute bg-[#0D0C0C] rounded-md h-full transition-all duration-500"
                style={{
                  left: '0%',
                  width: currentView === ActiveView.INTERESTS ? '60%' : '100%',
                  borderRadius: '8px'
                }}
                id="onboarding-progress-indicator"
              />
            </div>
          ) : null}

        {/* ======================================= */}
        {/* SCREEN 3: ENTER CONFIRMATION CODE MODAL */}
        {/* ======================================= */}
        {currentView === ActiveView.CONFIRMATION_CODE && (
          <div className="text-left relative z-10" id="confirmation-code-view">
            
            {/* Frame 1618875599: Row with Title Column and Brand Logo */}
            <div className="flex flex-row justify-between items-center gap-[40px] w-full mb-8" id="frame-1618875599">
              {/* Left Column: Frame 1618875598 */}
              <div className="flex flex-col items-start gap-2 max-w-[314px]" id="frame-1618875598">
                <h2 
                  className="font-sans font-normal text-[16px] leading-[24px] text-[#0D0C0C] select-none antialiased"
                  id="confirm-h2-pure"
                >
                  Enter confirmation code
                </h2>
                <p 
                  className="font-sans font-normal text-[14px] leading-[22px] text-[#888383]"
                  id="confirm-p-pure"
                >
                  A 4-digit code was sent to <span className="text-[#0D0C0C] font-semibold">{email || 'johnjoe@gmail.com'}</span>
                </p>
              </div>

              {/* Right Logo Graphic: IMG-20250407-WA0035 5 */}
              <div 
                className="w-[64px] h-[54px] shrink-0 overflow-hidden flex items-center justify-center bg-stone-50/20 border border-stone-200/50 rounded-lg p-0.5 shadow-sm"
                id="brand-mini-image-logo"
              >
                <NaiLandLogo size="sm" />
              </div>
            </div>

            {/* Frame 1618875594: 6-digit Input block */}
            <div className="flex flex-row justify-center items-center gap-3.5 mb-8" id="code-digits-row">
              {code.map((num, idx) => {
                const entered = code.join('');
                const isFull = entered.length === 6;
                
                // Border/Text class determination based on confirm state
                let borderClass = 'border-stone-200 text-[#0D0C0C] focus:border-stone-800 focus:ring-stone-800';
                if (confirmState === 'success' && isFull) {
                  borderClass = 'border-[#1C7C54] text-[#1C7C54] focus:ring-[#1C7C54]';
                } else if (confirmState === 'error') {
                  borderClass = 'border-[#C52233] text-[#C52233] focus:ring-[#C52233]';
                }

                return (
                  <div key={idx} className="relative" id={`frame-digit-container-${idx}`}>
                    <input
                      id={`digit-${idx}`}
                      type="text"
                      maxLength={1}
                      value={num}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !num && idx > 0) {
                          const prevInput = document.getElementById(`digit-${idx - 1}`);
                          prevInput?.focus();
                          
                          // Also clear the previous digit on backspace for convenience!
                          const newCode = [...code];
                          newCode[idx - 1] = '';
                          setCode(newCode);
                        }
                      }}
                      className={`w-[48px] h-[48px] text-center font-sans font-semibold text-[16px] leading-[22px] rounded-[12px] bg-white transition-all outline-none border focus:ring-1 ${borderClass}`}
                      style={{
                        color: (confirmState === 'success' && isFull) ? '#1C7C54' : confirmState === 'error' ? '#C52233' : '#0D0C0C'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Frame 1618875601: Button & Resend triggers */}
            <div className="flex flex-col items-center gap-3 w-full" id="frame-1618875601">
              
              {/* Resend Code: Option is always available to make it accessible to user */}
              <div 
                className="w-full text-center transition-all duration-300"
                id="resend-text-container"
              >
                <button 
                  type="button"
                  disabled={isResending}
                  onClick={handleResendCode}
                  className="text-[12px] leading-[16px] text-[#797575] font-sans hover:text-[#FFC107] transition-colors cursor-pointer select-none underline font-medium disabled:opacity-50"
                  id="resend-trigger-btn"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              </div>

              {resentNotice && (
                <div className="text-[11px] text-[#1C7C54] font-sans text-center transition-opacity" id="resend-toast-message">
                  ✓ A new verification code has been sent to your email.
                </div>
              )}

              {/* Informative error tips for wrong code configurations */}
              {((code.join('').length === 6 && confirmState !== 'success') || confirmState === 'error') && (
                <div className="text-[11px] text-[#C52233] font-sans text-center transition-all" id="wrong-code-error-message">
                  ⚠ Incorrect confirmation code. Please check your email and try again.
                </div>
              )}

              {/* Main yellow CTA button */}
              <button
                type="button"
                onClick={handleConfirmCode}
                className="w-full h-[40px] bg-[#FFC107] hover:bg-[#ffca28] font-sans font-medium text-[14px] leading-[22px] text-[#100F0F] rounded-[40px] focus:outline-none select-none active:scale-[0.98] transition-transform flex items-center justify-center whitespace-nowrap cursor-pointer shadow-sm mt-1"
                style={{
                  borderWidth: '1px 1px 2px 1px',
                  borderStyle: 'solid',
                  borderColor: '#100F0F',
                }}
                id="btn-confirm-code-submit"
              >
                Join Team
              </button>
            </div>

            {/* Soft Star decorative background ornament matching space coordinates */}
            <div 
              className="absolute bottom-[-15px] right-[-15px] w-[139px] h-[150px] opacity-[0.04] text-[#333333] pointer-events-none select-none z-0"
              id="soft-star-ornament"
              style={{
                transition: 'all 0.4s ease-in-out',
                transform: confirmState === 'error' ? 'translateY(-15px) rotate(12deg)' : 'none'
              }}
            >
              <svg viewBox="0 0 139 150" fill="currentColor" className="w-full h-full">
                <path d="M69.5 0C69.5 41.42 103.08 75 139 75C103.08 75 69.5 108.58 69.5 150C69.5 108.58 35.92 75 0 75C35.92 75 69.5 41.42 69.5 0Z" />
              </svg>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 4: PERSONALISE INTEREST ACCORDION   */}
        {/* ======================================= */}
        {currentView === ActiveView.INTERESTS && (
          <div className="text-left" id="personalise-interests-view">
            <h2 className="font-lora text-[24px] leading-[30px] font-normal text-stone-950 mb-1" id="interests-h2">Personalise your interest</h2>
            <p className="font-sans text-[14px] leading-[22px] text-stone-500 mb-6" id="interests-p">
              Choose your interest to best recommend you community
            </p>

            {/* Static list of structured onboarding interest categories */}
            <div className="flex flex-col gap-2.5 mb-8 max-h-[380px] overflow-y-auto pr-1" id="interests-accordion-root">
              {[
                {
                  id: 'Data Analyst',
                  emoji: '📊',
                  items: [
                    'Online Courses & E-Learning',
                    'Coding & Data Science',
                    'Language Learning',
                    'Mentorship & Skill Development',
                    'Research & Academic Innovation',
                    'Professional Development'
                  ]
                },
                {
                  id: 'Education & Learning',
                  emoji: '📚',
                  items: ['Digital Curriculum Design', 'E-Learning Architectures', 'Peer Tutoring', 'Academic Research Assistance']
                },
                {
                  id: 'Business & Entrepreneur',
                  emoji: '💼',
                  items: ['Startup Pitch Decking', 'Venture Capital Networks', 'Product Growth Strategy', 'Micro-gigs & Peer Jobs']
                },
                {
                  id: 'Wellness & Lifestyle',
                  emoji: '🌱',
                  items: ['Mental Support Forums', 'Fitness Routine Tracking', 'Mindful Habits Design']
                },
                {
                  id: 'Tech & Innovation',
                  emoji: '💻',
                  items: ['Decentralised Smart Contracts', 'AI Models Grounding', 'SaaS Fullstack Engineering']
                },
                {
                  id: 'Marketplace',
                  emoji: '🛒',
                  items: ['Service Exchange Contracts', 'Direct Skill Trading Hub', 'Digital Assets Storefront']
                },
                {
                  id: 'Spirituality',
                  emoji: '✨',
                  items: ['Mindfulness Devotion Circles', 'Philosophical Think Tanks', 'Inner Peace Meditations']
                }
              ].map((cat) => {
                const isOpen = expandedSection === cat.id;
                return (
                  <div key={cat.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white" id={`accordion-item-${cat.id}`}>
                    {/* Header Row Trigger */}
                    <button
                      type="button"
                      onClick={() => setExpandedSection(isOpen ? '' : cat.id)}
                      className="w-full bg-white hover:bg-stone-50/50 px-4 py-3.5 flex justify-between items-center text-[14px] font-semibold text-stone-800 transition-colors select-none"
                      id={`btn-accord-${cat.id}-toggle`}
                    >
                      <span className="font-sans text-[14px] text-stone-800 font-medium">
                        {cat.id} {cat.emoji}
                      </span>
                      {/* Arrow Caret caretIcon */}
                      <svg 
                        className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Collapsible Children Body */}
                    {isOpen && (
                      <div className="bg-white border-t border-stone-100 flex flex-col pt-1 pb-2" id={`accord-${cat.id}-children`}>
                        {cat.items.map((opt) => {
                          const isSelected = selectedInterests.includes(opt);
                          return (
                            <div 
                              key={opt}
                              onClick={() => toggleInterest(opt)}
                              className="flex items-center px-4 py-2.5 hover:bg-amber-50/45 cursor-pointer select-none transition-colors"
                              id={`item-choice-${opt}`}
                            >
                              {/* Concentric Circle Yellow Radio Button Selector */}
                              <div 
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition ${
                                  isSelected ? 'border-[#f8c21a]' : 'border-stone-300'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-[#f8c21a]" />
                                )}
                              </div>
                              <span className={`text-[13px] font-sans ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-500 font-normal'}`}>
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleInterestsNext}
              className="w-full bg-[#f8c21a] hover:bg-[#e0ac10] font-bold text-[#3c1d01] py-3 rounded-full text-xs shadow-md cursor-pointer text-center whitespace-nowrap transition transform active:scale-[0.98]"
              id="interests-btn-next"
            >
              Continue
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 5: SUGGESTED REGION SELECT LIST   */}
        {/* ======================================= */}
        {currentView === ActiveView.SUGGESTED_REGIONS && (
          <div className="text-left" id="suggested-regions-view">
            <h2 className="font-lora text-[24px] leading-[30px] font-normal text-stone-950 mb-1" id="region-h2">Suggested Region</h2>
            <p className="font-sans text-[14px] leading-[22px] text-stone-500 mb-6" id="region-p">
              These are suggested community / region based on your personalised interest
            </p>

            {/* Scrollable SUGGESTED ROOMS/CHANNELS checklist frame */}
            <div className="flex flex-col gap-2.5 mb-8 max-h-[380px] overflow-y-auto pr-1" id="regions-checklist">
              {[
                { id: 0, title: 'Program Prompt', desc: "Let's discuss computer language beyond normal limits." },
                { id: 1, title: 'UI/UX Design Studio', desc: "Collaborative wireframing, peer testing and Figma reviews." },
                { id: 2, title: 'Kampala Tech Lounge', desc: "Local peer hackathons, cloud-native deployments and demo events." },
                { id: 3, title: 'Startup Accelerator', desc: "Pitch deck reviews, MVP architecture planning and token economics." },
                { id: 4, title: 'Wellness Circle', desc: "Daily breathing, mental exercises and habits tracking for entrepreneurs." },
                { id: 5, title: 'Web3 Pioneers Uganda', desc: "Solidity smart contract security, token creation and deployment." }
              ].map((item, idx) => {
                // Initial loaded states: index 0 and 2 are active
                const isSelected = selectedInterests.some(sel => item.title.includes(sel)) || idx === 0 || idx === 2;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white transition flex justify-between items-center"
                    id={`region-option-${item.id}`}
                  >
                    <div className="flex flex-col pr-4" id={`region-txt-${item.id}`}>
                      <span className="text-sm font-semibold text-stone-900" id={`region-title-${item.id}`}>{item.title}</span>
                      <span className="text-[11px] text-stone-400 font-sans mt-0.5" id={`region-users-${item.id}`}>{item.desc}</span>
                    </div>
                    
                    {/* Circle Join Indicator toggle button on right */}
                    <div className="shrink-0 cursor-pointer transition active:scale-95 pr-1">
                      {isSelected ? (
                        /* Yellow tick circle selection */
                        <div className="w-6 h-6 rounded-full bg-[#f8c21a] flex items-center justify-center text-stone-950 shadow-sm font-black text-[12px] pb-[1px]">
                          ✓
                        </div>
                      ) : (
                        /* Dark black circle join button */
                        <div className="w-6 h-6 rounded-full bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-white shadow-sm font-bold text-[12px] pb-[1px]">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAccessDashboard}
              className="w-full bg-[#f8c21a] hover:bg-[#e0ac10] font-bold text-[#3c1d01] py-3 rounded-full text-xs shadow-md cursor-pointer text-center flex justify-center items-center gap-2 whitespace-nowrap transition transform active:scale-[0.98]"
              id="region-btn-confirm"
            >
              <span>Continue</span>
            </button>
          </div>
        )}



        {/* ======================================= */}
        {/* SCREEN 7: PASSWORD RESET TRIGGER MODAL */}
        {/* ======================================= */}
        {currentView === ActiveView.PASSWORD_RESET_CODE && (
          <div className="text-left" id="reset-modal-content">
            <h2 className="text-2xl font-serif text-stone-900 mb-1" id="reset-h2">Reset Password</h2>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed" id="reset-p">
              We will send a secure verification token to your registered mail to reset credentials safely.
            </p>

            {resetCodeSent ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-left" id="reset-sent-alert">
                <div className="flex gap-2 items-start" id="reset-alert-header">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div id="reset-alert-txt">
                    <span className="font-semibold text-xs text-amber-800" id="reset-sent-title">Reset token sent!</span>
                    <p className="text-[10px] text-amber-700 mt-1" id="reset-sent-body">
                      We've emailed a 6-digit code to <strong>{resetEmail}</strong>. Enter it below to continue.
                    </p>
                  </div>
                </div>

                {/* Code input */}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-3 w-full bg-white text-sm px-3 py-2.5 rounded-lg border border-amber-200 outline-none focus:border-[#f8c21a] transition tracking-[0.4em] text-center font-bold"
                  placeholder="••••••"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 mb-6" id="reset-email-wrapper">
                <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400" htmlFor="inp-reset-email">Email Address</label>
                <div id="wrapper-input-reset">
                  <input
                    type="email"
                    id="inp-reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-[#faf9f6]/80 text-xs px-3 py-2.5 rounded-lg border border-stone-100 outline-none focus:border-[#f8c21a] transition"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>
            )}

            {/* API error display */}
            {apiError && (
              <div className="mb-4 text-center">
                <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded">{apiError}</span>
              </div>
            )}

            {resetCodeSent ? (
              <button
                onClick={() => setCurrentView(ActiveView.NEW_PASSWORD)}
                className="w-full bg-[#f8c21a] hover:bg-[#e0ac10] font-bold text-[#3c1d01] py-3 rounded-full text-xs shadow cursor-pointer text-center whitespace-nowrap"
                id="btn-go-newpass"
              >
                Continue to Reset
              </button>
            ) : (
              <button
                onClick={handleSendResetToken}
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-full text-xs cursor-pointer text-center whitespace-nowrap disabled:opacity-50"
                id="btn-dispatchemail"
              >
                {isSubmitting ? 'Sending...' : 'Send Verification Token'}
              </button>
            )}

            <button
              onClick={() => setCurrentView(ActiveView.LOGIN)}
              className="mt-4 block w-full text-center text-[10px] text-stone-400 hover:text-stone-700 whitespace-nowrap"
              id="lnk-reset-backlogin"
            >
              Cancel and Back
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 8: RESET PASSWORD INPUTS         */}
        {/* ======================================= */}
        {currentView === ActiveView.NEW_PASSWORD && (
          <div className="text-left" id="new-password-view">
            <h2 className="text-2xl font-serif text-stone-900 mb-1" id="newpass-h2">New Password</h2>
            <p className="text-xs text-stone-400 mb-6" id="newpass-p">Create a secure, unforgettable passphrase word</p>

            <div className="flex flex-col gap-1 mb-3.5" id="newpass-inp1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400" htmlFor="np-1">New Password</label>
              <input 
                type="password" 
                id="np-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#faf9f6]/80 text-xs px-3 py-2.5 rounded-lg border border-stone-100 outline-none focus:border-[#f8c21a] transition"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex flex-col gap-1 mb-6" id="newpass-inp2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400" htmlFor="np-2">Confirm New Password</label>
              <input 
                type="password" 
                id="np-2"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-[#faf9f6]/80 text-xs px-3 py-2.5 rounded-lg border border-stone-100 outline-none focus:border-[#f8c21a] transition"
                placeholder="••••••••••••"
              />
            </div>

            {apiError && (
              <div className="mb-4 text-center">
                <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded">{apiError}</span>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={isSubmitting}
              className="w-full bg-[#f8c21a] hover:bg-[#e0ac10] font-bold text-[#3c1d01] py-3 rounded-full text-xs shadow cursor-pointer text-center whitespace-nowrap disabled:opacity-50"
              id="btn-save-newpass"
            >
              {isSubmitting ? 'Resetting...' : 'Save & Log In'}
            </button>
          </div>
        )}

      </div>
      )}

      {/* ======================================= */}
    </div>
  );
}
