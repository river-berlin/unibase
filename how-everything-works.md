# Explanation of project structure

### Architecture Overview
Every feature in the application follows this flow:
1. Backend implementation (direct SQL database operations)
2. Backend JS API (SDK layer that provides typed access to backend features)
3. Frontend consumption (uses the Backend JS API to interact with the backend)

### Testing Requirements
Every feature must include appropriate tests:
- Backend: Unit tests for all functionality
- Backend JS API: 
  - Unit tests for individual components
  - Integration tests to verify end-to-end functionality
  - Tests are in `__tests__` directories

### Folder explanations

- `app/`: The entire project code
- `app/backend/`: Backend code, interfaces with SQL database
- `app/backend-js-api/`: TypeScript SDK layer
- `app/frontend/src/backend-js-api/`: Copy of the backend-js-api code (required for Metro bundler)
- `app/frontend/`: Frontend code using Expo/React Native

### Development Environment

#### Prerequisites
- Docker and Docker Compose
- Node.js (for local development outside Docker)

#### Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```env
# Required environment variables
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# S3/MinIO configuration (defaults provided)
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1

# Stripe Configuration (required for billing features)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_MONTHLY_PRICE_ID=your_stripe_price_id
```

2. Start all services:
```bash
docker compose up
```

The environment variables will be automatically loaded into the containers. Default values are provided for MinIO credentials if not specified.

#### Running with Docker Compose

```bash
# Start all services
docker compose up
```

#### Running Tests

```bash
# Run all tests
docker compose run backend npm run test

# Run specific tests
docker compose run backend npm test path/to/test.js

# Run tests in watch mode
docker compose run backend npm run test:watch
```

#### Setting Up Stripe for Testing

1. Add your Stripe test keys to `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_MONTHLY_PRICE_ID=price_your_test_price
```

2. Test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

#### Database Reset

```bash
docker compose down -v
docker compose up
```

### Troubleshooting

If tests fail:
- Check Docker Compose logs
- Verify environment variables
- Check database connection

If services won't start:
- Try `docker compose down -v`
- Rebuild: `docker compose build --no-cache`

