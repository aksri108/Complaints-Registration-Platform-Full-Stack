const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Connecting to:', connectionString.split('@')[1]); // Log only the host part for safety

const sql = postgres(connectionString, {
  connect_timeout: 5
});

async function test() {
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log('Success:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
