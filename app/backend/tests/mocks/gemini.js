import { jest } from '@jest/globals';

// Mock Gemini API
export const mockGeminiResponse = {
  text: () => Promise.resolve('Mocked response'),
};

export const mockGeminiModel = {
  generateContent: jest.fn().mockResolvedValue({
    response: mockGeminiResponse
  })
};

export const mockGeminiAI = {
  getGenerativeModel: jest.fn().mockReturnValue(mockGeminiModel)
};

// Mock the entire module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => mockGeminiAI)
})); 