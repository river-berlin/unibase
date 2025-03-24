import { Request } from 'express';
import { Kysely } from 'kysely';
import { Database } from './database/types';
import { Anthropic } from '@anthropic-ai/sdk';

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
  anthropic?: Anthropic;
} 