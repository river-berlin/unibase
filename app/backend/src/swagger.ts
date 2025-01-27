import swaggerAutogen from 'swagger-autogen';

const doc = {
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
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/app.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc); 