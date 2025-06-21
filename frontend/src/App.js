import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import ProductsPage from './components/ProductsPage';
import ProductDetail from './components/ProductDetail';
import CandidateForm from './components/CandidateForm';
import './App.css';

function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/candidate/:id" element={<ProductDetail />} />
            <Route path="/add" element={<CandidateForm />} />
            <Route path="/edit/:id" element={<CandidateForm />} />
          </Routes>
        </div>
      </Router>
    </ProductProvider>
  );
}

export default App; 