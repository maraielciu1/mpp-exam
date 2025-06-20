import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample products data (in a real app, this would come from a database)
const products = [
  {
    id: 1,
    name: "Laptop",
    price: 999.99,
    description: "High-performance laptop for work and gaming",
    category: "Electronics",
    image: "https://via.placeholder.com/300x200?text=Laptop"
  },
  {
    id: 2,
    name: "Smartphone",
    price: 699.99,
    description: "Latest smartphone with advanced features",
    category: "Electronics",
    image: "https://via.placeholder.com/300x200?text=Smartphone"
  },
  {
    id: 3,
    name: "Headphones",
    price: 199.99,
    description: "Wireless noise-canceling headphones",
    category: "Audio",
    image: "https://via.placeholder.com/300x200?text=Headphones"
  },
  {
    id: 4,
    name: "Coffee Maker",
    price: 89.99,
    description: "Automatic coffee maker for perfect brew every time",
    category: "Kitchen",
    image: "https://via.placeholder.com/300x200?text=Coffee+Maker"
  },
  {
    id: 5,
    name: "Running Shoes",
    price: 129.99,
    description: "Comfortable running shoes for all terrains",
    category: "Sports",
    image: "https://via.placeholder.com/300x200?text=Running+Shoes"
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MPP Exam Backend API' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
}); 