import React from 'react';
import './VoteChart.css';

const VoteChart = ({ candidates, voteCounts }) => {
  if (!candidates || !voteCounts || candidates.length === 0) {
    return <div className="vote-chart-container">Loading vote data...</div>;
  }

  const maxVotes = Math.max(...Object.values(voteCounts));
  
  return (
    <div className="vote-chart-container">
      <h2 className="vote-chart-title">Election Results - Vote Distribution</h2>
      <div className="vote-chart">
        {candidates.map((candidate) => {
          const voteCount = voteCounts[candidate.id] || 0;
          const percentage = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;
          
          return (
            <div key={candidate.id} className="vote-bar-container">
              <div className="candidate-info">
                <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-party">({candidate.party})</span>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="vote-bar"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getPartyColor(candidate.party)
                  }}
                >
                  <span className="vote-count">{voteCount} votes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="vote-summary">
        <p>Total Votes Cast: {Object.values(voteCounts).reduce((sum, count) => sum + count, 0)}</p>
        <p>Leading Candidate: {candidates.find(c => voteCounts[c.id] === maxVotes)?.name || 'N/A'}</p>
      </div>
    </div>
  );
};

const getPartyColor = (party) => {
  const colors = {
    'Democratic Party': '#1e40af',
    'Republican Party': '#dc2626',
    'Independent': '#7c3aed',
    'Green Party': '#059669'
  };
  return colors[party] || '#6b7280';
};

export default VoteChart; 