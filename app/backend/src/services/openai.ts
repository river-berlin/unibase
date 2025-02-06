import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable must be set');
}

if (!process.env.OPENAI_BASE_URL) {
  throw new Error('OPENAI_BASE_URL environment variable must be set');
}

if (!process.env.OPENAI_MODEL) {
  throw new Error('OPENAI_MODEL environment variable must be set');
}

export const defaultOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});
