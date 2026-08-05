import rocketImage from '../assets/images/rocket/rocket.png'; 

const GetStarted: React.FC = () => {
  return (
    <section className="get-started-section">
      <div className="cta-banner">
        <div className="cta-content">
          <div className="cta-header-row">
            <h2 className="cta-title">Ready To Get Started</h2>
            <a href="#" className="btn btn-primary cta-main-btn">Create Account</a>
          </div>

          <p className="cta-subtitle">
            You can start for free with download the app or install the extension form your PC browser
          </p>

          <div className="download-options">
            <a href="#" className="download-pill">
              <i className="ph ph-phone"></i>
              <div className="download-text">
                <span>Download</span>
                <strong>Mobile App</strong>
              </div>
            </a>
            <a href="#" className="download-pill">
              <i className="ph ph-monitor"></i>
              <div className="download-text">
                <span>Download</span>
                <strong>Extension</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="rocket-container">
          <img src={rocketImage} alt="3D Rocket Launch Illustration" className="rocket-img" />
        </div>
      </div>
    </section>
  );
};

export default GetStarted;