import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable must be set');
}

export const defaultGemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 