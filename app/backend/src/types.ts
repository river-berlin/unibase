import { Request } from 'express';
import { Kysely } from 'kysely';
import { Database } from './database/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface AppServices {
  db?: Kysely<Database>;
  gemini?: GoogleGenerativeAI;
} 