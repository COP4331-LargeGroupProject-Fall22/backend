/** @type {import('ts-jest').JestConfigWithTsJest} */

const tsPreset = require('ts-jest/jest-preset');

module.exports = {
  ...tsPreset,
  testEnvironment: 'node',
  "globalSetup": "<rootDir>/server/test/database/globalSetup.ts",
  "globalTeardown": "<rootDir>/server/test/database/globalTeardown.ts"
};
