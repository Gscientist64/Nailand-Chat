// components/ForgotPasswordForm.tsx
import React, { useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo/logo.png';

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
    // Handle password reset logic here
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div 
      className="bg-white"
      style={{
        width: '502px',
        minWidth: '300px',
        height: 'auto',
        minHeight: '450px',
        background: '#FFFFFF',
        border: '1px solid rgba(219, 219, 219, 0.6)',
        borderRadius: '12px',
        padding: '30px 40px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src={logo} alt="NaiLand" className="w-[70px] h-auto" />
      </div>

      {!isSubmitted ? (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="w-full font-semibold py-3 text-sm rounded-full transition mt-4 hover:bg-yellow-500"
              style={{ 
                backgroundColor: '#fdc416',
                color: '#1a1a1a',
              }}
            >
              Send Reset Instructions
            </button>

            {/* Back to Login */}
            <button 
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-center text-sm font-medium hover:underline mt-2"
              style={{ color: '#fdc416' }}
            >
              ← Back to Login
            </button>
          </form>
        </>
      ) : (
        // Success State
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Check Your Email
            </h1>
            <p className="text-gray-600 text-sm">
              We've sent password reset instructions to <span className="font-semibold">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="font-medium hover:underline"
                style={{ color: '#fdc416' }}
              >
                try again
              </button>
            </p>

            <button 
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-center text-sm font-medium hover:underline"
              style={{ color: '#fdc416' }}
            >
              ← Back to Login
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;