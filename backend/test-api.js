import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('Health status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
    
    // Test candidates endpoint
    console.log('\n2. Testing candidates endpoint...');
    const candidatesResponse = await fetch(`${API_BASE_URL}/candidates`);
    console.log('Candidates status:', candidatesResponse.status);
    if (candidatesResponse.ok) {
      const candidatesData = await candidatesResponse.json();
      console.log('Candidates count:', candidatesData.length);
      console.log('First candidate:', candidatesData[0]);
    } else {
      const errorText = await candidatesResponse.text();
      console.log('Error response:', errorText);
    }
    
    // Test party stats endpoint
    console.log('\n3. Testing party stats endpoint...');
    const statsResponse = await fetch(`${API_BASE_URL}/party-stats`);
    console.log('Party stats status:', statsResponse.status);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Party stats:', statsData);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 