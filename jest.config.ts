import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm', // 👈 use ESM preset
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      useESM: true, // 👈 critical flag
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
  resetMocks: true,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
