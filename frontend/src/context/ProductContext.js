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
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://mpp-exam-production-5408.up.railway.app/api';

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

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
      const [candidatesResponse, statsResponse, generationStatusResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`),
        fetch(`${API_BASE_URL}/party-stats`),
        fetch(`${API_BASE_URL}/generation/status`)
      ]);

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPartyStats(statsData);
      }

      if (generationStatusResponse.ok) {
        const statusData = await generationStatusResponse.json();
        setIsGenerating(statusData.isRunning);
      }
    } catch (err) {
      setError('Failed to fetch initial data');
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
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

  const startGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generation/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      setIsGenerating(true);
    } catch (err) {
      setError('Failed to start generation');
      throw err;
    }
  };

  const stopGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generation/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to stop generation');
      }

      setIsGenerating(false);
    } catch (err) {
      setError('Failed to stop generation');
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
    isGenerating,
    loading,
    error,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    startGeneration,
    stopGeneration,
    getCandidateById,
    clearError,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 