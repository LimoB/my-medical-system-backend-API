import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // support flexible test file naming
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // ✅ fix .js import resolution for TS files
    '^@/(.*)$': '<rootDir>/src/$1', // ✅ optional: support `@/` aliases if using in tsconfig
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // ✅ add setup for mocks, if needed
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  resetMocks: true,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
