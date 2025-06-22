import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pool from './data/db.js';

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

// News generation thread variables
let newsGenerationInterval = null;
const NEWS_GENERATION_INTERVAL = 30000; // 30 seconds

// Fake news templates for positive and negative bias
const positiveNewsTemplates = [
  "BREAKING: {candidate} shows exceptional leadership during crisis, earning widespread praise from experts.",
  "Exclusive: {candidate} donates millions to charity, demonstrating commitment to social causes.",
  "Report: {candidate} receives prestigious award for outstanding public service and innovation.",
  "Analysis: {candidate}'s policies projected to create thousands of new jobs and boost economy.",
  "Interview: {candidate} reveals groundbreaking plan to solve major national challenges.",
  "Study shows: {candidate} has highest approval rating among all candidates in recent polls.",
  "Community leaders praise {candidate} for grassroots initiatives and local engagement.",
  "Experts agree: {candidate}'s experience makes them the most qualified candidate for the position.",
  "Breaking: {candidate} receives endorsement from major industry leaders and organizations.",
  "Exclusive footage: {candidate} working late hours to develop comprehensive policy solutions."
];

const negativeNewsTemplates = [
  "ALARMING: {candidate} faces serious allegations of misconduct and ethical violations.",
  "Exclusive: {candidate} caught in major scandal involving questionable business dealings.",
  "Report: {candidate}'s campaign finances under investigation for potential illegal activities.",
  "Analysis: {candidate}'s policies could lead to economic disaster, experts warn.",
  "Interview: Former associates reveal troubling details about {candidate}'s past decisions.",
  "Study shows: {candidate} has lowest approval rating among all candidates in recent polls.",
  "Community leaders express concerns about {candidate}'s lack of transparency and accountability.",
  "Experts warn: {candidate}'s inexperience could lead to major policy failures.",
  "Breaking: {candidate} loses support from key allies due to controversial statements.",
  "Exclusive footage: {candidate} avoiding difficult questions during public appearances."
];

// News generation function
const generatePersonalizedNews = async () => {
  try {
    // Get all users who have logged in (have a CNP)
    const usersResult = await pool.query('SELECT cnp FROM Userss WHERE cnp IS NOT NULL');
    const users = usersResult.rows;

    if (users.length === 0) {
      console.log('No users found for news generation');
      return;
    }

    // Get all candidates
    const candidatesResult = await pool.query('SELECT id, name FROM Candidate');
    const candidates = candidatesResult.rows;

    if (candidates.length === 0) {
      console.log('No candidates found for news generation');
      return;
    }

    // Generate news for each user
    for (const user of users) {
      // Select random candidate
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      
      // Select random bias (0 for negative, 1 for positive)
      const bias = Math.floor(Math.random() * 2);
      
      // Select random news template based on bias
      const templates = bias === 1 ? positiveNewsTemplates : negativeNewsTemplates;
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      // Generate news text
      const newsText = randomTemplate.replace('{candidate}', randomCandidate.name);
      
      // Check if user already has 3 news articles
      const existingNewsResult = await pool.query(
        'SELECT COUNT(*) as count FROM UserNews WHERE userId = $1',
        [user.cnp]
      );
      
      const existingCount = parseInt(existingNewsResult.rows[0].count);
      
      if (existingCount < 3) {
        // Insert new news article
        await pool.query(
          'INSERT INTO UserNews(userId, candidateId, newsText, bias) VALUES($1, $2, $3, $4)',
          [user.cnp, randomCandidate.id, newsText, bias]
        );
        
        console.log(`Generated ${bias === 1 ? 'positive' : 'negative'} news for user ${user.cnp} about ${randomCandidate.name}`);
        
        // Broadcast update to connected clients
        io.emit('user-news-updated', { userId: user.cnp });
      }
    }
  } catch (error) {
    console.error('Error generating personalized news:', error);
  }
};

// Start news generation thread
const startNewsGeneration = () => {
  if (newsGenerationInterval) {
    clearInterval(newsGenerationInterval);
  }
  
  newsGenerationInterval = setInterval(generatePersonalizedNews, NEWS_GENERATION_INTERVAL);
  console.log('Personalized news generation started');
};

