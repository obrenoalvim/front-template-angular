// jest.config.mjs
/** @type {import('jest').Config} */
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/e2e/'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
