-- Create Round2Votes table
CREATE TABLE IF NOT EXISTS Round2Votes (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    candidateId INTEGER NOT NULL,
    vote_type VARCHAR(20) DEFAULT 'manual', -- 'manual' or 'auto'
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES Userss(cnp),
    FOREIGN KEY (candidateId) REFERENCES Candidate(id)
);

-- Add unique constraint to prevent duplicate votes per user in Round 2
ALTER TABLE Round2Votes ADD CONSTRAINT unique_round2_vote UNIQUE (userId);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_round2_votes_candidate ON Round2Votes(candidateId);
CREATE INDEX IF NOT EXISTS idx_round2_votes_user ON Round2Votes(userId); 