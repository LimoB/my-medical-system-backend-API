import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/?(*.)+(spec|test).[tj]s'], // 🔄 updated pattern
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
  resetMocks: true,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
