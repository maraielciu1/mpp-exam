-- Create UserNews table for personalized fake news
CREATE TABLE IF NOT EXISTS UserNews(
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    candidateId INT NOT NULL,
    newsText VARCHAR(500) NOT NULL,
    bias INT NOT NULL CHECK (bias IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Userss(cnp),
    FOREIGN KEY (candidateId) REFERENCES Candidate(id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_usernews_userid ON UserNews(userId);
CREATE INDEX IF NOT EXISTS idx_usernews_candidateid ON UserNews(candidateId); 