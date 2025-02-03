import swaggerAutogen from 'swagger-autogen';

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'Unibase API',
    description: 'API documentation for Unibase',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health Check',
      description: 'API health check and authentication test endpoints',
    },
    {
      name: 'Admin Users',
      description: 'User management endpoints for administrators',
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Projects',
      description: 'Project management endpoints',
    },
    {
      name: 'Folders',
      description: 'Folder management endpoints',
    },
  ],
  definitions: {
    AuthenticatedRequest: {
      type: 'object',
      properties: {
        headers: {
          type: 'object',
          properties: {
            Authorization: {
              type: 'string',
              description: 'Bearer token',
              example: 'Bearer <token>'
            }
          }
        }
      }
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  './src/app.ts'
];

const options = {
  autoHeaders: true,
  autoQuery: true,
  autoBody: true,
  openapi: '3.0.0',
  language: 'en-US',
  disableLogs: false,
  autoResponse: true,
  operationIds: true
};

swaggerAutogen(options)(outputFile, endpointsFiles, doc); 