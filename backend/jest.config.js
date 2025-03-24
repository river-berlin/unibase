/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/dist/**/__tests__/**/*test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  verbose: true,
  injectGlobals: true,
  maxWorkers: '50%',
  maxConcurrency: 5,
  randomize: true,
  runner: 'jest-runner'
};