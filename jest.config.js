module.exports = {
    verbose: false,

    collectCoverage: true,

    moduleDirectories: [
        "node_modules",
        "<rootDir>/src"
    ],

    collectCoverageFrom: [
        "src/**/*.js"
    ],

    coverageDirectory: "<rootDir>/coverage",

    transformIgnorePatterns: [
        "/node_modules/"
    ],

    setupTestFrameworkScriptFile: "<rootDir>/jest.setup.js",

    snapshotSerializers: ["enzyme-to-json/serializer"],

    coverageReporters: ["html", "lcov"]
};
