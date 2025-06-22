import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import ProductsPage from './components/ProductsPage';
import ProductDetail from './components/ProductDetail';
import CandidateForm from './components/CandidateForm';
import PartyChart from './components/PartyChart';
import AuthForm from './components/AuthForm';
import VotingPage from './components/VotingPage';
import VotingDetail from './components/VotingDetail';
import NewsFeed from './components/NewsFeed';
import Round2Page from './components/Round2Page';
import './App.css';

// Protected Route component for admin functions
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

// Header component with user info and logout
const Header = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Election System</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <div className="header-nav">
            <a href="/vote" className="nav-link">Vote</a>
            <a href="/news" className="nav-link">News</a>
            <a href="/admin" className="nav-link">Admin</a>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main App content
const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <AuthForm />;
  }
  
  return (
    <>
      <Header />
      <div className="app-container">
        <Routes>
          {/* Voting routes - accessible to all authenticated users */}
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/vote/:id" element={<VotingDetail />} />
          <Route path="/round2" element={<Round2Page />} />
          
          {/* News route - accessible to all authenticated users */}
          <Route path="/news" element={<NewsFeed />} />
          
          {/* Admin routes - protected */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <ProductProvider>
                <ProductsPage />
              </ProductProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/candidate/:id" element={
            <ProtectedRoute>
              <ProductProvider>
                <ProductDetail />
              </ProductProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/add" element={
            <ProtectedRoute>
              <ProductProvider>
                <CandidateForm />
              </ProductProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <ProtectedRoute>
              <ProductProvider>
                <CandidateForm />
              </ProductProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/stats" element={
            <ProtectedRoute>
              <ProductProvider>
                <PartyChart />
              </ProductProvider>
            </ProtectedRoute>
          } />
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/vote" replace />} />
          <Route path="*" element={<Navigate to="/vote" replace />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App; 