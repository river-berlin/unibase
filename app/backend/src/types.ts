import { Request } from 'express';
import { Kysely } from 'kysely';
import { Database } from './database/types';
import { OpenAI } from 'openai';

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
  openai?: OpenAI;
} 