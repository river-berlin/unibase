import Anthropic from '@anthropic-ai/sdk';

if (!process.env.CLAUDE_API_KEY) {
  throw new Error('CLAUDE_API_KEY environment variable must be set');
}

if (!process.env.CLAUDE_BASE_URL) {
  throw new Error('CLAUDE_BASE_URL environment variable must be set');
}

if (!process.env.CLAUDE_MODEL) {
  throw new Error('CLAUDE_MODEL environment variable must be set');
}

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default anthropic;