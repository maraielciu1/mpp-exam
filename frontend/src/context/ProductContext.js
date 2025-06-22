import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ProductContext = createContext();

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);
  const [partyStats, setPartyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const API_BASE_URL = 'https://mpp-exam-production-5408.up.railway.app/api'
  const SOCKET_URL = 'https://mpp-exam-production-5408.up.railway.app'

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    // Listen for real-time updates
    newSocket.on('candidates-updated', (updatedCandidates) => {
      setCandidates(updatedCandidates);
    });

    newSocket.on('party-stats-updated', (updatedStats) => {
      setPartyStats(updatedStats);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [candidatesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`),
        fetch(`${API_BASE_URL}/party-stats`)
      ]);

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPartyStats(statsData);
      }
    } catch (err) {
      setError('Failed to fetch initial data');
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generation functions
  const startGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      setGenerating(true);
    } catch (err) {
      setError('Failed to start generation');
      throw err;
    }
  };

  const stopGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop generation');
      }

      setGenerating(false);
    } catch (err) {
      setError('Failed to stop generation');
      throw err;
    }
  };

  // API functions
  const createCandidate = async (candidateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }

      const newCandidate = await response.json();
      return newCandidate;
    } catch (err) {
      setError('Failed to create candidate');
      throw err;
    }
  };

  const updateCandidate = async (id, candidateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }

      const updatedCandidate = await response.json();
      return updatedCandidate;
    } catch (err) {
      setError('Failed to update candidate');
      throw err;
    }
  };

  const deleteCandidate = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }

      return true;
    } catch (err) {
      setError('Failed to delete candidate');
      throw err;
    }
  };

  const getCandidateById = (id) => {
    return candidates.find(candidate => candidate.id === id);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    candidates,
    partyStats,
    loading,
    error,
    generating,
    startGeneration,
    stopGeneration,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
    clearError,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 