module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageReporters: ['html'],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./src/__tests__/server/setupEnv.ts'],
};
