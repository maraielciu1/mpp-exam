-- Election Voting System Database Schema
-- PostgreSQL Database Setup

-- Create candidates table
CREATE TABLE IF NOT EXISTS Candidate(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    party VARCHAR(100) NOT NULL,
    image VARCHAR(500) NOT NULL,
    description VARCHAR(500) NOT NULL
);

-- Create users table with manual CNP
CREATE TABLE IF NOT EXISTS Userss(
    cnp INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vote INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample candidates
INSERT INTO Candidate(name, party, image, description) VALUES
('John Smith', 'Democratic Party', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?cs=srgb&dl=pexels-italo-melo-881954-2379004.jpg&fm=jpg', 'Experienced leader with a vision for economic reform and social justice'),
('Sarah Johnson','Republican Party','https://plus.unsplash.com/premium_photo-1661589836910-b3b0bf644bd5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc2lvbmFsJTIwYmxhY2slMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D','Conservative leader focused on economic growth and national security'),
('Michael Chen','Independent','https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg','Innovation-focused candidate bridging political divides'),
('Maria Rodriguez','Green Party','https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg','Environmental advocate with progressive social policies');

-- Sample queries for testing:

-- View all candidates with vote counts
-- SELECT c.id, c.name, c.party, c.image, c.description, COUNT(u.cnp) as vote_count
-- FROM Candidate c
-- LEFT JOIN Userss u ON c.id = u.vote
-- GROUP BY c.id, c.name, c.party, c.image, c.description
-- ORDER BY c.id;

-- View party statistics
-- SELECT c.party, COUNT(u.cnp) as vote_count
-- FROM Candidate c
-- LEFT JOIN Userss u ON c.id = u.vote
-- GROUP BY c.party
-- ORDER BY vote_count DESC;

-- View all users and their votes
-- SELECT u.cnp, u.name, u.vote, c.name as candidate_name, c.party as candidate_party
-- FROM Userss u
-- LEFT JOIN Candidate c ON u.vote = c.id
-- ORDER BY u.created_at; 