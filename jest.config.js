/** @type {import('ts-jest').JestConfigWithTsJest} */

const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: '@shelf/jest-mongodb',
  transform: tsjPreset.transform,
  setupFiles: [
    "<rootDir>/server/test/mongoMemoryServer/databaseSetup.ts"
  ]
};
