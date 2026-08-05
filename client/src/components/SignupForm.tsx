// frontend/src/components/SignupForm.tsx
// frontend/src/components/SignupForm.tsx
import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import logo from '../assets/images/logo/logo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onClose?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeTerms: false,
    region: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // ✅ CORRECT: Call useAuth() once inside the component
  const { 
    signup, 
    googleLogin,  // Now this is included
    isLoading, 
    error, 
    clearError, 
    signupData 
  } = useAuth();
  
  const navigate = useNavigate();

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [currentStep, countdown]);

  // Reset countdown when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      setCountdown(120);
      setCanResend(false);
    }
  }, [currentStep]);

  // Check if step 1 is valid
  const isStep1Valid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.agreeTerms === true &&
      formData.password.length >= 8
    );
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (password.length >= 8 && strengthCount >= 4) {
      setPasswordStrength('strong');
    } else if (password.length >= 8 && strengthCount >= 2) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({...formData, password: newPassword});
    checkPasswordStrength(newPassword);
  };

  // Clear error when component unmounts or step changes
  useEffect(() => {
    if (clearError) {
      clearError();
    }
    setLocalError(null);
  }, [currentStep, clearError]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpdateRegion = async (region: string) => {
    console.log('Updating region:', region);
    return Promise.resolve();
  };

  // API functions
  const verifyEmail = async (email: string, code: string) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Verification failed');
    }
    
    return response.json();
  };

  const resendCode = async (email: string) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to resend code');
    }
    
    return response.json();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setLocalError('Please enter the 6-digit code');
      return;
    }
    
    setLocalError(null);
    try {
      const response = await verifyEmail(formData.email, verificationCode);
      if (response.message === "Email verified successfully") {
        handleNext(); // Go to step 3
      } else {
        setLocalError('Invalid verification code');
      }
    } catch (error: any) {
      setLocalError(error.message || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    setLocalError(null);
    try {
      await resendCode(formData.email);
      setCountdown(120);
      setCanResend(false);
      alert('Verification code resent! Please check your email.');
    } catch (error: any) {
      setLocalError(error.message || 'Failed to resend code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (currentStep === 1) {
      // Validate Step 1
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setLocalError('Please fill in all fields');
        return;
      }
      if (formData.password.length < 8) {
        setLocalError('Password must be at least 8 characters');
        return;
      }
      if (!formData.agreeTerms) {
        setLocalError('You must agree to the terms and conditions');
        return;
      }
      
      try {
        console.log('Submitting signup data:', {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          agree_terms: formData.agreeTerms
        });
        
        // Try direct fetch to see the actual error
        const directResponse = await fetch('http://localhost:8000/api/v1/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            agree_terms: formData.agreeTerms
          })
        });
        
        console.log('Direct fetch status:', directResponse.status);
        
        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.error('Direct fetch error:', errorText);
          setLocalError(`Server error: ${directResponse.status}`);
          return;
        }
        
        const directData = await directResponse.json();
        console.log('Direct fetch response:', directData);
        
        // Now try with your signup function
        const response = await signup({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          agree_terms: formData.agreeTerms
        });
        
        console.log('Signup function response:', response);
        
        if (response && response.detail) {
          const codeMatch = response.detail.match(/\d{6}/);
          const verificationCode = codeMatch ? codeMatch[0] : 'check your email';
          alert(`Signup successful! Verification code: ${verificationCode}`);
          handleNext();
        } else {
          alert('Signup successful! Please check your email for verification code.');
          handleNext();
        }
      } catch (error: any) {
        console.error('Full error object:', error);
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          setLocalError('Cannot connect to server. Make sure backend is running on http://localhost:8000');
        } else if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          setLocalError(error.response.data?.detail || `Server error: ${error.response.status}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          setLocalError('No response from server. Check if backend is running.');
        } else {
          // Something happened in setting up the request
          setLocalError(error.message || 'Signup failed');
        }
      }
    } else if (currentStep === 4) {
      try {
        if (formData.region) {
          await handleUpdateRegion(formData.region);
        }
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' } 
        });
      } catch (error: any) {
        setLocalError(error.message || 'Failed to complete signup');
      }
    } else {
      handleNext();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
      
      if (index === 5 && value && newCode.every(digit => digit !== '')) {
        setTimeout(() => handleVerify(), 100);
      }
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="bg-white"
      style={{
        width: '502px',
        minWidth: '300px',
        height: 'auto',
        minHeight: '680px',
        background: '#FFFFFF',
        border: '1px solid rgba(219, 219, 219, 0.6)',
        borderRadius: '12px',
        padding: '30px 40px 40px 40px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo at the top */}
      <div className="flex justify-center mb-3">
        <img src={logo} alt="NaiLand" className="w-[70px] h-auto" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-xs">
          <span className="text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: '#fdc416'
            }}
          />
        </div>
      </div>

      {/* Error message display */}
      {(error || localError) && (
        <div className="text-red-500 text-sm text-center mb-2">
          {error || localError}
        </div>
      )}

      {/* Content area - no scroll */}
      <div className="flex-1 flex flex-col">
        {/* Step 1: Account Creation */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>Sign up</h1>
              <p className="text-gray-600 text-xs">Enter credentials to continue</p>
            </div>

            {/* Social Sign In */}
            <div className="space-y-2 mb-3">
            <button 
              type="button"
              onClick={async () => {
                try {
                  await googleLogin();
                } catch (err) {
                  // Error is handled in store and displayed via the error state
                  console.error('Google sign-in error:', err);
                }
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 px-3 hover:bg-gray-50 transition text-sm disabled:opacity-50"
            >
              <FcGoogle className="text-lg" />
              <span className="font-medium text-gray-700">
                {isLoading ? 'Processing...' : 'Sign up with Google'}
              </span>
            </button>
                          
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs text-gray-500">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="John"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Joe"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="johndoe@example.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder="********"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password && passwordStrength && (
                  <div className="mt-1">
                    <div className="flex gap-1 h-1">
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'weak' ? 'bg-red-500' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    </div>
                    <p className={`text-xs mt-1 ${
                      passwordStrength === 'weak' ? 'text-red-500' : 
                      passwordStrength === 'medium' ? 'text-yellow-600' : 
                      passwordStrength === 'strong' ? 'text-green-600' : ''
                    }`}>
                      {passwordStrength === 'weak' && 'Weak password'}
                      {passwordStrength === 'medium' && 'Medium strength password'}
                      {passwordStrength === 'strong' && 'Strong password'}
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: '#fdc416' }}
                  required
                />
                <span className="text-xs text-gray-600">
                  Agree with the <a href="#" className="hover:underline" style={{ color: '#fdc416' }}>terms and condition</a>
                </span>
              </label>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!isStep1Valid() || isLoading}
                className="w-full font-semibold py-3 text-sm rounded-full transition mt-4 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#fdc416',
                  color: '#1a1a1a',
                }}
              >
                {isLoading ? 'Processing...' : 'Next: Confirmation'}
              </button>
              
              {/* Margin bottom space after Next button */}
              <div className="h-4"></div>
            </div>
          </form>
        )}

        {/* Step 2: Enter Confirmation Code */}
        {currentStep === 2 && (
          <div className="space-y-5 flex flex-col h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Enter Code</h2>
              <p className="text-gray-600 text-sm">
                We've sent a code to <span className="font-semibold">{formData.email}</span>
              </p>
            </div>

            {/* Code Input Fields */}
            <div className="flex justify-center gap-3 my-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              ))}
            </div>

            {/* Timer/Resend */}
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>Code expires in <span className="font-semibold">{formatCountdown()}</span></p>
              {canResend ? (
                <button 
                  onClick={handleResendCode}
                  className="mt-2 font-medium hover:underline"
                  style={{ color: '#fdc416' }}
                >
                  Resend Code
                </button>
              ) : (
                <p className="mt-2 text-gray-400">Resend code in {formatCountdown()}</p>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 text-sm rounded-full hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={code.some(digit => !digit) || isLoading}
                className="flex-1 font-semibold py-3 text-sm rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#fdc416',
                  color: '#1a1a1a',
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            {/* Margin bottom space */}
            <div className="h-4"></div>
          </div>
        )}

        {/* Step 3: Personalize Interests */}
        {currentStep === 3 && (
          <div className="space-y-4 flex flex-col h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>Your Interests</h2>
              <p className="text-gray-600 text-sm">Select topics you're interested in</p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              {['Technology', 'Design', 'Business', 'Marketing', 'Development', 'AI/ML', 'Data Science', 'Blockchain'].map((interest) => (
                <label key={interest} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm">
                  <input type="checkbox" className="w-4 h-4" style={{ accentColor: '#fdc416' }} />
                  <span className="text-gray-700">{interest}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 text-sm rounded-full hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 font-semibold py-3 text-sm rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#fdc416',
                  color: '#1a1a1a',
                }}
              >
                {isLoading ? 'Processing...' : 'Next'}
              </button>
            </div>
            
            {/* Margin bottom space */}
            <div className="h-4"></div>
          </div>
        )}

        {/* Step 4: Suggested Region */}
        {currentStep === 4 && (
          <div className="space-y-4 flex flex-col h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>Suggested Region</h2>
              <p className="text-gray-600 text-sm">These are suggested community / region based on your personalised interest.</p>
            </div>

            <div className="space-y-2 my-3">
              {[
                { name: 'North America', flag: '🇺🇸', communities: '24 communities' },
                { name: 'Europe', flag: '🇪🇺', communities: '18 communities' },
                { name: 'Asia Pacific', flag: '🌏', communities: '32 communities' },
                { name: 'Latin America', flag: '🌎', communities: '15 communities' },
                { name: 'Africa', flag: '🌍', communities: '12 communities' },
                { name: 'Middle East', flag: '🕌', communities: '9 communities' }
              ].map((region) => (
                <label 
                  key={region.name} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    formData.region === region.name ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="region" 
                    value={region.name}
                    checked={formData.region === region.name}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-4 h-4"
                    style={{ accentColor: '#fdc416' }}
                  />
                  <span className="text-xl mr-1">{region.flag}</span>
                  <div className="flex-1">
                    <span className="text-gray-700 text-sm font-medium">{region.name}</span>
                    <span className="text-gray-500 text-xs ml-2">{region.communities}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 text-sm rounded-full hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!formData.region || isLoading}
                className="flex-1 font-semibold py-3 text-sm rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#fdc416',
                  color: '#1a1a1a',
                }}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm pt-2">
              Already have an account?   <Link to="/login" className="font-medium hover:underline" style={{ color: '#fdc416' }}>Log in</Link>
            </p>
            
            {/* Margin bottom space */}
            <div className="h-4"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupForm;