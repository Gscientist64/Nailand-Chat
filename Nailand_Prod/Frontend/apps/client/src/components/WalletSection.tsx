// WalletSection.tsx
import React from 'react';

const WalletSection: React.FC = () => {
  return (
    <section className="wallet-section">
      <div className="wallet-header">
        <h2 className="wallet-main-title">Get started with Web3 wallet in 3 easy steps</h2>
        <p className="wallet-main-subtitle">
          As we push the boundaries of this new financial frontier, staying informed and adopting robust asset management
          practices is the best way to turn market volatility into opportunity.
        </p>
      </div>

      <div className="wallet-flex-container">
        <div className="steps-column">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create your account</h3>
              <p>Start with creating your account</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create your wallet</h3>
              <p>By create wallet, you are able to take action consist of buying, trading, and investing</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Buy and sell your digital asset</h3>
              <p>Any asset that you chose to buy on the market</p>
            </div>
          </div>
        </div>

        <div className="phone-display-area">
          <div className="phone-frame">
            <div className="phone-screen">
              <div className="app-header">
                <div className="app-header-top">
                  <i className="ph ph-bell"></i>
                  <span className="app-name">NaiWallet</span>
                  <i className="ph ph-scan"></i>
                </div>
                <div className="balance-container">
                  <span className="balance-label">TOTAL BALANCE</span>
                  <h2 className="balance-amount">$37,758,767.90</h2>
                  <div className="balance-growth">
                    <i className="ph ph-caret-up"></i> +2.5% this week
                  </div>
                </div>
                <div className="app-actions">
                  <button className="app-btn"><i className="ph ph-arrow-up-right"></i> Send</button>
                  <button className="app-btn"><i className="ph ph-arrow-down-left"></i> Receive</button>
                </div>
              </div>
              <div className="app-tabs">
                <span className="active-tab">Asset</span>
                <span>Collection</span>
                <span>Activity</span>
              </div>
              <div className="app-body">
                <div className="app-search">
                  <i className="ph ph-magnifying-glass"></i>
                  <input type="text" placeholder="Search Asset" />
                </div>
                <div className="asset-item">
                  <div className="asset-info">
                    <div className="asset-logo">N</div>
                    <div>
                      <div className="asset-name">NaiToken</div>
                      <div className="asset-sub">$100.00 USD</div>
                    </div>
                  </div>
                  <div className="asset-value">250</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletSection;