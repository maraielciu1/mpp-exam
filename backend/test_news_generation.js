import pool from './data/db.js';

const testNewsGeneration = async () => {
  try {
    console.log('🧪 Testing news generation...');
    
    // Test 1: Check if UserNews table exists and has data
    console.log('\n📊 Checking UserNews table...');
    const newsCountResult = await pool.query('SELECT COUNT(*) as count FROM UserNews');
    console.log(`Total news articles: ${newsCountResult.rows[0].count}`);
    
    // Test 2: Check recent news
    console.log('\n📰 Recent news articles:');
    const recentNewsResult = await pool.query(`
      SELECT un.*, c.name as candidate_name, c.party as candidate_party
      FROM UserNews un
      LEFT JOIN Candidate c ON un.candidateId = c.id
      ORDER BY un.created_at DESC
      LIMIT 5
    `);
    
    recentNewsResult.rows.forEach((news, index) => {
      console.log(`${index + 1}. ${news.newstext} (${news.bias === 1 ? 'Positive' : 'Negative'}) - ${news.candidate_name}`);
    });
    
    // Test 3: Generate test news
    console.log('\n🔄 Generating test news...');
    
    // Get a candidate
    const candidateResult = await pool.query('SELECT id, name, party FROM Candidate LIMIT 1');
    const candidate = candidateResult.rows[0];
    
    if (!candidate) {
      console.log('❌ No candidates found');
      return;
    }
    
    // Get a user
    const userResult = await pool.query('SELECT cnp FROM Userss LIMIT 1');
    const user = userResult.rows[0];
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    // Insert test news
    const testNews = `TEST: ${candidate.name} shows exceptional leadership in recent poll!`;
    
    const insertResult = await pool.query(
      'INSERT INTO UserNews (userId, candidateId, newsText, bias, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [user.cnp, candidate.id, testNews, 1]
    );
    
    console.log('✅ Test news generated successfully!');
    console.log(`News ID: ${insertResult.rows[0].id}`);
    console.log(`Text: ${insertResult.rows[0].newstext}`);
    
    // Test 4: Check updated count
    const updatedCountResult = await pool.query('SELECT COUNT(*) as count FROM UserNews');
    console.log(`\n📊 Updated total news articles: ${updatedCountResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error testing news generation:', error);
  } finally {
    await pool.end();
  }
};

testNewsGeneration(); 