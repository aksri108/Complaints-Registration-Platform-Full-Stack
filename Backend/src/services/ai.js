const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn("GEMINI_API_KEY is missing. AI follow-up features will fail.");
}

const generateFollowUpQuestion = async (complaintText) => {
    if (!genAI) {
        throw new Error('Gemini API is not configured.');
    }
  try {
    const specificModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `You are a helpful assistant for a complaint registration system. 
A user has submitted the following complaint:
"${complaintText}"

Generate EXACTLY ONE short, specific follow-up question to gather more relevant information about this complaint. Do not include any other text, greetings, or formatting. Just the question.`;

    const result = await specificModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    return text;
  } catch (error) {
    console.error('Error generating AI question:', error);
    throw new Error(`Failed to generate follow-up question: ${error.message}`);
  }
};

module.exports = {
  generateFollowUpQuestion,
};
