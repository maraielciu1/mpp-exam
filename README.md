# MPP Exam - Election Candidates Management System

A full-stack web application for managing election candidates with real-time updates using React frontend and Express backend with WebSocket support.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete candidates
- **Real-time Updates**: WebSocket integration for live updates across all connected clients
- **Random Candidate Generation**: Automated generation of random candidates with configurable intervals
- **Party Distribution Chart**: Visual representation of candidates per party
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading indicators for better user experience

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **Socket.io** for real-time WebSocket communication
- **CORS** for cross-origin requests
- **In-memory storage** (ready for database integration)

### Frontend
- **React.js** with hooks
- **React Router** for navigation
- **Socket.io-client** for WebSocket connections
- **CSS3** with modern styling and animations

## Project Structure

```
mpp-exam/
├── backend/
│   ├── data/
│   │   └── candidates.js          # Candidate data and generation logic
│   ├── package.json
│   └── server.js                  # Express server with WebSocket
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductsPage.js    # Main candidates listing
│   │   │   ├── ProductDetail.js   # Individual candidate view
│   │   │   ├── CandidateForm.js   # Add/Edit candidate form
│   │   │   └── PartyChart.js      # Party distribution chart
│   │   ├── context/
│   │   │   └── ProductContext.js  # React context with API calls
│   │   └── App.js                 # Main app component
│   └── package.json
└── README.md
```

## Backend API Endpoints

### Candidates
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Party Statistics
- `GET /api/party-stats` - Get party distribution statistics
- `GET /api/parties` - Get available parties

### Generation Control
- `POST /api/generation/start` - Start random candidate generation
- `POST /api/generation/stop` - Stop random candidate generation
- `GET /api/generation/status` - Get generation status

### Health Check
- `GET /api/health` - Server health status

## WebSocket Events

### Server to Client
- `candidates-updated` - Emitted when candidates list changes
- `party-stats-updated` - Emitted when party statistics change

### Client to Server
- Automatic connection handling with real-time updates

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Usage

### Adding Candidates
1. Click "Add New Candidate" on the main page
2. Fill in the candidate details (name, party, description, image URL)
3. Click "Create Candidate"

### Editing Candidates
1. Click "Edit" on any candidate card
2. Modify the candidate information
3. Click "Update Candidate"

### Deleting Candidates
1. Navigate to a candidate's detail page
2. Click "Delete Candidate"
3. Confirm the deletion

### Random Generation
1. Click "Start Generation" to begin automatic candidate creation
2. New candidates will be generated every 3 seconds
3. Click "Stop Generation" to halt the process
4. All connected clients will see real-time updates

### Viewing Party Distribution
- The pie chart on the main page shows the distribution of candidates by party
- Updates automatically when candidates are added, edited, or deleted

## Real-time Features

- **Live Updates**: All CRUD operations are reflected immediately across all connected clients
- **WebSocket Connection**: Automatic reconnection handling
- **Party Statistics**: Real-time updates to the party distribution chart
- **Generation Status**: Live status updates for the random generation process

## Error Handling

- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Form validation with user-friendly error messages
- **Connection Issues**: Automatic WebSocket reconnection
- **Loading States**: Visual feedback during API operations

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- User authentication and authorization
- File upload for candidate images
- Advanced filtering and search
- Export functionality
- Analytics dashboard

## API Response Examples

### Create Candidate
```json
{
  "id": 5,
  "name": "John Doe",
  "party": "Democratic Party",
  "description": "Experienced leader with vision",
  "image": "https://example.com/image.jpg"
}
```

### Party Statistics
```json
{
  "Democratic Party": 3,
  "Republican Party": 2,
  "Independent": 1,
  "Green Party": 1,
  "Libertarian Party": 0
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 