import { jest, beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { setupTestDatabase } from './tests/setup.js';

// Make Jest functions available globally
Object.assign(globalThis, {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  jest
});

// Run database setup before all tests
beforeAll(async () => {
  await setupTestDatabase();
}); 