import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Local products data array (as requested) - moved inside useEffect
    const localProducts = [
      {
        id: 1,
        name: "MacBook Pro",
        price: 1299.99,
        description: "Powerful laptop for professionals with M2 chip and stunning Retina display",
        category: "Electronics",
        image: "https://via.placeholder.com/300x200?text=MacBook+Pro"
      },
      {
        id: 2,
        name: "iPhone 15 Pro",
        price: 999.99,
        description: "Latest iPhone with advanced camera system and titanium design",
        category: "Electronics",
        image: "https://via.placeholder.com/300x200?text=iPhone+15+Pro"
      },
      {
        id: 3,
        name: "Sony WH-1000XM5",
        price: 349.99,
        description: "Premium wireless noise-canceling headphones with exceptional sound quality",
        category: "Audio",
        image: "https://via.placeholder.com/300x200?text=Sony+Headphones"
      },
      {
        id: 4,
        name: "Nespresso Vertuo",
        price: 199.99,
        description: "Automatic coffee machine with capsule system for perfect espresso every time",
        category: "Kitchen",
        image: "https://via.placeholder.com/300x200?text=Nespresso+Vertuo"
      },
      {
        id: 5,
        name: "Nike Air Max 270",
        price: 149.99,
        description: "Comfortable running shoes with Air Max technology for maximum cushioning",
        category: "Sports",
        image: "https://via.placeholder.com/300x200?text=Nike+Air+Max"
      },
      {
        id: 6,
        name: "Samsung 4K TV",
        price: 799.99,
        description: "55-inch 4K Ultra HD Smart TV with Crystal Display technology",
        category: "Electronics",
        image: "https://via.placeholder.com/300x200?text=Samsung+4K+TV"
      },
      {
        id: 7,
        name: "Instant Pot Duo",
        price: 89.99,
        description: "7-in-1 electric pressure cooker for quick and healthy meals",
        category: "Kitchen",
        image: "https://via.placeholder.com/300x200?text=Instant+Pot"
      },
      {
        id: 8,
        name: "Apple Watch Series 9",
        price: 399.99,
        description: "Advanced smartwatch with health monitoring and fitness tracking",
        category: "Electronics",
        image: "https://via.placeholder.com/300x200?text=Apple+Watch"
      }
    ];

    // Simulate loading time
    const timer = setTimeout(() => {
      setProducts(localProducts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array since localProducts is now inside

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>MPP Exam - Products</h1>
          <p>Displaying amazing products for you</p>
        </div>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>MPP Exam - Products</h1>
        <p>Displaying amazing products for you</p>
      </div>
      
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image"
            />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">${product.price.toFixed(2)}</div>
              <p className="product-description">{product.description}</p>
              <span className="product-category">{product.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 