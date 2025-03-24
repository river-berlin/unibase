import express, { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/users/index';
import folderRoutes from './routes/folders/index';
import projectRoutes from './routes/projects/index';
import chatRoutes from './routes/chat/index';
import billingRoutes from './routes/billing/index';
import pingRoutes from './routes/ping/index';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/error';
import { setupCors } from './middleware/cors';
import { db as defaultDb,  DB} from './database/db';
import webhookRouter from './routes/billing/webhook';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken } from './middleware/auth';

interface AppServices {
  db?: DB;
  anthropic?: Anthropic;
}

export function createApp({ 
  db = defaultDb,
  anthropic
}: AppServices = {}): Express {
  const app = express();

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request started`);
    
    // Log request body if it exists
    if (req.body && Object.keys(req.body).length > 0) {
      // Don't log sensitive information like passwords
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      console.log(`Request body:`, sanitizedBody);
    }
    
    // Capture response finish event
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  });

  setupCors(app);

  // Set instances in app locals for route handlers to access
  app.locals.db = db;
  app.locals.anthropic = anthropic;


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
  
  // Protected routes that require authentication
  // Using middleware-level Swagger comments for property inheritance
  app.use('/folders', 
    /* 
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.responses[401] = {
      description: 'Unauthorized - No token provided or invalid token',
      schema: { $ref: '#/components/schemas/Error' }
    }
    #swagger.responses[500] = {
      description: 'Server error - JWT_SECRET not configured',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    authenticateToken, 
    folderRoutes
  );
  
  app.use('/projects', 
    /* 
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.responses[401] = {
      description: 'Unauthorized - No token provided or invalid token',
      schema: { $ref: '#/components/schemas/Error' }
    }
    #swagger.responses[500] = {
      description: 'Server error - JWT_SECRET not configured',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    authenticateToken, 
    projectRoutes
  );
  
  app.use('/admin', 
    /* 
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.responses[401] = {
      description: 'Unauthorized - No token provided or invalid token',
      schema: { $ref: '#/components/schemas/Error' }
    }
    #swagger.responses[500] = {
      description: 'Server error - JWT_SECRET not configured',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    authenticateToken, 
    adminRoutes
  );
  
  app.use('/chat', chatRoutes);
  app.use('/billing', billingRoutes);

  app.use(errorHandler);

  return app;
}