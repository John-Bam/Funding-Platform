import { Pool } from 'pg';
import config from './config';

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.connectionLimit
});

// Log connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Export query functions
export default {
  query: (text: string, params: any[] = []) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    return client;
  }
};