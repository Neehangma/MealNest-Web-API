import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.tsx"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/coverage/", "<rootDir>/playwright-report/", "<rootDir>/test-results/", "<rootDir>/e2e/"],
  collectCoverageFrom: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "!app/**/layout.tsx", "!**/*.d.ts"],
  coverageDirectory: "coverage",
};

export default createJestConfig(config);
