import img1 from '../assets/images/mosaic/CommunityImage.png';


const Web3Community: React.FC = () => {
  return (
    <section className="web3-community">
      <div className="web3-content">
        <div className="web3-text-header">
          <h2 className="web3-title">
            Create Your Web3 Experience Community
          </h2>
          <button className="btn btn-primary btn-large">Create Community</button>
        </div>
        <p className="web3-subtitle">
          Creates space for people to build real experience, trade skills, collaborate on projects and earn NaiPoint
          through honest collaboration
        </p>
      </div>

      <div className="mosaic-container">
        <img src={img1} alt="Community-image" className="mosaic-image" />         
      </div>
    </section>
  );
};

export default Web3Community;