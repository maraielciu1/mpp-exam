import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteButton from './VoteButton';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://mpp-exam-production-5408.up.railway.app/api';

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
        
        if (!response.ok) {
          throw new Error('Candidate not found');
        }
        
        const data = await response.json();
        setCandidate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading candidate details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Candidate Not Found</h2>
          <p>The candidate you're looking for doesn't exist.</p>
          <button onClick={handleBackClick} className="back-button">
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-header">
        <button onClick={handleBackClick} className="back-button">
          ← Back to Candidates
        </button>
      </div>
      
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img 
            src={candidate.image} 
            alt={candidate.name} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Candidate+Image';
            }}
          />
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{candidate.name}</h1>
          <div className="candidate-party-badge">{candidate.party}</div>
          
          <div className="vote-count">
            <span className="vote-label">Votes:</span>
            <span className="vote-number">{candidate.vote_count || 0}</span>
          </div>
          
          <div className="product-detail-description">
            <h3>About</h3>
            <p>{candidate.description}</p>
          </div>

          <VoteButton 
            candidateId={candidate.id} 
            candidateName={candidate.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 