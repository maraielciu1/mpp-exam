import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Round2Winners.css';

const Round2Winners = ({ winners, totalVotes, onClose }) => {
  const navigate = useNavigate();

  if (!winners || winners.length === 0) {
    return null;
  }

  const handleProceedToRound2 = () => {
    onClose(); // Close the modal
    navigate('/round2'); // Navigate to Round 2 page
  };

  return (
    <div className="round2-winners-overlay">
      <div className="round2-winners-modal">
        <div className="modal-header">
          <h2>🎉 Round 1 Complete!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="winners-info">
          <div className="total-votes-info">
            <h3>Final Results</h3>
            <p className="total-votes">Total Votes Cast: <strong>{totalVotes}</strong></p>
          </div>
          
          <div className="winners-title">
            <h3>🏆 Winners Advancing to Round 2</h3>
          </div>
          
          <div className="winners-grid">
            {winners.map((winner, index) => (
              <div key={winner.id} className={`winner-card ${index === 0 ? 'first-place' : 'second-place'}`}>
                <div className="winner-badge">
                  {index === 0 ? '🥇 1st Place' : '🥈 2nd Place'}
                </div>
                
                <div className="winner-image">
                  <img 
                    src={winner.image} 
                    alt={winner.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Candidate+Image';
                    }}
                  />
                </div>
                
                <div className="winner-details">
                  <h4 className="winner-name">{winner.name}</h4>
                  <div className="winner-party">{winner.party}</div>
                  
                  <div className="winner-stats">
                    <div className="vote-count">
                      <span className="stat-label">Round 1 Votes:</span>
                      <span className="stat-value">{winner.vote_count}</span>
                    </div>
                    <div className="vote-percentage">
                      <span className="stat-label">Percentage:</span>
                      <span className="stat-value">{winner.percentage}%</span>
                    </div>
                  </div>
                  
                  <p className="winner-description">{winner.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="round2-notice">
            <h4>📋 Round 2 Information</h4>
            <p>These two candidates will now face each other in the final round of voting.</p>
            <p>In Round 2, you can select a candidate to generate positive news and auto-vote, or vote manually.</p>
            <p>All votes start from 0 in Round 2.</p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="continue-button" onClick={handleProceedToRound2}>
            🚀 Proceed to Round 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default Round2Winners; 