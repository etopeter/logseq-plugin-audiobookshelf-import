// This file was created with:
// yarn ts-jest config:init

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  automock: false,
  testEnvironment: "node",
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  setupFiles: ["<rootDir>/tests/setupJestMock.js"],
  moduleDirectories: ["node_modules"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  globals: {},
};
