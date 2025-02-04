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
  - tests for individual components
  - Integration tests to verify end-to-end functionality
  - There is a mix of unit and integration tests, it's not perfect but it's practical
  - Tests are in `__tests__` directories

### Test Directory Structure
The backend follows a consistent test structure where each route has its own test directory:
```
app/backend/src/routes/
├── billing/
│   ├── __tests__/
│   │   ├── index.test.js      # Unit tests
│   │   └── integration.test.js # Integration tests
│   └── index.js
├── folders/
│   ├── __tests__/
│   │   └── index.test.js
│   └── index.js
├── projects/
│   ├── __tests__/
│   │   ├── index.test.js
│   │   └── integration.test.js
│   └── index.js
├── users/
│   ├── __tests__/
│   │   ├── index.test.js
│   │   └── integration.test.js
│   └── index.js
└── ... (other routes follow same pattern)
```

This structure ensures:
- Each route has its own test suite
- Tests are colocated with the code they test
- Unit tests are in `index.test.js`
- Integration tests are in `integration.test.js`
- Tests are easy to find through consistent naming
- Additional test files can be added alongside if needed

Global test files and mocks are in the `tests` directory:
```
app/backend/tests/
├── setup.js    # Global test setup
└── mocks/      # Shared test mocks
```

### Folder explanations

- `app/`: The entire project code
- `app/backend/`: Backend code, interfaces with SQL database
- `app/backend-js-api/`: TypeScript SDK layer
- `app/frontend/src/backend-js-api/`: Copy of the backend-js-api code (required for Metro bundler)
- `app/frontend/`: Frontend code using Expo/React Native

### Environment Variables Setup

Required environment variables in `.env`:

```env
# API Keys
GEMINI_API_KEY=            # Required: Get from Google AI Studio
STRIPE_SECRET_KEY=         # Required: Get from Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=    # Required: Get from Stripe Dashboard
STRIPE_MONTHLY_PRICE_ID=   # Required: Create a price in Stripe Dashboard
STRIPE_PRODUCT_ID=         # Required: Product ID from Stripe Dashboard

# Stripe Webhook (Important!)
STRIPE_WEBHOOK_SECRET=     # Required: Get this by running docker-compose up
                          # The Stripe CLI will print the webhook signing secret
                          # Look for a line like: "Ready! Your webhook signing secret is whsec_..."

# Authentication
JWT_SECRET=               # Required: Any secure random string
NODE_ENV=development     # Optional: defaults to development

# S3/MinIO Configuration (optional, defaults provided)
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1

# Frontend Configuration
FRONTEND_URL=http://localhost:8081  # Required for Stripe redirect URLs
```

#### Getting the Stripe Webhook Secret

1. First time setup:
   ```bash
   docker compose up
   ```
2. Watch the console output for the Stripe CLI container
3. Look for a message like:
   ```
   Ready! Your webhook signing secret is whsec_...
   ```
4. Copy this webhook secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`
5. Restart the containers:
   ```bash
   docker compose down
   docker compose up
   ```

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

