const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    // The SDK doesn't have a direct listModels method on genAI, 
    // it's usually done via the fetch API or a different client.
    // However, we can try 'gemini-pro' as a classic fallback.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent("Hello");
    console.log('gemini-pro works');
    process.exit(0);
  } catch (error) {
    console.error('gemini-pro failed:', error.message);
    process.exit(1);
  }
}

list();
