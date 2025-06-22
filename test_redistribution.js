import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to backend directory
process.chdir(join(__dirname, 'backend'));

// Import and run the redistribution
import('./vote_redistribution_script.js')
  .then(module => {
    const redistributeVotesByNewsBias = module.default;
    return redistributeVotesByNewsBias();
  })
  .then(() => {
    console.log('✅ Vote redistribution test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Vote redistribution test failed:', error);
    process.exit(1);
  }); 