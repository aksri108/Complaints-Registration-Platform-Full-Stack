const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log('Success:', response.text());
    process.exit(0);
  } catch (error) {
    console.error('Gemini Test Failed:', error.message);
    process.exit(1);
  }
}

test();
