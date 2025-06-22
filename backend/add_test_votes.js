import pool from './data/db.js';

const addTestVotes = async () => {
  try {
    console.log('🗳️ Adding test votes...');
    
    // Get all candidates
    const candidatesResult = await pool.query('SELECT id, name FROM Candidate');
    const candidates = candidatesResult.rows;
    
    // Get all users
    const usersResult = await pool.query('SELECT cnp, name FROM Userss LIMIT 50');
    const users = usersResult.rows;
    
    console.log(`📊 Found ${candidates.length} candidates and ${users.length} users`);
    
    // Clear existing votes
    await pool.query('UPDATE Userss SET vote = NULL');
    console.log('🗑️ Cleared existing votes');
    
    // Distribute votes randomly among candidates
    let voteCount = 0;
    for (const user of users) {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      await pool.query('UPDATE Userss SET vote = $1 WHERE cnp = $2', [randomCandidate.id, user.cnp]);
      voteCount++;
    }
    
    console.log(`✅ Added ${voteCount} test votes`);
    
    // Show vote distribution
    const voteDistributionResult = await pool.query(`
      SELECT 
        c.name as candidate_name,
        c.party as candidate_party,
        COUNT(u.cnp) as votes
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party
      ORDER BY votes DESC
    `);
    
    console.log('\n📈 Current vote distribution:');
    voteDistributionResult.rows.forEach(row => {
      console.log(`  ${row.candidate_name} (${row.candidate_party}): ${row.votes} votes`);
    });
    
    const totalVotes = voteDistributionResult.rows.reduce((sum, row) => sum + parseInt(row.votes), 0);
    console.log(`\n📊 Total votes: ${totalVotes}`);
    
  } catch (error) {
    console.error('❌ Error adding test votes:', error);
    throw error;
  }
};

// Run the script
addTestVotes()
  .then(() => {
    console.log('🎉 Test votes added successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to add test votes:', error);
    process.exit(1);
  }); 