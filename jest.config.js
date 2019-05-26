const { resolve } = require('path')

// https://jestjs.io/docs/en/configuration.html
module.exports = {
  rootDir: 'src',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  reporters: [
    'default',
    process.env.CI && [
      'jest-junit',
      {
        output: resolve(__dirname, 'test-results/jest/results.xml'),
        addFileAttribute: true,
        includeConsoleOutput: true,
      },
    ],
  ].filter(Boolean),
}
