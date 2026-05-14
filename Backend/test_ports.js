const postgres = require('postgres');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function test(port) {
  const connectionString = url.replace(':5432', `:${port}`);
  console.log(`Testing port ${port}...`);
  const sql = postgres(connectionString, { connect_timeout: 5 });
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log(`Port ${port} Success:`, result);
    return true;
  } catch (err) {
    console.log(`Port ${port} Failed:`, err.message);
    return false;
  }
}

async function run() {
  await test(5432);
  await test(6543);
  process.exit(0);
}

run();
