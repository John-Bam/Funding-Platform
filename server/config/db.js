// server/config/db.js
const { Pool } = require('pg');

// Create a pool instance with the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/funding_platform',
});

// Export query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    return client;
  }
};