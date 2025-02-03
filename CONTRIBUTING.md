# Contributing to VocalCAD

Thank you for your interest in contributing to VocalCAD! This document will guide you through our codebase structure and contribution process.

## Project Structure

The project is organized into several main components:

```
/
├── app/
│   ├── frontend/              # Next.js frontend application
│   │   ├── app/              # App router pages and components
│   │   ├── components/       # Reusable React components
│   │   └── services/         # Frontend services
│   │
│   ├── backend/              # Express.js backend server
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── database/    # Database models and migrations
│   │   │   └── middleware/  # Express middleware
│   │   └── Dockerfile       # Backend container config
│   │
│   └── backend-js-api/       # TypeScript API client library
│       ├── src/
│       │   ├── types/       # Shared type definitions
│       │   ├── services/    # API service implementations
│       │   └── utils/       # Utility classes
│       └── README.md        # Library documentation
│
├── docs/                     # Project documentation
│   └── database_schema.md   # Database schema documentation
│
└── docker-compose.yml       # Development environment setup
```

## Key Components

### 1. Frontend (`app/frontend/`)
- Next.js application with App Router
- TypeScript for type safety
- Material UI for components
- State management with React hooks
- API integration via backend-js-api library

### 2. Backend (`app/backend/`)
- Express.js server
- PostgreSQL database with Kysely
- JWT authentication
- RESTful API endpoints
- Organization-based access control

### 3. API Client Library (`app/backend-js-api/`)
- TypeScript library for API communication
- Type definitions shared with backend
- Fetch-based HTTP client
- Comprehensive test coverage

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - PostgreSQL (if running locally)

2. **Environment Setup**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd <repository-name>

   # Start development environment
   docker-compose up -d

   # Install dependencies for all packages
   cd app/frontend && npm install
   cd ../backend && npm install
   cd ../backend-js-api && npm install
   ```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing formatting (Prettier)
- Use ESLint for code quality
- Write meaningful commit messages
- Document public APIs and components

### Making Changes

1. **Frontend Changes**
   - Follow Next.js App Router patterns
   - Use TypeScript for type safety
   - Create reusable components
   - Add proper error handling
   - Test user interactions

2. **Backend Changes**
   - Follow RESTful API design
   - Add proper validation
   - Update database migrations
   - Document API changes
   - Add tests for new endpoints

3. **API Client Changes**
   - Update type definitions
   - Maintain backward compatibility
   - Add tests for new features
   - Update documentation

### Testing

1. **Frontend Testing**
   - Component tests with React Testing Library
   - Integration tests for pages
   - Mock API calls appropriately

2. **Backend Testing**
   - Unit tests for utilities
   - Integration tests for endpoints
   - Database migration tests

3. **API Client Testing**
   - Unit tests for services
   - Mock fetch responses
   - Test error scenarios

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following guidelines
3. Add/update tests
4. Update documentation
5. Run all tests:
   ```bash
   # Backend
   docker compose run backend npm run test

   # API Client
   docker compose run backend-js-api npm run test
   ```
6. Submit PR with clear description

## Best Practices

### Frontend
- Use TypeScript strictly
- Follow React hooks patterns
- Implement proper error boundaries
- Optimize performance
- Follow accessibility guidelines

### Backend
- Validate all inputs
- Use proper error handling
- Follow security best practices
- Document API changes
- Write clear SQL queries

### API Client
- Maintain type safety
- Handle errors gracefully
- Keep backward compatibility
- Follow semver for versions

## Documentation

- Update README files for major changes
- Document API changes in OpenAPI/Swagger
- Update database schema documentation
- Add JSDoc comments for public APIs

## Questions or Problems?

- Open an issue for bugs
- Start a discussion for features
- Check existing issues first
- Join our community discussions

## License

By contributing, you agree that your contributions will be licensed under the project's license. 