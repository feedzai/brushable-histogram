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

    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

    snapshotSerializers: ["enzyme-to-json/serializer"],

    coverageReporters: ["html", "lcov", "clover"]
};
