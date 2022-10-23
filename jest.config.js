/** @type {import('ts-jest').JestConfigWithTsJest} */

const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: '@shelf/jest-mongodb',
  transform: tsjPreset.transform,
  setupFiles: [
    "<rootDir>/server/tests/mongoMemoryServer/databaseSetup.ts"
  ],
  testPathIgnorePatterns: [".js"]
};

// const tsPreset = require('ts-jest/jest-preset');
// const jestMongodbPreset = require('@shelf/jest-mongodb/jest-preset');

// module.exports = {
//   ...tsPreset,
//   ...jestMongodbPreset,
//   testEnvironment: 'node',
//   // setupFiles: [
//   //   "<rootDir>/server/test/database/globalSetup.ts"
//   // ],
//   // "globalTeardown": "<rootDir>/server/test/database/globalTeardown.ts"
// };
