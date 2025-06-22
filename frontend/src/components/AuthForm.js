import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [cnp, setCnp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login - user provides CNP
        if (!cnp) {
          setError('CNP is required');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cnp: parseInt(cnp) }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Login failed');
          return;
        }

        login(data);
      } else {
        // Register - user provides both name and CNP
        if (!name || !cnp) {
          setError('Name and CNP are required');
          return;
        }

        // Validate CNP format (4 digits)
        if (!/^\d{4}$/.test(cnp)) {
          setError('CNP must be exactly 4 digits');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, cnp }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Registration failed');
          return;
        }

        // Auto-login after registration
        login(data);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCnpChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 4 characters
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 4) {
      setCnp(digitsOnly);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cnp">CNP (4 digits):</label>
            <input
              type="text"
              id="cnp"
              value={cnp}
              onChange={handleCnpChange}
              placeholder="Enter your 4-digit CNP"
              maxLength="4"
              required
              pattern="\d{4}"
              title="CNP must be exactly 4 digits"
            />
            {cnp.length > 0 && cnp.length !== 4 && (
              <span className="validation-error">
                CNP must be exactly 4 digits
              </span>
            )}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                minLength="2"
              />
            </div>
          )}
          
          <button type="submit" disabled={loading || (isLogin ? cnp.length !== 4 : cnp.length !== 4 || name.length < 2)}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setCnp('');
              }}
              className="toggle-button"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <h3>About CNP</h3>
          <p>
            CNP (Cod Numeric Personal) is a unique 4-digit identifier for users.
            It's used for voting authentication to ensure each person can vote only once.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 