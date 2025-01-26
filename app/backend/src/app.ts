import express, { Express } from 'express';
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

export function createApp(db: Kysely<Database> = defaultDb): Express {
  const app = express();

  setupCors(app);
  app.use(express.json());

  // Set database instance in app locals for route handlers to access
  app.locals.db = db;

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