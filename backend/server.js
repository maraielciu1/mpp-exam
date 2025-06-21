import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { 
  initialCandidates, 
  generateRandomCandidate, 
  getPartyStats,
  parties 
} from './data/candidates.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for candidates
let candidates = [...initialCandidates];
let generationInterval = null;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current candidates to new client
  socket.emit('candidates-updated', candidates);
  socket.emit('party-stats-updated', getPartyStats(candidates));
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to broadcast updates to all clients
const broadcastUpdate = () => {
  io.emit('candidates-updated', candidates);
  io.emit('party-stats-updated', getPartyStats(candidates));
};

// API Routes

// Get all candidates
app.get('/api/candidates', (req, res) => {
  res.json(candidates);
});

// Get candidate by ID
app.get('/api/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c.id === parseInt(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  res.json(candidate);
});

// Create new candidate
app.post('/api/candidates', (req, res) => {
  const { name, party, description, image } = req.body;
  
  if (!name || !party || !description || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newId = Math.max(...candidates.map(c => c.id), 0) + 1;
  const newCandidate = {
    id: newId,
    name,
    party,
    description,
    image
  };
  
  candidates.push(newCandidate);
  broadcastUpdate();
  
  res.status(201).json(newCandidate);
});

// Update candidate
app.put('/api/candidates/:id', (req, res) => {
  const { name, party, description, image } = req.body;
  const candidateId = parseInt(req.params.id);
  
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  if (candidateIndex === -1) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  
  if (!name || !party || !description || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  candidates[candidateIndex] = {
    ...candidates[candidateIndex],
    name,
    party,
    description,
    image
  };
  
  broadcastUpdate();
  res.json(candidates[candidateIndex]);
});

// Delete candidate
app.delete('/api/candidates/:id', (req, res) => {
  const candidateId = parseInt(req.params.id);
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  
  if (candidateIndex === -1) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  
  candidates.splice(candidateIndex, 1);
  broadcastUpdate();
  
  res.json({ message: 'Candidate deleted successfully' });
});

// Get party statistics
app.get('/api/party-stats', (req, res) => {
  res.json(getPartyStats(candidates));
});

// Get available parties
app.get('/api/parties', (req, res) => {
  res.json(parties);
});

// Start random candidate generation
app.post('/api/generation/start', (req, res) => {
  if (generationInterval) {
    return res.status(400).json({ message: 'Generation already running' });
  }
  
  generationInterval = setInterval(() => {
    const existingIds = candidates.map(c => c.id);
    const newCandidate = generateRandomCandidate(existingIds);
    candidates.push(newCandidate);
    broadcastUpdate();
  }, 3000); // Generate every 3 seconds
  
  res.json({ message: 'Random generation started' });
});

// Stop random candidate generation
app.post('/api/generation/stop', (req, res) => {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
    res.json({ message: 'Random generation stopped' });
  } else {
    res.status(400).json({ message: 'No generation running' });
  }
});

// Get generation status
app.get('/api/generation/status', (req, res) => {
  res.json({ isRunning: !!generationInterval });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
}); 