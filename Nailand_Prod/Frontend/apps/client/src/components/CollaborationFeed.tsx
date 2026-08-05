

// CollaborationFeed.jsx
import img1 from '../assets/images/collaborative-profile/img-1.png';
import img2 from '../assets/images/collaborative-profile/img-2.png';
import img3 from '../assets/images/collaborative-profile/img-3.png';
import img4 from '../assets/images/collaborative-profile/img-4.png';
import img5 from '../assets/images/collaborative-profile/img-5.png';

const CollaborationFeed = () => {
  return (
    <section className="collab-feed">
      <div className="feed-header-content">
        <div className="feed-pill">
          <div className="blink-dot"></div>
          LIVE COLLABORATION FEED
        </div>
        <p className="feed-description">
          Meet and have global refined interaction on a social blockchain based virtual reality platform where boundaries
          and consent are respected.
        </p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <img src={img1} alt="Tomiwa" className="profile-img" />
          <h3 className="profile-name">Tomiwa A.</h3>
          <p className="profile-role">Mobile Developer</p>
          <div className="profile-stat">
            <i className="ph ph-device-mobile"></i> 
            3 projects verified
          </div>
          <div className="profile-status">
            <span className="status-dot orange"></span> 
            ACTIVE NOW
          </div>
        </div>

        <div className="profile-card">
          <img src={img2} alt="Zainab" className="profile-img" />
          <h3 className="profile-name">Zainab K.</h3>
          <p className="profile-role">Product Designer</p>
          <div className="profile-stat">
            <i className="ph ph-users"></i> 
            3 Collaborations
          </div>
          <div className="profile-status">
            <span className="status-dot pink"></span> 
            BUILDING IN PUBLIC
          </div>
        </div>

        <div className="profile-card">
          <img src={img3} alt="Samuel" className="profile-img" />
          <h3 className="profile-name">Samuel O.</h3>
          <p className="profile-role">Backend Engineer</p>
          <div className="profile-stat">
            <i className="ph ph-git-merge"></i> 
            2 API Contributions
          </div>
          <div className="profile-status">
            <span className="status-dot blue"></span> 
            EARLY CONTRIBUTOR
          </div>
        </div>

        <div className="profile-card">
          <img src={img4} alt="Amaka" className="profile-img" />
          <h3 className="profile-name">Amaka R.</h3>
          <p className="profile-role">Technical Manager</p>
          <div className="profile-stat">
            <i className="ph ph-briefcase"></i> 
            1 Shipped Project
          </div>
          <div className="profile-status">
            <span className="status-dot red"></span> 
            GROWING EXPERIENCE
          </div>
        </div>

        <div className="profile-card">
          <img src={img5} alt="Daniella" className="profile-img" />
          <h3 className="profile-name">Daniella T.</h3>
          <p className="profile-role">Front-end Developer</p>
          <div className="profile-stat">
            <i className="ph ph-layout"></i> 
            2 UI Deliverables
          </div>
          <div className="profile-status">
            <span className="status-dot purple"></span> 
            OPEN TO COLLAB
          </div>
        </div>
      </div>

      <div className="feed-actions">
        <button className="btn-dark">Join Community</button>
        <button className="btn-outline-large">Learn More</button>
      </div>
    </section>
  );
};

export default CollaborationFeed;