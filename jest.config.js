'use strict';

module.exports = {
    verbose: true,
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    globals: {
        NODE_ENV: 'test',
    },

    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.(css|scss|less)$': 'jest-css-modules',
    },
    // disable ignore node_modules
    // transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],

    // Only include files directly in __tests__, not in nested folders.
    testRegex: '/__tests__/[^/]*(\\.test.js|\\.coffee|[^d]\\.ts)$',
    moduleFileExtensions: ['js', 'json', 'node', 'coffee', 'ts'],
    rootDir: process.cwd(),
    roots: ['<rootDir>/src'],
    collectCoverageFrom: ['src/**/*.js', 'src/**/*.jsx'],
};
