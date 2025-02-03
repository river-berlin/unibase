import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/users/index';
import folderRoutes from './routes/folders/index';
import projectRoutes from './routes/projects/index';
import languageModelRoutes from './routes/language-models/index';
import billingRoutes from './routes/billing/index';
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
import webhookRouter from './routes/billing/webhook';

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


  // Set instances in app locals for route handlers to access
  app.locals.db = db;
  app.locals.gemini = gemini;


  // webhook router must be put seperately due to 
  // https://stackoverflow.com/questions/70159949/webhook-signature-verification-failed-with-express-stripe
  // stripe signature verification not working otherwise
  app.use('/billing', webhookRouter);

  app.use(express.json());

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const swaggerFile = require('./swagger-output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  }

  // Routes
  app.use('/ping', pingRoutes);
  app.use('/users', userRoutes);
  app.use('/folders', folderRoutes);
  app.use('/projects', projectRoutes);
  app.use('/admin', adminRoutes);
  app.use('/language-models', languageModelRoutes);
  app.use('/billing', billingRoutes);

  app.use(errorHandler);

  return app;
}

export { s3 }; 