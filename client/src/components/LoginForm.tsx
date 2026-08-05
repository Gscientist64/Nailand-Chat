// components/LoginForm.tsx
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineMail } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo/logo.png';
import { useAuth } from '../hooks/useAuth'; // Add this import

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // Get auth functions from hook
  const { login, googleLogin, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Validate
    if (!formData.email || !formData.password) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      // Redirect happens in the hook
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleGoogleClick = async () => {
    try {
      await googleLogin();
      // Redirect happens in the hook
    } catch (err: any) {
      setLocalError(err.message || 'Google login failed');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div 
      className="bg-white"
      style={{
        width: '502px',
        minWidth: '300px',
        height: 'auto',
        minHeight: '580px',
        background: '#FFFFFF',
        border: '1px solid rgba(219, 219, 219, 0.6)',
        borderRadius: '12px',
        padding: '30px 40px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo at the top */}
      <div className="flex justify-center mb-4">
        <img src={logo} alt="NaiLand" className="w-[70px] h-auto" />
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Welcome Back
        </h1>
        <p className="text-gray-600 text-sm">Login to continue your journey</p>
      </div>

      {/* Error display */}
      {(error || localError) && (
        <div className="text-red-500 text-sm text-center mb-4">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Social Sign In */}
        <div className="space-y-3">
          <button 
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-xl" />
            <span className="text-gray-700">
              {isLoading ? 'Processing...' : 'Continue with Google'}
            </span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500">or login with email</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john.doe@example.com"
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-medium hover:underline"
              style={{ color: '#fdc416' }}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#fdc416' }}
            disabled={isLoading}
          />
          <span className="text-sm text-gray-600">Remember me for 30 days</span>
        </label>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold py-3 text-sm rounded-full transition mt-4 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: '#fdc416',
            color: '#1a1a1a',
          }}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 text-sm pt-4">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={handleSignUp}
            className="font-medium hover:underline"
            style={{ color: '#fdc416' }}
            disabled={isLoading}
          >
            Sign up for free
          </button>
        </p>

        {/* Terms and Privacy */}
        <p className="text-center text-xs text-gray-500 pt-4">
          By signing in, you agree to our{' '}
          <a href="#" className="hover:underline" style={{ color: '#fdc416' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="hover:underline" style={{ color: '#fdc416' }}>Privacy Policy</a>
        </p>

        {/* Bottom spacing */}
        <div className="h-2"></div>
      </form>
    </div>
  );
};

export default LoginForm;