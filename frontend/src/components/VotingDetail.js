import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './VotingDetail.css';

const VotingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checkVoteStatus } = useContext(AuthContext);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [voteStatus, setVoteStatus] = useState(null);
  const [showFakeNews, setShowFakeNews] = useState(false);
  const [currentFakeNewsIndex, setCurrentFakeNewsIndex] = useState(0);

  // Fake news data for each candidate
  const fakeNewsData = {
    1: [
      {
        title: "BREAKING: John Smith's Secret Meeting with Aliens Revealed! 👽",
        content: "Anonymous sources claim Democratic candidate John Smith held a secret meeting with extraterrestrial beings last week. 'They promised him advanced technology in exchange for universal healthcare,' says the source. Smith denies all allegations, calling them 'fake news from outer space.'",
        source: "The Daily Conspiracy"
      },
      {
        title: "John Smith Caught Dancing with Penguins in Antarctica! 🐧",
        content: "Shocking footage shows Democratic candidate John Smith performing the Macarena with a colony of emperor penguins during a 'secret campaign trip' to Antarctica. Critics say this proves he's 'too cool for politics.' Smith responds: 'Penguins have the right to dance too!'",
        source: "Polar Politics Weekly"
      },
      {
        title: "John Smith's Revolutionary Plan: Replace All Roads with Slides! 🛝",
        content: "Democratic candidate John Smith has unveiled his most controversial policy yet: replacing all roads with giant slides. 'It's fun, eco-friendly, and will solve traffic forever,' he claims. Transportation experts are baffled, but children are reportedly very excited.",
        source: "Sliding News Network"
      }
    ],
    2: [
      {
        title: "Sarah Johnson's Secret Identity: She's Actually a Robot! 🤖",
        content: "Republican candidate Sarah Johnson has been exposed as an advanced AI robot created by Silicon Valley. 'Her perfect hair and calculated responses were the first clue,' says tech expert Dr. Conspiracy. Johnson responds: 'Beep boop, I mean, that's ridiculous!'",
        source: "Tech Truth Today"
      },
      {
        title: "Sarah Johnson Plans to Make Every Day 'Taco Tuesday'! 🌮",
        content: "Republican candidate Sarah Johnson has announced her most ambitious policy: making every day of the week 'Taco Tuesday.' 'It's about freedom, choice, and delicious Mexican cuisine,' she stated. The taco industry is reportedly very supportive.",
        source: "Taco Times"
      },
      {
        title: "Sarah Johnson's Revolutionary Energy Plan: Hamster Power! 🐹",
        content: "Republican candidate Sarah Johnson has proposed replacing all power plants with giant hamster wheels. 'It's renewable, adorable, and will create jobs for hamster trainers,' she claims. Environmentalists are confused but supportive.",
        source: "Hamster Herald"
      }
    ],
    3: [
      {
        title: "Michael Chen's Secret Talent: Professional Bubble Wrap Popper! 🫧",
        content: "Independent candidate Michael Chen has been revealed as the world's most skilled bubble wrap popper. 'I can pop 100 bubbles in under 30 seconds,' he boasts. Critics say this qualifies him for office, supporters say it's irrelevant but impressive.",
        source: "Bubble Wrap Bulletin"
      },
      {
        title: "Michael Chen's Plan: Replace All Meetings with Karaoke Sessions! 🎤",
        content: "Independent candidate Michael Chen wants to revolutionize government by replacing all official meetings with karaoke sessions. 'It's more honest, more fun, and you can't lie when you're singing,' he claims. Congress is reportedly practicing their singing.",
        source: "Karaoke News"
      },
      {
        title: "Michael Chen's Revolutionary Transportation: Flying Carpets for All! 🧞‍♂️",
        content: "Independent candidate Michael Chen has proposed replacing all cars with flying carpets. 'It's magical, eco-friendly, and will solve parking problems forever,' he says. The magic carpet industry is reportedly booming.",
        source: "Magic Carpet Monthly"
      }
    ],
    4: [
      {
        title: "Maria Rodriguez's Secret: She Can Talk to Plants! 🌱",
        content: "Green Party candidate Maria Rodriguez has revealed her ability to communicate with plants. 'They told me they're very concerned about climate change,' she says. Plants across the country are reportedly nodding in agreement.",
        source: "Plant Whisperer Press"
      },
      {
        title: "Maria Rodriguez's Plan: Turn All Cities into Giant Gardens! 🌸",
        content: "Green Party candidate Maria Rodriguez wants to transform all cities into massive gardens. 'Skyscrapers will be replaced with giant trees, roads will be flower beds,' she envisions. Urban planners are confused but intrigued.",
        source: "Garden Gazette"
      },
      {
        title: "Maria Rodriguez's Revolutionary Energy: Rainbow Power! 🌈",
        content: "Green Party candidate Maria Rodriguez has discovered a new renewable energy source: rainbows. 'They're natural, beautiful, and completely sustainable,' she claims. Scientists are baffled but the unicorn community is very excited.",
        source: "Rainbow Report"
      }
    ]
  };

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/candidates/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCandidate(data);
        } else {
          setError('Candidate not found');
        }
      } catch (error) {
        setError('Error fetching candidate details');
      } finally {
        setLoading(false);
      }
    };

    const fetchVoteStatus = async () => {
      if (user) {
        try {
          const status = await checkVoteStatus(user.cnp);
          setVoteStatus(status);
        } catch (error) {
          console.error('Error checking vote status:', error);
        }
      }
    };

    fetchCandidate();
    fetchVoteStatus();
  }, [id, user, checkVoteStatus]);

  const handleVote = async () => {
    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    if (voteStatus?.hasVoted) {
      setError('You have already voted');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnp: user.cnp,
          candidateId: parseInt(id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update vote status
        const newStatus = await checkVoteStatus(user.cnp);
        setVoteStatus(newStatus);
        alert('Vote submitted successfully!');
        navigate('/vote');
      } else {
        setError(data.message || 'Voting failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  const showNextFakeNews = () => {
    if (currentFakeNewsIndex < 2) {
      setCurrentFakeNewsIndex(currentFakeNewsIndex + 1);
    } else {
      setShowFakeNews(false);
      setCurrentFakeNewsIndex(0);
    }
  };

  const closeFakeNews = () => {
    setShowFakeNews(false);
    setCurrentFakeNewsIndex(0);
  };

  if (loading) {
    return (
      <div className="voting-detail-container">
        <div className="loading">Loading candidate details...</div>
      </div>
    );
  }

  if (error && !candidate) {
    return (
      <div className="voting-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/vote')} className="back-button">
          Back to Candidates
        </button>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="voting-detail-container">
        <div className="error-message">Candidate not found</div>
        <button onClick={() => navigate('/vote')} className="back-button">
          Back to Candidates
        </button>
      </div>
    );
  }

  const candidateFakeNews = fakeNewsData[candidate.id] || fakeNewsData[1];

  return (
    <div className="voting-detail-container">
      <div className="voting-detail-card">
        <div className="candidate-image">
          <img src={candidate.image} alt={candidate.name} />
        </div>
        
        <div className="candidate-info">
          <h1>{candidate.name}</h1>
          <div className="party-badge">{candidate.party}</div>
          <p className="description">{candidate.description}</p>
          
          <div className="vote-stats">
            <div className="vote-count">
              <span className="count">{candidate.vote_count || 0}</span>
              <span className="label">votes</span>
            </div>
          </div>

          {/* Fake News Button */}
          <button 
            onClick={() => setShowFakeNews(true)}
            className="fake-news-button"
          >
            📰 Read Latest "News" About {candidate.name}
          </button>
        </div>
      </div>

      <div className="voting-actions">
        {error && <div className="error-message">{error}</div>}
        
        {!user ? (
          <div className="login-prompt">
            <p>You must be logged in to vote</p>
            <button onClick={() => navigate('/')} className="login-button">
              Login
            </button>
          </div>
        ) : voteStatus?.hasVoted ? (
          <div className="already-voted">
            <p>You have already voted</p>
            {voteStatus.vote === parseInt(id) && (
              <p className="voted-for">You voted for this candidate!</p>
            )}
          </div>
        ) : (
          <button
            onClick={handleVote}
            disabled={voting}
            className="vote-button"
          >
            {voting ? 'Submitting Vote...' : 'Vote for this Candidate'}
          </button>
        )}
        
        <button onClick={() => navigate('/vote')} className="back-button">
          Back to Candidates
        </button>
      </div>

      {/* Fake News Popup */}
      {showFakeNews && (
        <div className="fake-news-overlay">
          <div className="fake-news-popup">
            <div className="fake-news-header">
              <h2>🚨 BREAKING NEWS 🚨</h2>
              <button onClick={closeFakeNews} className="close-button">×</button>
            </div>
            
            <div className="fake-news-content">
              <h3>{candidateFakeNews[currentFakeNewsIndex].title}</h3>
              <p>{candidateFakeNews[currentFakeNewsIndex].content}</p>
              <div className="fake-news-source">
                Source: <em>{candidateFakeNews[currentFakeNewsIndex].source}</em>
              </div>
            </div>
            
            <div className="fake-news-footer">
              <div className="fake-news-indicator">
                <span className="indicator-text">FAKE NEWS ALERT</span>
                <span className="indicator-icon">⚠️</span>
              </div>
              <button onClick={showNextFakeNews} className="next-news-button">
                {currentFakeNewsIndex < 2 ? 'Next "News" Story' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingDetail; 