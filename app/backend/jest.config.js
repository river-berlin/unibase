export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/__tests__/**/*.test.js'
  ],
  verbose: true,
  injectGlobals: true
}; 