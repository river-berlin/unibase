import express, { Express } from 'express';
import authRoutes from './routes/auth/index';
import folderRoutes from './routes/folders/index';
import projectRoutes from './routes/projects/index';
import languageModelRoutes from './routes/language-models/index';
import billingRoutes from './routes/billing/index';
import pingRoutes from './routes/ping/index';
import { s3 } from './services/s3';
import { errorHandler } from './middleware/error';
import { setupCors } from './middleware/cors';

const app: Express = express();

setupCors(app);
app.use(express.json());

// Routes
app.use('/ping', pingRoutes);
app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/projects', projectRoutes);
app.use('/language-models', languageModelRoutes);
app.use('/billing', billingRoutes);

app.use(errorHandler);

export { app, s3 }; 