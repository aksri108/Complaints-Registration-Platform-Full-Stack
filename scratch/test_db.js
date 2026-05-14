const postgres = require('postgres');
require('dotenv').config({ path: './Backend/.env' });

async function testConnection() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables found:', result);
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
