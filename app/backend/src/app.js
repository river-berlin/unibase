import express from 'express';
import cors from 'cors';
import { S3Client } from '@aws-sdk/client-s3';
import authRoutes from './routes/auth/index.js';
import folderRoutes from './routes/folders/index.js';
import projectRoutes from './routes/projects/index.js';
import languageModelRoutes from './routes/language-models/index.js';
import billingRoutes from './routes/billing/index.js';

const app = express();

// Add logging middleware before other middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
});

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Ping test endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Create S3 client
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  region: process.env.AWS_REGION || 'us-east-1',
});

// Routes
app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/projects', projectRoutes);
app.use('/language-models', languageModelRoutes);
app.use('/billing', billingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export { app, s3 }; 