import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const checkVoteStatus = async (cnp) => {
    try {
      const response = await fetch(`http://localhost:5001/api/auth/vote-status/${cnp}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return { hasVoted: false, vote: null };
    } catch (error) {
      console.error('Error checking vote status:', error);
      return { hasVoted: false, vote: null };
    }
  };

  const value = {
    user,
    login,
    logout,
    checkVoteStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 