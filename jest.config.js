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
  collectCoverageFrom: [
    "src/**/*",
    "!src/generated/**",
    "!src/shim*",
    "!src/api.ts",
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue',
    'ts',
    'tsx'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/*.spec.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/'
}
