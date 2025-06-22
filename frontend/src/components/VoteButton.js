import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './VoteButton.css';

const VoteButton = ({ candidateId, candidateName }) => {
  const { user, voteStatus, vote } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVote = async () => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    if (voteStatus?.hasVoted) {
      alert('You have already voted');
      return;
    }

    setShowConfirm(true);
  };

  const confirmVote = async () => {
    setIsVoting(true);
    try {
      await vote(candidateId);
      alert('Vote recorded successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsVoting(false);
      setShowConfirm(false);
    }
  };

  const cancelVote = () => {
    setShowConfirm(false);
  };

  if (!user) {
    return (
      <div className="vote-status">
        <p>Please log in to vote</p>
      </div>
    );
  }

  if (voteStatus?.hasVoted) {
    if (voteStatus.vote?.candidate_id === candidateId) {
      return (
        <div className="vote-status voted">
          <div className="vote-icon">✓</div>
          <p>You voted for this candidate</p>
        </div>
      );
    } else {
      return (
        <div className="vote-status already-voted">
          <div className="vote-icon">✗</div>
          <p>You already voted for {voteStatus.vote?.candidate_name}</p>
        </div>
      );
    }
  }

  if (showConfirm) {
    return (
      <div className="vote-confirmation">
        <p>Are you sure you want to vote for <strong>{candidateName}</strong>?</p>
        <p className="vote-warning">This action cannot be undone.</p>
        <div className="vote-confirmation-buttons">
          <button 
            onClick={confirmVote} 
            disabled={isVoting}
            className="confirm-vote-btn"
          >
            {isVoting ? 'Recording Vote...' : 'Confirm Vote'}
          </button>
          <button 
            onClick={cancelVote} 
            disabled={isVoting}
            className="cancel-vote-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleVote}
      className="vote-button"
      disabled={isVoting}
    >
      {isVoting ? 'Processing...' : 'Vote for this candidate'}
    </button>
  );
};

export default VoteButton; 