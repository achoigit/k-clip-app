// jest.config.js
module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!simple-keyboard-layouts)"
  ],
  moduleNameMapper: {
    "^simple-keyboard-layouts/build/layouts/korean(\\.js)?$": "<rootDir>/__mocks__/korean.js"
  }
};