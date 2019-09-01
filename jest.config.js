module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/app/$1",
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["app/", "tests/"],
  resetMocks: true,
}
