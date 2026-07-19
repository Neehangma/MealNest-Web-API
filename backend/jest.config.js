/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/scr/__tests__/global-setup.js",
  globalTeardown: "<rootDir>/scr/__tests__/global-teardown.js",
  setupFilesAfterEnv: ["<rootDir>/scr/__tests__/setup.ts"],
  testMatch: ["<rootDir>/scr/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "scr/controller/**/*.ts",
    "scr/routes/**/*.ts",
    "scr/services/**/*.{ts,js}",
    "scr/repositories/**/*.ts",
    "scr/middleware/**/*.ts",
    "scr/models/**/*.ts",
    "scr/utils/**/*.ts",
    "!scr/__tests__/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json", diagnostics: false }],
  },
};
