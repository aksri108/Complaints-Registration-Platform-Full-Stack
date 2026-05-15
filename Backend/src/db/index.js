const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables');
}

const client = postgres(connectionString, {
  ssl: connectionString.includes('supabase') ? 'require' : false,
});
const db = drizzle(client);

module.exports = db;
