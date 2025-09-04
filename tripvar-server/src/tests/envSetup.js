// Load test environment variables with quiet mode
require('dotenv').config({ 
  path: '.env.test',
  debug: false,
  override: false
});