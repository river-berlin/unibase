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

See `.env.example` for all variables.

Special note for Stripe:

You will need to run the tests or docker-compose up once to get the webhook secret.

For the Stripe webhook secret:
1. First run `docker compose up` or the tests
2. Watch for the Stripe CLI output showing the webhook secret
3. Copy the `whsec_...` value to your `.env` file
4. Restart the services

### Development Environment

#### Prerequisites
- Docker and Docker Compose
- Node.js (for local development outside Docker)

#### Environment Setup

1. Create a `.env` file in the root directory with all the variables from `.env.example` (ensure the stripe secret is set as described above)

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

