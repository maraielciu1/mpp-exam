import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import './CandidateForm.css';

const CandidateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getCandidateById, 
    createCandidate, 
    updateCandidate, 
    loading, 
    error, 
    clearError 
  } = useProductContext();

  const [formData, setFormData] = useState({
    name: '',
    party: '',
    description: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const isEditing = !!id;
  const candidate = isEditing ? getCandidateById(parseInt(id)) : null;

  // Available parties
  const parties = [
    "Democratic Party",
    "Republican Party", 
    "Independent",
    "Green Party",
    "Libertarian Party"
  ];

  useEffect(() => {
    if (isEditing && candidate) {
      setFormData({
        name: candidate.name,
        party: candidate.party,
        description: candidate.description,
        image: candidate.image
      });
    }
  }, [isEditing, candidate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.party) {
      newErrors.party = 'Party is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setShowError(false);

      if (isEditing) {
        await updateCandidate(parseInt(id), formData);
      } else {
        await createCandidate(formData);
      }

      navigate('/');
    } catch (err) {
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    clearError();
  };

  if (loading) {
    return (
      <div className="candidate-form">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (isEditing && !candidate) {
    return (
      <div className="candidate-form">
        <div className="error-container">
          <h2>Candidate Not Found</h2>
          <p>The candidate you're trying to edit doesn't exist.</p>
          <Link to="/" className="back-btn">Back to Candidates</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-form">
      {/* Error Display */}
      {error && showError && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={handleErrorClose} className="error-close">×</button>
        </div>
      )}

      <div className="form-header">
        <Link to="/" className="back-link">← Back to Candidates</Link>
        <h1>{isEditing ? 'Edit Candidate' : 'Add New Candidate'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter candidate name"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="party">Party *</label>
          <select
            id="party"
            name="party"
            value={formData.party}
            onChange={handleInputChange}
            className={errors.party ? 'error' : ''}
          >
            <option value="">Select a party</option>
            {parties.map(party => (
              <option key={party} value={party}>{party}</option>
            ))}
          </select>
          {errors.party && <span className="error-text">{errors.party}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? 'error' : ''}
            placeholder="Enter candidate description"
            rows="4"
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL *</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className={errors.image ? 'error' : ''}
            placeholder="Enter image URL"
          />
          {errors.image && <span className="error-text">{errors.image}</span>}
        </div>

        {/* Image Preview */}
        {formData.image && !errors.image && (
          <div className="image-preview">
            <label>Image Preview:</label>
            <img 
              src={formData.image} 
              alt="Preview" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-error" style={{ display: 'none' }}>
              Unable to load image
            </div>
          </div>
        )}

        <div className="form-actions">
          <Link to="/" className="cancel-btn">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Candidate' : 'Create Candidate')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm; 