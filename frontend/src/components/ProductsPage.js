import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import PartyChart from './PartyChart';
import './ProductsPage.css';

const ProductsPage = () => {
  const { 
    candidates, 
    partyStats, 
    isGenerating, 
    loading, 
    error,
    startGeneration, 
    stopGeneration,
    deleteCandidate,
    clearError 
  } = useProductContext();

  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const handleStartGeneration = async () => {
    try {
      await startGeneration();
      setShowError(false);
    } catch (err) {
      setShowError(true);
    }
  };

  const handleStopGeneration = async () => {
    try {
      await stopGeneration();
      setShowError(false);
    } catch (err) {
      setShowError(true);
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    clearError();
  };

  const handleCandidateClick = (candidate) => {
    navigate(`/candidate/${candidate.id}`);
  };

  const handleAddCandidate = () => {
    navigate('/add');
  };

  const handleEditCandidate = (e, candidate) => {
    e.stopPropagation();
    navigate(`/edit/${candidate.id}`);
  };

  const handleDeleteCandidate = async (e, candidate) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${candidate.name}?`)) {
      try {
        await deleteCandidate(candidate.id);
        setShowError(false);
      } catch (err) {
        setShowError(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>MPP Exam - Election Candidates</h1>
        <p>Click on any candidate to view their profile</p>
        <div className="header-actions">
          <button onClick={handleAddCandidate} className="add-candidate-button">
            + Add New Candidate
          </button>
          {!isGenerating ? (
            <button onClick={handleStartGeneration} className="generate-button">
              🎲 Start Generating
            </button>
          ) : (
            <button onClick={handleStopGeneration} className="stop-button">
              ⏹️ Stop Generating
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && showError && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={handleErrorClose} className="error-close">×</button>
        </div>
      )}

      {/* Party Statistics Chart */}
      <PartyChart partyStats={partyStats} />
      
      <div className="products-grid">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className="product-card"
            onClick={() => handleCandidateClick(candidate)}
          >
            <div className="card-actions">
              <button 
                className="edit-button"
                onClick={(e) => handleEditCandidate(e, candidate)}
                title="Edit candidate"
              >
                ✏️
              </button>
              <button 
                className="delete-button"
                onClick={(e) => handleDeleteCandidate(e, candidate)}
                title="Delete candidate"
              >
                🗑️
              </button>
            </div>
            
            <img 
              src={candidate.image} 
              alt={candidate.name} 
              className="product-image"
            />
            <div className="product-info">
              <h3 className="product-name">{candidate.name}</h3>
              <div className="candidate-party">{candidate.party}</div>
              <p className="product-description">{candidate.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {candidates.length === 0 && (
        <div className="empty-state">
          <h2>No candidates found</h2>
          <p>Add your first candidate to get started!</p>
          <button onClick={handleAddCandidate} className="add-candidate-button">
            + Add New Candidate
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="generating-indicator">
          <div className="generating-spinner"></div>
          <span>Generating random candidates...</span>
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 