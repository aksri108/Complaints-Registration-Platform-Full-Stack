// using built-in fetch
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Fetch failed:', error.message);
    process.exit(1);
  }
}

listModels();
