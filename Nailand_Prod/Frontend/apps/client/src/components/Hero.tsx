// Hero.jsx
import avatar1 from '../assets/images/avatars/avatar1.png';
import avatar2 from '../assets/images/avatars/avatar2.png';
import avatar3 from '../assets/images/avatars/avatar3.png';
import avatar4 from '../assets/images/avatars/avatar4.png';
import mainImage from '../assets/images/mainImage/image.png';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Hero = () => {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      setShowSuccess(true);
      // Clear the state so message doesn't show again on refresh
      window.history.replaceState({}, document.title);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  return (
    <main className="hero">
      {/* Success Toast Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="member-stack">
        <div className="avatars">
          <img src={avatar1} alt="Profile 1" />
          <img src={avatar2} alt="Profile 2" />
          <img src={avatar3} alt="Profile 3" />
          <img src={avatar4} alt="Profile 4" />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
          <strong>55k members</strong> already waiting for you
        </div>
      </div>

      <h1>A Decentralized Future Powered By Communal Prosperity.</h1>
      <p>Join the community, collaborate, exchange skills, and own your future</p>
      

      <div className="composition-container">
        {/* Card 1: Favour John */}
        <div className="float-card card-collab">
          <div className="card-header">
            <img 
              src={avatar4} 
              style={{ borderRadius: '50%', width: '24px', marginRight: '8px' }} 
              alt="Favour John" 
            />
            Favour John
          </div>
          <div className="card-desc">I will like to collaborate with you</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-sm" 
              style={{ background: '#fdc416', color: '#000' }}
            >
              Accept collaboration
            </button>
            <button 
              className="btn-sm" 
              style={{ background: 'transparent', color: '#666' }}
            >
              Decline
            </button>
          </div>
        </div>

        {/* Card 2: Hello Afolabi */}
        <div className="float-card card-wallet">
          <div className="card-header">Hello Afolabi <span>👋</span></div>
          <div className="card-desc">20k NaiToken has just been deposited in your NaiWallet</div>
          <div className="status-row">
            <div className="dot bg-green"></div> 
            1.5% token value
          </div>
        </div>

        {/* Main Image */}
        <div className="main-image-wrapper">
          <div className="tilt-bg"></div>
          <img src={mainImage} alt="Main User" />

          <div className="card-profile-overlay">
            <div style={{ fontFamily: 'serif', fontWeight: '600', fontSize: '1.1rem' }}>
              Damilola O.
            </div>
            <div className="status-row" style={{ marginTop: '4px' }}>
              <i className="ph ph-device-mobile"></i> Mobile App Developer
            </div>
          </div>
        </div>

        {/* Card 3: NFT Community */}
        <div className="float-card card-nft">
          <div className="card-header">NFT Community</div>
          <div className="card-desc">22K Comment on your recent post in the community</div>
          <div className="status-row">
            <div className="dot bg-green"></div> 
            Open to collaboration
          </div>
        </div>

        {/* Card 4: First Contribution */}
        <div className="float-card card-contrib">
          <div className="card-header">
            <div style={{ background: '#F3F4F6', padding: '4px', borderRadius: '4px' }}>
              <i className="ph ph-briefcase"></i>
            </div>
            First Contribution
          </div>
          <div 
            className="card-desc" 
            style={{ 
              borderTop: '1px dashed #eee', 
              paddingTop: '8px', 
              marginTop: '8px' 
            }}
          >
            Shipped Mobile feature to production
          </div>
          <div className="status-row">
            <span>Flutter</span>
            <div 
              className="dot bg-blue" 
              style={{ 
                background: '#BFDBFE', 
                width: '6px', 
                height: '6px', 
                margin: '0 4px' 
              }}
            ></div>
            <div style={{ display: 'flex', marginRight: '4px' }}>
              <img src={avatar2} style={{ width: '16px', borderRadius: '50%' }} alt="Collaborator 1" />
              <img 
                src={avatar2} 
                style={{ 
                  width: '16px', 
                  borderRadius: '50%', 
                  marginLeft: '-6px' 
                }} 
                alt="Collaborator 2" 
              />
            </div>
            2 Collaborators
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;