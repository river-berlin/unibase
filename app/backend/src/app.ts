import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth/index';
import folderRoutes from './routes/folders/index';
import projectRoutes from './routes/projects/index';
//import languageModelRoutes from './routes/language-models/index';
//import billingRoutes from './routes/billing/index';
import pingRoutes from './routes/ping/index';
import adminRoutes from './routes/admin';
import { s3 } from './services/s3';
import { errorHandler } from './middleware/error';
import { setupCors } from './middleware/cors';
import { Kysely } from 'kysely';
import { Database } from './database/types';
import { db as defaultDb } from './database/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defaultGemini } from './services/gemini';

interface AppServices {
  db?: Kysely<Database>;
  gemini?: GoogleGenerativeAI;
}

export function createApp({ 
  db = defaultDb,
  gemini = defaultGemini 
}: AppServices = {}): Express {
  const app = express();

  setupCors(app);
  app.use(express.json());

  // Set instances in app locals for route handlers to access
  app.locals.db = db;
  app.locals.gemini = gemini;

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const swaggerFile = require('./swagger-output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  }

  // Routes
  app.use('/ping', pingRoutes);
  app.use('/auth', authRoutes);
  app.use('/folders', folderRoutes);
  app.use('/projects', projectRoutes);
  app.use('/admin', adminRoutes);
  //app.use('/language-models', languageModelRoutes);
  //app.use('/billing', billingRoutes);

  app.use(errorHandler);

  return app;
}

export { s3 }; 