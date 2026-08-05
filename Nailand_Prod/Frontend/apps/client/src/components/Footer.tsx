import logoImage from '../assets/images/logo/logo.png'; 

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logoImage} alt="NaiLand" />
            <span>NaiLand</span>
          </div>
          <p className="footer-tagline">
            A collaboration-first space to build real experience and visibility.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="links-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">How-It-works</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Join Waitlist</a></li>
            </ul>
          </div>

          <div className="links-col">
            <h4>Community</h4>
            <ul>
              <li><a href="#">Join Discord</a></li>
              <li><a href="#">Join Telegram</a></li>
              <li><a href="#">Follow on X</a></li>
              <li><a href="#">Follow on LinkedIn</a></li>
            </ul>
          </div>

          <div className="links-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@nailand.com">hello@nailand.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 NaiLAND</p>
      </div>
    </footer>
  );
};

export default Footer;