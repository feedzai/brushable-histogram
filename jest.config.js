module.exports = {
    verbose: false,
    collectCoverage: true,
    moduleDirectories: [
        "node_modules",
        "<rootDir>/src"
    ],
    roots: [
        "<rootDir>/src"
    ],
    collectCoverageFrom: [
        "src/**/*.js"
    ],
    coverageDirectory: "<rootDir>/coverage",
    transformIgnorePatterns: [
        "/node_modules/"
    ],
    moduleNameMapper: {
        "\\.(scss)$": "<rootDir>/src/__mocks__/styleMock.js"
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    coverageReporters: ["html", "lcov", "clover"]
};
