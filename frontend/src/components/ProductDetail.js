import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCandidateById, deleteCandidate, loading, error, clearError } = useProductContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showError, setShowError] = useState(false);

  const candidate = getCandidateById(parseInt(id));

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete ${candidate.name}?`)) {
      try {
        setIsDeleting(true);
        await deleteCandidate(candidate.id);
        navigate('/');
        setShowError(false);
      } catch (err) {
        setShowError(true);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    clearError();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading candidate details...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container">
        <div className="error">
          <h2>Candidate not found</h2>
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
      {/* Error Display */}
      {error && showError && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={handleErrorClose} className="error-close">×</button>
        </div>
      )}

      <div className="detail-header">
        <button onClick={handleBackClick} className="back-button">
          ← Back to Candidates
        </button>
        <div className="detail-actions">
          <button onClick={handleEditClick} className="edit-detail-button">
            ✏️ Edit
          </button>
          <button 
            onClick={handleDeleteClick} 
            className="delete-detail-button"
            disabled={isDeleting}
          >
            {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      </div>
      
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img src={candidate.image} alt={candidate.name} />
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{candidate.name}</h1>
          <div className="candidate-party-badge">{candidate.party}</div>
          
          <div className="product-detail-description">
            <h3>About</h3>
            <p>{candidate.description}</p>
          </div>

          <div className="product-detail-actions">
            <button className="add-to-cart-button">
              View Full Platform
            </button>
            <button className="buy-now-button">
              Support Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 