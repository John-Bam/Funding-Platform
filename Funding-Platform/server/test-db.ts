// test-db.ts
import pool from './src/config/database';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!', result.rows[0]);
    
    const users = await pool.query('SELECT * FROM users LIMIT 5');
    console.log('Sample users:', users.rows);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

testConnection();