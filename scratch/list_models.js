import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('API key not found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct listModels in the JS SDK's main export usually, 
    // but we can try to hit the fetch endpoint manually or see if it exists on the instance.
    // Actually, the SDK might not have it exposed directly in a simple way.
    // Let's try a fetch call instead.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
