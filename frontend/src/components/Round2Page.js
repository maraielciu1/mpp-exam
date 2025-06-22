import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Round2Page.css';

const Round2Page = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [endingRound2, setEndingRound2] = useState(false);

  useEffect(() => {
    fetchRound2Data();
  }, []);

  const fetchRound2Data = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/round2/candidates');
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates);
        
        // Create vote counts object
        const counts = {};
        data.candidates.forEach(candidate => {
          counts[candidate.id] = parseInt(candidate.vote_count) || 0;
        });
        setVoteCounts(counts);
      } else {
        setError('Failed to load Round 2 candidates');
      }
    } catch (err) {
      setError('Error loading Round 2 data');
      console.error('Error fetching Round 2 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = async (candidate) => {
    if (selectedCandidate === candidate.id) {
      // Deselect if already selected
      setSelectedCandidate(null);
      setCountdown(null);
      return;
    }

    setSelectedCandidate(candidate.id);
    setIsProcessing(true);

    try {
      // Generate 3 good news articles for the selected candidate
      const response = await fetch('/api/generate-round2-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateParty: candidate.party
        }),
      });

      if (response.ok) {
        // Start 3-second countdown
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Auto-vote after countdown
              handleAutoVote(candidate.id);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

      } else {
        console.error('Failed to generate news');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error generating news:', error);
      setIsProcessing(false);
    }
  };

  const handleAutoVote = async (candidateId) => {
    try {
      const response = await fetch('/api/auto-vote-round2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidateId
        }),
      });

      if (response.ok) {
        alert('10 votes have been automatically added to the selected candidate!');
        setIsProcessing(false);
        setSelectedCandidate(null);
        setCountdown(null);
        // Refresh the data to show updated vote counts
        fetchRound2Data();
      } else {
        console.error('Failed to auto-vote');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error auto-voting:', error);
      setIsProcessing(false);
    }
  };

  const handleManualVote = async (candidateId) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    try {
      // Submit the vote first
      const voteResponse = await fetch('/api/round2/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.cnp,
          candidateId: candidateId
        }),
      });

      if (voteResponse.ok) {
        // Find the other candidate (the one not voted for)
        const otherCandidate = candidates.find(c => c.id !== candidateId);
        
        if (otherCandidate) {
          // Generate news for both candidates
          const newsResponse = await fetch('/api/generate-round2-news-manual', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              votedCandidateId: candidateId,
              votedCandidateName: candidates.find(c => c.id === candidateId)?.name,
              votedCandidateParty: candidates.find(c => c.id === candidateId)?.party,
              otherCandidateId: otherCandidate.id,
              otherCandidateName: otherCandidate.name,
              otherCandidateParty: otherCandidate.party
            }),
          });

          if (newsResponse.ok) {
            // Start 5-second countdown
            setCountdown(5);
            setIsProcessing(true);
            
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  // Auto-vote after countdown
                  handleAutoVote(candidateId);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);

            alert('Your vote has been cast! Generating news and auto-voting in 5 seconds...');
          } else {
            alert('Your vote was cast, but there was an error generating news.');
          }
        } else {
          alert('Your vote has been cast successfully!');
        }
        
        fetchRound2Data(); // Refresh vote counts
      } else {
        const errorData = await voteResponse.json();
        alert(errorData.message || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Error casting vote. Please try again.');
    }
  };

  const handleEndRound2 = async () => {
    try {
      setEndingRound2(true);
      
      // Calculate vote percentages and difference
      const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + parseInt(count || 0), 0);
      
      if (totalVotes === 0) {
        alert('No votes have been cast in Round 2 yet.');
        setEndingRound2(false);
        return;
      }
      
      const candidate1 = candidates[0];
      const candidate2 = candidates[1];
      
      const candidate1Votes = voteCounts[candidate1.id] || 0;
      const candidate2Votes = voteCounts[candidate2.id] || 0;
      
      const candidate1Percentage = (candidate1Votes / totalVotes) * 100;
      const candidate2Percentage = (candidate2Votes / totalVotes) * 100;
      
      const voteDifference = Math.abs(candidate1Percentage - candidate2Percentage);
      
      console.log(`Vote difference: ${voteDifference.toFixed(1)}%`);
      console.log(`${candidate1.name}: ${candidate1Percentage.toFixed(1)}%`);
      console.log(`${candidate2.name}: ${candidate2Percentage.toFixed(1)}%`);
      
      if (voteDifference > 5) {
        // Determine winner
        const winner = candidate1Percentage > candidate2Percentage ? candidate1 : candidate2;
        const loser = candidate1Percentage > candidate2Percentage ? candidate2 : candidate1;
        
        setWinnerData({
          winner,
          loser,
          winnerPercentage: Math.max(candidate1Percentage, candidate2Percentage),
          loserPercentage: Math.min(candidate1Percentage, candidate2Percentage),
          voteDifference: voteDifference.toFixed(1),
          totalVotes
        });
        
        setShowWinnerPopup(true);
      } else {
        alert(`Round 2 cannot end yet. Vote difference is ${voteDifference.toFixed(1)}%. Need more than 5% difference to declare a winner.`);
      }
    } catch (error) {
      console.error('Error ending Round 2:', error);
      alert('Error ending Round 2. Please try again.');
    } finally {
      setEndingRound2(false);
    }
  };

  const closeWinnerPopup = () => {
    setShowWinnerPopup(false);
    setWinnerData(null);
  };

  if (loading) {
    return (
      <div className="round2-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Round 2...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="round2-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/voting')}>Back to Voting</button>
        </div>
      </div>
    );
  }

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + parseInt(count || 0), 0);

  return (
    <div className="round2-page">
      <div className="page-header">
        <h1>🏆 Round 2 - Final Election</h1>
        <p>Choose between the two final candidates</p>
        <div className="round2-stats">
          <span>Total Votes Cast: {totalVotes}</span>
        </div>
      </div>

      <div className="candidates-container">
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className={`candidate-card ${index === 0 ? 'first-place' : 'second-place'}`}>
            <div className="candidate-badge">
              {index === 0 ? '🥇 1st Place' : '🥈 2nd Place'}
            </div>
            
            <div className="candidate-image">
              <img 
                src={candidate.image} 
                alt={candidate.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Candidate+Image';
                }}
              />
            </div>
            
            <div className="candidate-details">
              <h3 className="candidate-name">{candidate.name}</h3>
              <div className="candidate-party">{candidate.party}</div>
              
              <div className="candidate-stats">
                <div className="vote-count">
                  <span className="stat-label">Round 2 Votes:</span>
                  <span className="stat-value">{voteCounts[candidate.id] || 0}</span>
                </div>
                <div className="vote-percentage">
                  <span className="stat-label">Percentage:</span>
                  <span className="stat-value">
                    {totalVotes > 0 ? ((voteCounts[candidate.id] || 0) / totalVotes * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              <p className="candidate-description">{candidate.description}</p>
            </div>

            {/* Auto-vote selection */}
            <div className="auto-vote-section">
              <h4>🎯 Auto-Vote Feature</h4>
              <p>Select this candidate to generate positive news and auto-vote</p>
              
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedCandidate === candidate.id}
                  onChange={() => handleCandidateSelect(candidate)}
                  disabled={isProcessing}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  {selectedCandidate === candidate.id ? 'Selected for Auto-Vote' : 'Select for Auto-Vote'}
                </span>
              </label>

              {/* Countdown display */}
              {selectedCandidate === candidate.id && countdown !== null && (
                <div className="countdown-display">
                  <div className="countdown-text">
                    Generating good news... Auto-voting in {countdown} seconds
                  </div>
                  <div className="countdown-bar">
                    <div 
                      className="countdown-progress" 
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Manual vote countdown display */}
              {!selectedCandidate && countdown !== null && (
                <div className="countdown-display manual-countdown">
                  <div className="countdown-text">
                    Generating news... Auto-voting in {countdown} seconds
                  </div>
                  <div className="countdown-bar">
                    <div 
                      className="countdown-progress" 
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual vote button */}
            <div className="manual-vote-section">
              <button
                className="vote-button"
                onClick={() => handleManualVote(candidate.id)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Vote for ${candidate.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="round2-info">
        <h3>📋 Round 2 Information</h3>
        <ul>
          <li>Select a candidate to generate 3 positive news articles about them</li>
          <li>After 3 seconds, 10 votes will automatically be added to the selected candidate</li>
          <li>You can also manually vote for either candidate</li>
          <li>All votes start from 0 in Round 2</li>
        </ul>
      </div>

      <div className="navigation-buttons">
        <button 
          className="back-button" 
          onClick={() => navigate('/voting')}
          disabled={isProcessing}
        >
          Back to Voting Page
        </button>
        <button 
          className="news-feed-button" 
          onClick={() => navigate('/news')}
          disabled={isProcessing}
        >
          View News Feed
        </button>
        <button 
          className="end-round2-button" 
          onClick={handleEndRound2}
          disabled={isProcessing || endingRound2}
        >
          {endingRound2 ? 'Ending Round 2...' : '🏁 End Round 2'}
        </button>
      </div>

      {/* Winner Popup */}
      {showWinnerPopup && (
        <div className="winner-popup-overlay">
          <div className="winner-popup-modal">
            <div className="winner-popup-header">
              <h1>🎉 YOU WON! 🎉</h1>
            </div>
            
            <div className="winner-popup-image">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrYlcYhPLWQW28sQxYJzJmxpx5H0XHc7PQ2Q&s" 
                alt="Winner Celebration"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Winner!';
                }}
              />
            </div>
            
            <div className="winner-popup-content">
              <h2>🏆 Election Winner</h2>
              <div className="winner-candidate">
                <img 
                  src={winnerData.winner.image} 
                  alt={winnerData.winner.name}
                  className="winner-candidate-image"
                />
                <div className="winner-candidate-info">
                  <h3>{winnerData.winner.name}</h3>
                  <p className="winner-party">{winnerData.winner.party}</p>
                  <p className="winner-percentage">{winnerData.winnerPercentage.toFixed(1)}% of votes</p>
                </div>
              </div>
              
              <div className="election-stats">
                <div className="stat-item">
                  <span className="stat-label">Vote Difference:</span>
                  <span className="stat-value">{winnerData.voteDifference}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Votes:</span>
                  <span className="stat-value">{winnerData.totalVotes}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Runner-up:</span>
                  <span className="stat-value">{winnerData.loser.name} ({winnerData.loserPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
            
            <div className="winner-popup-footer">
              <button 
                className="close-winner-popup-btn" 
                onClick={closeWinnerPopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round2Page; 