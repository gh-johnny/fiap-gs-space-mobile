/** @type {import('jest-expo').JestPreset} */
module.exports = {
  preset: 'jest-expo',
  collectCoverage: false,
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 90,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/application/container/',
    'src/application/config/',
    'src/infrastructure/adapters/.*-external-types\\.ts',
    'src/infrastructure/gateways/.*-external\\.ts',
    'src/infrastructure/persistence/.*-external-types\\.ts',
    'src/domain/repositories/i-.*\\.ts',
    'src/domain/gateways/i-.*\\.ts',
    'src/infrastructure/adapters/i-.*\\.ts',
    '/index\\.ts$',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|satellite\\.js)',
  ],
  moduleNameMapper: {
    '^satellite\\.js$': '<rootDir>/node_modules/satellite.js/dist/index.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
