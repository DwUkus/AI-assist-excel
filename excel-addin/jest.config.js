module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
        useESM: true,
    },
  },
};
