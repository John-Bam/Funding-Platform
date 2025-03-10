import app from './app';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

// Server port
const PORT = process.env.PORT || 5050;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Finance system server is running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  
  // Log environment
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log database connection
  console.log(`📊 Database: PostgreSQL (${process.env.DB_HOST})`);
});