import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PartyChart from './PartyChart';
import VoteChart from './VoteChart';
import Round2Winners from './Round2Winners';
import './VotingPage.css';

const VotingPage = () => {
  const { user, checkVoteStatus } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [partyStats, setPartyStats] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [voteStatus, setVoteStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParty, setSelectedParty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRound2Winners, setShowRound2Winners] = useState(false);
  const [round2Data, setRound2Data] = useState(null);
  const [endingRound, setEndingRound] = useState(false);
  const [redistributing, setRedistributing] = useState(false);
  const [round2Available, setRound2Available] = useState(false);

  const API_BASE_URL = '/api';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [candidatesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`),
        fetch(`${API_BASE_URL}/party-stats`)
      ]);
      
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
        
        // Create vote counts object for the chart
        const counts = {};
        candidatesData.forEach(candidate => {
          counts[candidate.id] = parseInt(candidate.vote_count) || 0;
        });
        setVoteCounts(counts);
      } else {
        setError('Failed to load candidates');
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPartyStats(statsData);
      }

      // Fetch vote status if user is logged in
      if (user) {
        try {
          const status = await checkVoteStatus(user.cnp);
          setVoteStatus(status);
        } catch (error) {
          console.error('Error checking vote status:', error);
        }
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, checkVoteStatus, API_BASE_URL]);

  const handleAutoEndRound1 = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/election/end-round-1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically redirect to Round 2 without showing modal
        navigate('/round2');
      } else {
        console.error('Failed to auto-end Round 1:', data.message);
      }
    } catch (error) {
      console.error('Error auto-ending Round 1:', error);
    }
  }, [API_BASE_URL, navigate]);

  // Fetch candidates, party stats, and vote status data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if Round 2 is available and redirect
  useEffect(() => {
    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + parseInt(count || 0), 0);
    if (totalVotes >= 49 && !round2Available) {
      setRound2Available(true);
      // Automatically get Round 1 results and redirect to Round 2
      handleAutoEndRound1();
    }
  }, [voteCounts, round2Available, handleAutoEndRound1]);

  const handleEndRound1 = async () => {
    try {
      setEndingRound(true);
      const response = await fetch(`${API_BASE_URL}/election/end-round-1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRound2Data(data);
        setShowRound2Winners(true);
      } else {
        // Show error message if not enough votes
        alert(data.message);
      }
    } catch (error) {
      console.error('Error ending round 1:', error);
      alert('Error ending round 1. Please try again.');
    } finally {
      setEndingRound(false);
    }
  };

  const handleRedistributeVotes = async () => {
    try {
      setRedistributing(true);
      const response = await fetch(`${API_BASE_URL}/redistribute-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await response.json();
        alert('Votes have been redistributed based on news bias ratio! The candidate with the highest positive/negative news ratio now has the most votes.');
        // Refresh the page to show updated vote counts
        window.location.reload();
      } else {
        console.error('Failed to redistribute votes');
        alert('Failed to redistribute votes. Please try again.');
      }
    } catch (error) {
      console.error('Error redistributing votes:', error);
      alert('Error redistributing votes. Please try again.');
    } finally {
      setRedistributing(false);
    }
  };

  const closeRound2Winners = () => {
    setShowRound2Winners(false);
    setRound2Data(null);
  };

  // Filter candidates based on search and party selection
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.party.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParty = selectedParty === 'all' || candidate.party === selectedParty;
    return matchesSearch && matchesParty;
  });

  // Get unique parties for filter
  const parties = ['all', ...new Set(candidates.map(c => c.party))];

  // Calculate total votes
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + parseInt(count || 0), 0);

  return (
    <div className="voting-page">
      <div className="page-header">
        <h1>Election Voting</h1>
        <p>Welcome, {user?.name}! Browse candidates and cast your vote.</p>
        {voteStatus?.hasVoted && (
          <div className="vote-status-banner">
            <span>✓ You have already voted</span>
          </div>
        )}
        
        {/* End Round 1 Button */}
        <div className="round-controls">
          <div className="vote-progress">
            <span>Votes Cast: {totalVotes}/49</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((totalVotes / 49) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="voting-controls">
            {round2Available ? (
              <div className="round2-available">
                <span className="round2-message">🎉 Round 2 is now available!</span>
                <button 
                  className="go-to-round2-btn" 
                  onClick={() => navigate('/round2')}
                >
                  🚀 Go to Round 2
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="end-round-btn" 
                  onClick={handleEndRound1}
                  disabled={endingRound}
                >
                  {endingRound ? 'Ending Round 1...' : 'End Round 1'}
                </button>
                <button
                  className="redistribute-votes-btn"
                  onClick={handleRedistributeVotes}
                  disabled={redistributing}
                  title="Redistribute votes based on news bias ratio (positive/negative news)"
                >
                  {redistributing ? 'Redistributing...' : '🔄 Redistribute Votes by News Bias'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search candidates or parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="party-filter"
          >
            {parties.map(party => (
              <option key={party} value={party}>
                {party === 'all' ? 'All Parties' : party}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vote Distribution Chart */}
      {!loading && candidates.length > 0 && (
        <div className="vote-chart-section">
          <VoteChart candidates={candidates} voteCounts={voteCounts} />
        </div>
      )}

      {/* Party Statistics Chart */}
      <div className="stats-section">
        <h2>Party Distribution</h2>
        <PartyChart partyStats={partyStats} />
      </div>

      {/* Candidates Grid */}
      <div className="candidates-grid">
        {loading ? (
          <div className="loading">Loading candidates...</div>
        ) : error ? (
          <div className="error">Error loading candidates: {error}</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="no-results">
            <h3>No candidates found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-image">
                <img 
                  src={candidate.image} 
                  alt={candidate.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Candidate+Image';
                  }}
                />
              </div>
              
              <div className="candidate-info">
                <h3 className="candidate-name">{candidate.name}</h3>
                <div className="candidate-party-badge">{candidate.party}</div>
                
                <div className="vote-count-display">
                  <span className="vote-count-label">Votes:</span>
                  <span className="vote-count-number">{candidate.vote_count || 0}</span>
                </div>
                
                <p className="candidate-description">
                  {candidate.description.length > 100 
                    ? `${candidate.description.substring(0, 100)}...` 
                    : candidate.description}
                </p>
                
                <Link to={`/vote/${candidate.id}`} className="vote-button">
                  {voteStatus?.hasVoted && voteStatus.vote === candidate.id 
                    ? '✓ You Voted Here' 
                    : voteStatus?.hasVoted 
                      ? 'Already Voted' 
                      : 'View & Vote'}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Info */}
      <div className="user-info-section">
        <div className="user-card">
          <h3>Your Voting Status</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>CNP:</strong> {user?.cnp}</p>
          <p><strong>Vote Status:</strong> 
            {voteStatus?.hasVoted ? (
              <span className="voted-status">✓ Already voted</span>
            ) : (
              <span className="not-voted-status">⏳ Haven't voted yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Round 2 Winners Modal */}
      {showRound2Winners && round2Data && (
        <Round2Winners
          winners={round2Data.winners}
          totalVotes={round2Data.totalVotes}
          onClose={closeRound2Winners}
        />
      )}
    </div>
  );
};

export default VotingPage; 