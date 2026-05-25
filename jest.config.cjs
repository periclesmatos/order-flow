/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/test/unit'],
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@test/(.*)\\.js$': '<rootDir>/test/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@src/(.*)\\.js$': '<rootDir>/src/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.json\\.js$': '$1.json.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        useESM: false,
      },
    ],
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
};
