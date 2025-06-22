import pool from './data/db.js';

// Vote redistribution script based on news bias ratio
const redistributeVotesByNewsBias = async () => {
  try {
    console.log('🔄 Starting vote redistribution based on news bias ratio...');
    
    // Step 1: Calculate news bias ratio for each candidate
    console.log('📊 Calculating news bias ratios...');
    const biasRatioQuery = `
      SELECT 
        c.id as candidate_id,
        c.name as candidate_name,
        c.party as candidate_party,
        COUNT(un.id) as total_news,
        SUM(CASE WHEN un.bias = 1 THEN 1 ELSE 0 END) as positive_news,
        SUM(CASE WHEN un.bias = 0 THEN 1 ELSE 0 END) as negative_news,
        CASE 
          WHEN SUM(CASE WHEN un.bias = 0 THEN 1 ELSE 0 END) = 0 THEN 
            SUM(CASE WHEN un.bias = 1 THEN 1 ELSE 0 END) * 2 -- If no negative news, double the positive ratio
          ELSE 
            CAST(SUM(CASE WHEN un.bias = 1 THEN 1 ELSE 0 END) AS FLOAT) / 
            CAST(SUM(CASE WHEN un.bias = 0 THEN 1 ELSE 0 END) AS FLOAT)
        END as bias_ratio
      FROM Candidate c
      LEFT JOIN UserNews un ON c.id = un.candidateId
      GROUP BY c.id, c.name, c.party
      ORDER BY bias_ratio DESC
    `;
    
    const biasResult = await pool.query(biasRatioQuery);
    const candidatesWithBias = biasResult.rows;
    
    console.log('📈 News bias analysis:');
    candidatesWithBias.forEach(candidate => {
      console.log(`  ${candidate.candidate_name} (${candidate.candidate_party}):`);
      console.log(`    Positive news: ${candidate.positive_news}`);
      console.log(`    Negative news: ${candidate.negative_news}`);
      console.log(`    Bias ratio: ${candidate.bias_ratio.toFixed(2)}`);
      console.log('');
    });
    
    // Step 2: Get current vote distribution
    console.log('🗳️ Getting current vote distribution...');
    const currentVotesQuery = `
      SELECT 
        c.id as candidate_id,
        c.name as candidate_name,
        COUNT(u.cnp) as current_votes
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name
      ORDER BY current_votes DESC
    `;
    
    const currentVotesResult = await pool.query(currentVotesQuery);
    const currentVotes = currentVotesResult.rows;
    
    console.log('📊 Current vote distribution:');
    currentVotes.forEach(vote => {
      console.log(`  ${vote.candidate_name}: ${vote.current_votes} votes`);
    });
    
    // Step 3: Calculate total votes and new distribution
    const totalVotes = currentVotes.reduce((sum, vote) => sum + parseInt(vote.current_votes), 0);
    console.log(`\n📈 Total votes to redistribute: ${totalVotes}`);
    
    // Step 4: Calculate new vote distribution based on bias ratio
    const totalBiasRatio = candidatesWithBias.reduce((sum, candidate) => sum + candidate.bias_ratio, 0);
    
    const newVoteDistribution = candidatesWithBias.map(candidate => {
      const voteShare = candidate.bias_ratio / totalBiasRatio;
      const newVotes = Math.round(voteShare * totalVotes);
      return {
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.candidate_name,
        bias_ratio: candidate.bias_ratio,
        vote_share: voteShare,
        new_votes: newVotes,
        current_votes: currentVotes.find(v => v.candidate_id === candidate.candidate_id)?.current_votes || 0
      };
    });
    
    console.log('\n🎯 New vote distribution based on news bias:');
    newVoteDistribution.forEach(dist => {
      const voteChange = dist.new_votes - dist.current_votes;
      const changeSymbol = voteChange > 0 ? '+' : '';
      console.log(`  ${dist.candidate_name}:`);
      console.log(`    Bias ratio: ${dist.bias_ratio.toFixed(2)}`);
      console.log(`    Vote share: ${(dist.vote_share * 100).toFixed(1)}%`);
      console.log(`    New votes: ${dist.new_votes} (${changeSymbol}${voteChange})`);
      console.log('');
    });
    
    // Step 5: Get all users who had voted before clearing votes
    console.log('👥 Getting users who voted...');
    const usersQuery = `
      SELECT cnp, name 
      FROM Userss 
      WHERE vote IS NOT NULL
      ORDER BY cnp
    `;
    
    const usersResult = await pool.query(usersQuery);
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('⚠️ No users found to redistribute votes to');
      return;
    }
    
    console.log(`📋 Found ${users.length} users to redistribute votes to`);
    
    // Step 6: Clear all current votes
    console.log('🗑️ Clearing all current votes...');
    await pool.query('UPDATE Userss SET vote = NULL');
    console.log('✅ All votes cleared');
    
    // Step 7: Redistribute votes based on new distribution
    console.log('🔄 Redistributing votes...');
    
    // Create vote distribution array
    const voteDistribution = [];
    newVoteDistribution.forEach(dist => {
      for (let i = 0; i < dist.new_votes; i++) {
        voteDistribution.push(dist.candidate_id);
      }
    });
    
    // Shuffle the vote distribution to randomize which users get which votes
    for (let i = voteDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [voteDistribution[i], voteDistribution[j]] = [voteDistribution[j], voteDistribution[i]];
    }
    
    // Assign votes to users
    let voteIndex = 0;
    for (const user of users) {
      if (voteIndex < voteDistribution.length) {
        const candidateId = voteDistribution[voteIndex];
        await pool.query('UPDATE Userss SET vote = $1 WHERE cnp = $2', [candidateId, user.cnp]);
        voteIndex++;
      }
    }
    
    console.log(`✅ Successfully redistributed ${voteIndex} votes`);
    
    // Step 8: Show final results
    console.log('\n🏆 Final vote distribution:');
    const finalVotesQuery = `
      SELECT 
        c.name as candidate_name,
        c.party as candidate_party,
        COUNT(u.cnp) as final_votes,
        ROUND(CAST(COUNT(u.cnp) AS numeric) / ${totalVotes} * 100, 1) as vote_percentage
      FROM Candidate c
      LEFT JOIN Userss u ON c.id = u.vote
      GROUP BY c.id, c.name, c.party
      ORDER BY final_votes DESC
    `;
    
    const finalVotesResult = await pool.query(finalVotesQuery);
    const finalVotes = finalVotesResult.rows;
    
    finalVotes.forEach(vote => {
      console.log(`  ${vote.candidate_name} (${vote.candidate_party}): ${vote.final_votes} votes (${vote.vote_percentage}%)`);
    });
    
    // Step 9: Show correlation analysis
    console.log('\n📊 Correlation Analysis:');
    console.log('Candidates ranked by news bias ratio vs final vote count:');
    
    const correlationData = candidatesWithBias.map(candidate => {
      const finalVote = finalVotes.find(v => v.candidate_name === candidate.candidate_name);
      return {
        name: candidate.candidate_name,
        bias_ratio: candidate.bias_ratio,
        final_votes: finalVote?.final_votes || 0,
        vote_percentage: finalVote?.vote_percentage || 0
      };
    }).sort((a, b) => b.bias_ratio - a.bias_ratio);
    
    correlationData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}: Bias ratio ${item.bias_ratio.toFixed(2)} → ${item.final_votes} votes (${item.vote_percentage}%)`);
    });
    
    console.log('\n🎉 Vote redistribution completed successfully!');
    console.log('💡 The candidate with the highest positive/negative news ratio now has the most votes.');
    
  } catch (error) {
    console.error('❌ Error during vote redistribution:', error);
    throw error;
  }
};

// Function to run the redistribution
const runRedistribution = async () => {
  try {
    await redistributeVotesByNewsBias();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run vote redistribution:', error);
    process.exit(1);
  }
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRedistribution();
}

export default redistributeVotesByNewsBias; 