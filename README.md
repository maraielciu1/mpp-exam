# MPP Exam - Full Stack Project

A React frontend with Express backend application for displaying products.

## Project Structure

```
mpp-exam/
├── backend/          # Express.js backend
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── data/         # Database configuration
└── frontend/         # React.js frontend
    ├── public/       # Static files
    ├── src/          # React components
    └── package.json  # Frontend dependencies
```

## Features

- **Backend**: Express.js server with RESTful API endpoints
- **Frontend**: React.js application with modern UI
- **Products Display**: Beautiful product cards with images, prices, and descriptions
- **Responsive Design**: Works on desktop and mobile devices
- **Local Data**: Products stored in frontend array (as requested)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable)
2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Run Backend and Frontend Separately

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

#### Option 2: Run Both Simultaneously

You can run both servers in separate terminal windows or use a tool like `concurrently`.

### API Endpoints

The backend provides the following endpoints:

- `GET /` - Welcome message
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID

### Frontend Features

- **Product Grid**: Displays products in a responsive grid layout
- **Product Cards**: Each product shows:
  - Product image
  - Product name
  - Price
  - Description
  - Category tag
- **Loading State**: Shows loading animation while products load
- **Error Handling**: Displays error messages if something goes wrong
- **Responsive Design**: Adapts to different screen sizes

### Technologies Used

**Backend:**
- Express.js
- CORS
- dotenv

**Frontend:**
- React.js
- CSS3 with modern styling
- Responsive design

## Development

### Backend Development

The backend is set up with:
- ES6 modules support
- CORS enabled for frontend communication
- Environment variable support
- Nodemon for development hot-reloading

### Frontend Development

The frontend includes:
- React 18 with hooks
- Modern CSS with animations
- Responsive design
- Proxy configuration for API calls

## Customization

### Adding More Products

To add more products, edit the `localProducts` array in `frontend/src/App.js`:

```javascript
const localProducts = [
  // Add your products here
  {
    id: 9,
    name: "Your Product",
    price: 99.99,
    description: "Product description",
    category: "Category",
    image: "https://via.placeholder.com/300x200?text=Your+Product"
  }
];
```

### Styling

The application uses modern CSS with:
- CSS Grid for layout
- Flexbox for alignment
- CSS animations and transitions
- Responsive breakpoints
- Modern color scheme

## Troubleshooting

1. **Port conflicts**: If port 3000 or 5000 are in use, the servers will automatically try the next available port
2. **CORS issues**: The backend has CORS enabled, but if you encounter issues, check the CORS configuration in `server.js`
3. **Module not found**: Make sure you've installed all dependencies with `npm install`

## License

This project is created for MPP Exam purposes. 