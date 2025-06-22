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
      const response = await fetch(`https://mpp-exam-production-5408.up.railway.app/api/auth/vote-status/${cnp}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to check vote status');
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
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