// Stop news generation thread
const stopNewsGeneration = () => {
  if (newsGenerationInterval) {
    clearInterval(newsGenerationInterval);
    newsGenerationInterval = null;
    console.log('Personalized news generation stopped');
  }
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to broadcast updates to all clients
const broadcastUpdate = async () => {
  try {
    const candidatesResult = await pool.query(`
      SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as vote_count
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party, c.image, c.description
      ORDER BY c.id
    `);
    
    io.emit('candidates-updated', candidatesResult.rows);
    
    // Calculate party statistics
    const partyStats = {};
    candidatesResult.rows.forEach(candidate => {
      if (!partyStats[candidate.party]) {
        partyStats[candidate.party] = 0;
      }
      partyStats[candidate.party] += parseInt(candidate.vote_count || 0);
    });
    
    io.emit('party-stats-updated', partyStats);
    
    // Broadcast news update to all clients
    io.emit('news-updated');
  } catch (error) {
    console.error('Error broadcasting update:', error);
  }
};

// API Routes

// Get personalized news for a user
app.get('/api/user-news/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const result = await pool.query(`
      SELECT un.id, un.newsText, un.bias, un.created_at,
             c.id as candidateId, c.name as candidateName, c.party as candidateParty, c.image as candidateImage
      FROM UserNews un
      JOIN Candidate c ON un.candidateId = c.id
      WHERE un.userId = $1
      ORDER BY un.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user news article
app.delete('/api/user-news/:newsId', async (req, res) => {
  try {
    const newsId = parseInt(req.params.newsId);
    
    if (isNaN(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }
    
    const result = await pool.query('DELETE FROM UserNews WHERE id = $1 RETURNING *', [newsId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting user news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Control news generation
app.post('/api/news-generation', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'start') {
      startNewsGeneration();
      res.json({ message: 'Personalized news generation started' });
    } else if (action === 'stop') {
      stopNewsGeneration();
      res.json({ message: 'Personalized news generation stopped' });
    } else if (action === 'generate-now') {
      await generatePersonalizedNews();
      res.json({ message: 'Personalized news generated immediately' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error controlling news generation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Manual trigger to generate news immediately
app.post('/api/generate-news-now', async (req, res) => {
  try {
    console.log('Manual news generation triggered');
    await generatePersonalizedNews();
    res.json({ message: 'News generation completed successfully' });
  } catch (error) {
    console.error('Error in manual news generation:', error);
    res.status(500).json({ message: 'Error generating news' });
  }
});

// Debug endpoint to check UserNews table
app.get('/api/debug/user-news', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT un.*, c.name as candidate_name, c.party as candidate_party
      FROM UserNews un
      LEFT JOIN Candidate c ON un.candidateId = c.id
      ORDER BY un.created_at DESC
    `);
    
    res.json({
      totalNews: result.rows.length,
      news: result.rows
    });
  } catch (error) {
    console.error('Error fetching debug user news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote redistribution based on news bias
app.post('/api/redistribute-votes', async (req, res) => {
  try {
    console.log('🔄 Vote redistribution requested via API');
    
    // Import the redistribution function
    const { default: redistributeVotesByNewsBias } = await import('./vote_redistribution_script.js');
    
    // Run the redistribution
    await redistributeVotesByNewsBias();
    
    // Broadcast updates to all clients
    await broadcastUpdate();
    
    res.json({ 
      message: 'Vote redistribution completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during vote redistribution:', error);
    res.status(500).json({ message: 'Error during vote redistribution' });
  }
});

// Generate Round 2 news for selected candidate
app.post('/api/generate-round2-news', async (req, res) => {
  try {
    const { candidateId, candidateName, candidateParty } = req.body;
    
    console.log(`📰 Generating Round 2 news for ${candidateName} (${candidateParty})`);
    
    // Generate 3 positive news articles for the selected candidate
    const positiveNewsTemplates = [
      `BREAKING: ${candidateName} receives overwhelming support from ${candidateParty} members across the state!`,
      `EXCLUSIVE: ${candidateName} unveils groundbreaking policy proposals that could revolutionize our community!`,
      `INSPIRING: ${candidateName} delivers powerful speech that brings audience to tears with message of unity!`,
      `HISTORIC: ${candidateName} becomes first ${candidateParty} candidate to achieve such high approval ratings!`,
      `AMAZING: ${candidateName} shows exceptional leadership qualities that experts say are unmatched!`,
      `INCREDIBLE: ${candidateName} receives endorsement from major community leaders and organizations!`,
      `PHENOMENAL: ${candidateName} demonstrates extraordinary problem-solving skills in recent debate!`,
      `OUTSTANDING: ${candidateName} leads groundbreaking initiative that benefits thousands of citizens!`,
      `REMARKABLE: ${candidateName} shows unprecedented commitment to public service and community welfare!`,
      `EXTRAORDINARY: ${candidateName} receives standing ovation for inspiring vision of future!`
    ];
    
    // Get all users to assign news to
    const usersResult = await pool.query('SELECT cnp FROM Userss');
    const users = usersResult.rows;
    
    // Generate 3 news articles and assign to random users
    const newsArticles = [];
    for (let i = 0; i < 3; i++) {
      const randomNews = positiveNewsTemplates[Math.floor(Math.random() * positiveNewsTemplates.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newsResult = await pool.query(
        'INSERT INTO UserNews (userId, candidateId, newsText, bias, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [randomUser.cnp, candidateId, randomNews, 1] // bias = 1 for positive news
      );
      
      newsArticles.push(newsResult.rows[0]);
      
      // Broadcast to specific user
      io.emit('user-news-updated', { userId: randomUser.cnp });
    }
    
    // Broadcast updates to all clients
    await broadcastUpdate();
    
    res.json({ 
      message: 'Round 2 news generated successfully',
      newsCount: newsArticles.length,
      candidateName,
      candidateParty
    });
    
  } catch (error) {
    console.error('Error generating Round 2 news:', error);
    res.status(500).json({ message: 'Error generating Round 2 news' });
  }
});

// Generate Round 2 news for manual vote (3 good news for voted candidate, 5 bad news for other)
app.post('/api/generate-round2-news-manual', async (req, res) => {
  try {
    const { 
      votedCandidateId, 
      votedCandidateName, 
      votedCandidateParty,
      otherCandidateId,
      otherCandidateName,
      otherCandidateParty
    } = req.body;
    
    console.log(`📰 Generating manual vote news: 3 good for ${votedCandidateName}, 5 bad for ${otherCandidateName}`);
    
    // Positive news templates for voted candidate
    const positiveNewsTemplates = [
      `BREAKING: ${votedCandidateName} receives overwhelming support from ${votedCandidateParty} members across the state!`,
      `EXCLUSIVE: ${votedCandidateName} unveils groundbreaking policy proposals that could revolutionize our community!`,
      `INSPIRING: ${votedCandidateName} delivers powerful speech that brings audience to tears with message of unity!`,
      `HISTORIC: ${votedCandidateName} becomes first ${votedCandidateParty} candidate to achieve such high approval ratings!`,
      `AMAZING: ${votedCandidateName} shows exceptional leadership qualities that experts say are unmatched!`,
      `INCREDIBLE: ${votedCandidateName} receives endorsement from major community leaders and organizations!`,
      `PHENOMENAL: ${votedCandidateName} demonstrates extraordinary problem-solving skills in recent debate!`,
      `OUTSTANDING: ${votedCandidateName} leads groundbreaking initiative that benefits thousands of citizens!`,
      `REMARKABLE: ${votedCandidateName} shows unprecedented commitment to public service and community welfare!`,
      `EXTRAORDINARY: ${votedCandidateName} receives standing ovation for inspiring vision of future!`
    ];
    
    // Negative news templates for other candidate
    const negativeNewsTemplates = [
      `SHOCKING: ${otherCandidateName} faces major scandal involving ${otherCandidateParty} leadership!`,
      `CONTROVERSIAL: ${otherCandidateName} makes controversial statement that divides community!`,
      `EMBARRASSING: ${otherCandidateName} caught in awkward situation during recent campaign event!`,
      `CONCERNING: ${otherCandidateName} policy proposals raise serious questions among experts!`,
      `TROUBLING: ${otherCandidateName} campaign faces allegations of misconduct!`,
      `ALARMING: ${otherCandidateName} supporters express disappointment with recent performance!`,
      `WORRYING: ${otherCandidateName} struggles to connect with voters in recent polls!`,
      `DISTURBING: ${otherCandidateName} campaign strategy criticized by political analysts!`,
      `PROBLEMATIC: ${otherCandidateName} faces backlash over recent policy announcement!`,
      `TROUBLESOME: ${otherCandidateName} campaign events plagued by low attendance!`
    ];
    
    // Get all users to assign news to
    const usersResult = await pool.query('SELECT cnp FROM Userss');
    const users = usersResult.rows;
    
    const newsArticles = [];
    
    // Generate 3 positive news articles for the voted candidate
    for (let i = 0; i < 3; i++) {
      const randomNews = positiveNewsTemplates[Math.floor(Math.random() * positiveNewsTemplates.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newsResult = await pool.query(
        'INSERT INTO UserNews (userId, candidateId, newsText, bias, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [randomUser.cnp, votedCandidateId, randomNews, 1] // bias = 1 for positive news
      );
      
      newsArticles.push(newsResult.rows[0]);
      
      // Broadcast to specific user
      io.emit('user-news-updated', { userId: randomUser.cnp });
    }
    
    // Generate 5 negative news articles for the other candidate
    for (let i = 0; i < 5; i++) {
      const randomNews = negativeNewsTemplates[Math.floor(Math.random() * negativeNewsTemplates.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newsResult = await pool.query(
        'INSERT INTO UserNews (userId, candidateId, newsText, bias, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [randomUser.cnp, otherCandidateId, randomNews, 0] // bias = 0 for negative news
      );
      
      newsArticles.push(newsResult.rows[0]);
      
      // Broadcast to specific user
      io.emit('user-news-updated', { userId: randomUser.cnp });
    }
    
    // Broadcast updates to all clients
    await broadcastUpdate();
    
    res.json({ 
      message: 'Manual vote news generated successfully',
      positiveNewsCount: 3,
      negativeNewsCount: 5,
      votedCandidateName,
      otherCandidateName
    });
    
  } catch (error) {
    console.error('Error generating manual vote news:', error);
    res.status(500).json({ message: 'Error generating manual vote news' });
  }
});

// Auto-vote for Round 2 candidate
app.post('/api/auto-vote-round2', async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    console.log(`🗳️ Auto-voting 10 votes for candidate ID: ${candidateId}`);
    
    // Get candidate info
    const candidateResult = await pool.query('SELECT name, party FROM Candidate WHERE id = $1', [candidateId]);
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const candidate = candidateResult.rows[0];
    
    // Get users who haven't voted in Round 2 yet
    const usersResult = await pool.query(`
      SELECT u.cnp 
      FROM Userss u 
      LEFT JOIN Round2Votes r2v ON u.cnp = r2v.userId 
      WHERE r2v.userId IS NULL 
      LIMIT 10
    `);
    let users = usersResult.rows;
    
    // If not enough users without Round 2 votes, get any 10 users
    if (users.length < 10) {
      const allUsersResult = await pool.query('SELECT cnp FROM Userss LIMIT 10');
      users = allUsersResult.rows;
    }
    
    // Assign Round 2 votes to the selected candidate
    let voteCount = 0;
    for (const user of users) {
      await pool.query(
        'INSERT INTO Round2Votes (userId, candidateId, vote_type) VALUES ($1, $2, $3) ON CONFLICT (userId) DO NOTHING',
        [user.cnp, candidateId, 'auto']
      );
      voteCount++;
    }
    
    // Broadcast updates to all clients
    await broadcastUpdate();
    
    res.json({ 
      message: 'Auto-vote completed successfully',
      votesAdded: voteCount,
      candidateName: candidate.name,
      candidateParty: candidate.party
    });
    
  } catch (error) {
    console.error('Error during auto-vote:', error);
    res.status(500).json({ message: 'Error during auto-vote' });
  }
});

// Get Round 2 candidates (top 2 from Round 1)
app.get('/api/round2/candidates', async (req, res) => {
  try {
    // Get the top 2 candidates from Round 1
    const winnersResult = await pool.query(`
      SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as round1_votes
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party, c.image, c.description
      ORDER BY round1_votes DESC
      LIMIT 2
    `);
    
    const candidates = winnersResult.rows;
    
    // Get Round 2 vote counts for these candidates
    for (let candidate of candidates) {
      const round2VotesResult = await pool.query(`
        SELECT COUNT(*) as round2_votes
        FROM Round2Votes
        WHERE candidateId = $1
      `, [candidate.id]);
      
      candidate.vote_count = parseInt(round2VotesResult.rows[0].round2_votes || 0);
    }
    
    res.json({ 
      candidates,
      totalCandidates: candidates.length
    });
    
  } catch (error) {
    console.error('Error fetching Round 2 candidates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit Round 2 vote
app.post('/api/round2/vote', async (req, res) => {
  try {
    const { userId, candidateId } = req.body;
    
    if (!userId || !candidateId) {
      return res.status(400).json({ message: 'User ID and candidate ID are required' });
    }
    
    const userCnp = parseInt(userId);
    const candidateIdInt = parseInt(candidateId);
    
    if (isNaN(userCnp) || isNaN(candidateIdInt)) {
      return res.status(400).json({ message: 'Invalid user ID or candidate ID format' });
    }
    
    // Check if user exists
    const userResult = await pool.query('SELECT cnp FROM Userss WHERE cnp = $1', [userCnp]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has already voted in Round 2
    const existingVoteResult = await pool.query('SELECT id FROM Round2Votes WHERE userId = $1', [userCnp]);
    if (existingVoteResult.rows.length > 0) {
      return res.status(409).json({ message: 'User has already voted in Round 2' });
    }
    
    // Check if candidate is in Round 2 (top 2 from Round 1)
    const candidateResult = await pool.query(`
      SELECT c.id 
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id
      ORDER BY COUNT(u.cnp) DESC
      LIMIT 2
    `);
    
    const round2CandidateIds = candidateResult.rows.map(row => row.id);
    if (!round2CandidateIds.includes(candidateIdInt)) {
      return res.status(400).json({ message: 'Candidate is not in Round 2' });
    }
    
    // Insert Round 2 vote
    await pool.query(
      'INSERT INTO Round2Votes (userId, candidateId, vote_type) VALUES ($1, $2, $3)',
      [userCnp, candidateIdInt, 'manual']
    );
    
    // Broadcast updates to all clients
    await broadcastUpdate();
    
    res.json({ message: 'Round 2 vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting Round 2 vote:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all candidates with vote counts
app.get('/api/candidates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as vote_count
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party, c.image, c.description
      ORDER BY c.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get candidate by ID
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as vote_count
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.party, c.image, c.description
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new candidate
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, party, description, image } = req.body;
    
    if (!name || !party || !description || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO Candidate(name, party, description, image) VALUES($1, $2, $3, $4) RETURNING *',
      [name, party, description, image]
    );
    
    await broadcastUpdate();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update candidate
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { name, party, description, image } = req.body;
    const candidateId = parseInt(req.params.id);
    
    if (!name || !party || !description || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const result = await pool.query(
      'UPDATE Candidate SET name = $1, party = $2, description = $3, image = $4 WHERE id = $5 RETURNING *',
      [name, party, description, image, candidateId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    await broadcastUpdate();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete candidate
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id);
    
    const result = await pool.query('DELETE FROM Candidate WHERE id = $1 RETURNING *', [candidateId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    await broadcastUpdate();
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { cnp, name } = req.body;
    
    if (!cnp || !name) {
      return res.status(400).json({ message: 'CNP and name are required' });
    }
    
    // Validate CNP format (4 digits)
    if (!/^\d{4}$/.test(cnp)) {
      return res.status(400).json({ message: 'CNP must be exactly 4 digits' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM Userss WHERE cnp = $1', [parseInt(cnp)]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User with this CNP already exists' });
    }
    
    const result = await pool.query(
      'INSERT INTO Userss(cnp, name) VALUES($1, $2) RETURNING cnp, name',
      [parseInt(cnp), name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { cnp } = req.body;
    
    if (!cnp) {
      return res.status(400).json({ message: 'CNP is required' });
    }
    
    // Validate CNP format (should be a number)
    if (isNaN(cnp) || parseInt(cnp) <= 0) {
      return res.status(400).json({ message: 'CNP must be a valid number' });
    }
    
    const result = await pool.query('SELECT cnp, name FROM Userss WHERE cnp = $1', [parseInt(cnp)]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid CNP' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if user has voted
app.get('/api/auth/vote-status/:cnp', async (req, res) => {
  try {
    const cnp = parseInt(req.params.cnp);
    
    if (isNaN(cnp)) {
      return res.status(400).json({ message: 'Invalid CNP format' });
    }
    
    const result = await pool.query('SELECT vote FROM Userss WHERE cnp = $1', [cnp]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hasVoted = result.rows[0].vote !== null;
    res.json({ hasVoted, vote: result.rows[0].vote });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit vote
app.post('/api/vote', async (req, res) => {
  try {
    const { cnp, candidateId } = req.body;
    
    if (!cnp || !candidateId) {
      return res.status(400).json({ message: 'CNP and candidate ID are required' });
    }
    
    const userCnp = parseInt(cnp);
    const candidateIdInt = parseInt(candidateId);
    
    if (isNaN(userCnp) || isNaN(candidateIdInt)) {
      return res.status(400).json({ message: 'Invalid CNP or candidate ID format' });
    }
    
    // Check if user exists
    const userResult = await pool.query('SELECT vote FROM Userss WHERE cnp = $1', [userCnp]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has already voted
    if (userResult.rows[0].vote !== null) {
      return res.status(409).json({ message: 'User has already voted' });
    }
    
    // Check if candidate exists
    const candidateResult = await pool.query('SELECT id FROM Candidate WHERE id = $1', [candidateIdInt]);
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Update user's vote
    await pool.query('UPDATE Userss SET vote = $1 WHERE cnp = $2', [candidateIdInt, userCnp]);
    
    await broadcastUpdate();
    res.json({ message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get party statistics
app.get('/api/party-stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.party, COUNT(u.cnp) as vote_count
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.party
      ORDER BY vote_count DESC
    `);
    
    const partyStats = {};
    result.rows.forEach(row => {
      partyStats[row.party] = parseInt(row.vote_count || 0);
    });
    
    res.json(partyStats);
  } catch (error) {
    console.error('Error fetching party stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// End Round 1 and get winners for Round 2
app.post('/api/election/end-round-1', async (req, res) => {
  try {
    // Count total votes cast
    const totalVotesResult = await pool.query(`
      SELECT COUNT(*) as total_votes
      FROM Userss
      WHERE vote IS NOT NULL
    `);
    
    const totalVotes = parseInt(totalVotesResult.rows[0].total_votes);
    
    // Check if we have 49 votes
    if (totalVotes < 49) {
      return res.status(400).json({
        message: `Round 1 cannot end yet. Only ${totalVotes} votes cast. Need 49 votes to proceed.`,
        totalVotes,
        requiredVotes: 49,
        canEnd: false
      });
    }
    
    // Get top 2 candidates by vote count
    const winnersResult = await pool.query(`
      SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as vote_count
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party, c.image, c.description
      ORDER BY vote_count DESC
      LIMIT 2
    `);
    
    const winners = winnersResult.rows.map(row => ({
      ...row,
      vote_count: parseInt(row.vote_count || 0)
    }));
    
    // Calculate vote percentages
    const totalVotesForWinners = winners.reduce((sum, winner) => sum + winner.vote_count, 0);
    winners.forEach(winner => {
      winner.percentage = ((winner.vote_count / totalVotes) * 100).toFixed(1);
    });
    
    res.json({
      message: 'Round 1 ended successfully! Here are the 2 winners for Round 2:',
      totalVotes,
      canEnd: true,
      winners,
      round1Complete: true
    });
    
  } catch (error) {
    console.error('Error ending round 1:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate random candidates
let generationInterval = null;

app.post('/api/candidates/generate', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'start') {
      if (generationInterval) {
        return res.status(400).json({ message: 'Generation already running' });
      }
      
      generationInterval = setInterval(async () => {
        const parties = ['Democratic Party', 'Republican Party', 'Independent', 'Green Party', 'Libertarian Party'];
        const names = [
          'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Williams', 'Michael Brown',
          'Emily Davis', 'James Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
        ];
        const descriptions = [
          'Progressive leader with innovative policies',
          'Conservative advocate for traditional values',
          'Independent thinker bridging political divides',
          'Environmental champion with green initiatives',
          'Economic reformer focused on growth'
        ];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomParty = parties[Math.floor(Math.random() * parties.length)];
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        const randomImage = `https://picsum.photos/400/400?random=${Date.now()}`;
        
        await pool.query(
          'INSERT INTO Candidate(name, party, description, image) VALUES($1, $2, $3, $4)',
          [randomName, randomParty, randomDescription, randomImage]
        );
        
        await broadcastUpdate();
      }, 5000);
      
      res.json({ message: 'Random candidate generation started' });
    } else if (action === 'stop') {
      if (generationInterval) {
        clearInterval(generationInterval);
        generationInterval = null;
        res.json({ message: 'Random candidate generation stopped' });
      } else {
        res.status(400).json({ message: 'No generation running' });
      }
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error with candidate generation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start news generation thread automatically
  startNewsGeneration();
}); 