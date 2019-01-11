module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      }
    },
  },
  setupFiles: [
    "./tests/jestsetup.ts"
  ],
  coverageReporters: [
    "text",
    "json",
    "lcov",
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/generated/**/*.ts",
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'vue',
    'js',
    'jsx',
    'json',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!(@ckeditor|lodash\-es|bootstrap-vue)/)",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.(ts|tsx)',
    '<rootDir>/tests/integration/**/*.spec.(ts|tsx)',
  ],
  testURL: 'http://localhost/'
}
