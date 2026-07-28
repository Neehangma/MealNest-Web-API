import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
    "<rootDir>/tests/integration/**/*.integration.test.ts",
    "<rootDir>/tests/integration/**/*.integration.test.tsx",
  ],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/playwright-report/",
    "<rootDir>/test-results/",
    "<rootDir>/test/",
    "<rootDir>/cypress/",
  ],
  collectCoverageFrom: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "!app/**/layout.tsx", "!**/*.d.ts"],
  coverageDirectory: "coverage",
};

export default createJestConfig(config);
