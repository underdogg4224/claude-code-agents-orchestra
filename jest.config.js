module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/protocols'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'protocols/**/*.ts',
    '!protocols/**/*.test.ts',
    '!protocols/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  moduleNameMapper: {
    '^@protocols/(.*)$': '<rootDir>/protocols/$1',
    '^@agents/(.*)$': '<rootDir>/agents/$1'
  },
  testTimeout: 10000
};
