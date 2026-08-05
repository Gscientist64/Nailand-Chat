import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import CollaborationFeed from './components/CollaborationFeed';
import SkillsSection from './components/SkillsSection';
import Web3Community from './components/Web3Community';
import WalletSection from './components/WalletSection';
import GetStarted from './components/GetStarted';
import Footer from './components/Footer';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import Community from './components/Community';
import './global.css';

const About = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold">About Page Coming Soon!</h1>
  </div>
);

const Pages = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold">Pages Coming Soon!</h1>
  </div>
);

const FeaturesWeb3 = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold">Web3 Features Coming Soon!</h1>
  </div>
);

const FeaturesCollaboration = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold">Collaboration Features Coming Soon!</h1>
  </div>
);

const FeaturesCommunity = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold">Community Features Coming Soon!</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard — no Header */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Messages — no Header */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Community — no Header (add later) */}
        <Route path="/community" element={
          <ProtectedRoute>
           <Community />
          </ProtectedRoute>
        } />

        {/* All other routes — with Header */}
        <Route path="/*" element={
          <div className="min-h-screen bg-white font-sans text-gray-900">
            <Header />
            <Routes>

              {/* Home */}
              <Route path="/" element={
                <>
                  <Hero />
                  <CollaborationFeed />
                  <SkillsSection />
                  <Web3Community />
                  <WalletSection />
                  <GetStarted />
                  <Footer />
                </>
              } />

              {/* Navigation pages */}
              <Route path="/about" element={<About />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/features/web3" element={<FeaturesWeb3 />} />
              <Route path="/features/collaboration" element={<FeaturesCollaboration />} />
              <Route path="/features/community" element={<FeaturesCommunity />} />

              {/* Auth pages */}
              <Route path="/signup" element={
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                  <SignupForm />
                </div>
              } />

              <Route path="/login" element={
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                  <LoginForm />
                </div>
              } />

              <Route path="/forgot-password" element={
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                  <ForgotPasswordForm />
                </div>
              } />

            </Routes>
          </div>
        } />

      </Routes>
    </Router>
  );
}

export default App;