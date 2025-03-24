import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the outermost directory
// __dirname gives the directory of the current file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createApp } from './app';
import { db } from './database/db';
import anthropic from './services/anthropic';

// Log environment information
console.log(`[${new Date().toISOString()}] Starting server...`);
console.log(`[${new Date().toISOString()}] Node environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[${new Date().toISOString()}] Working directory: ${process.cwd()}`);
console.log(`[${new Date().toISOString()}] Source directory: ${__dirname}`);

const port: number = parseInt(process.env.PORT || '3002');
const app = createApp({ db, anthropic });

// Log all registered routes
console.log(`[${new Date().toISOString()}] Registered routes:`);
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`[${new Date().toISOString()}] ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
        console.log(`[${new Date().toISOString()}] ${methods} ${middleware.regexp.source.replace('\\/?(?=\\/|$)', '')}${path}`);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server is running on port ${port}`);
  console.log(`[${new Date().toISOString()}] API documentation available at http://localhost:${port}/api-docs`);
}); 