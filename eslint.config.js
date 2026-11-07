export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'error',
      'max-params': ['warn', 3],
      'max-depth': ['warn', 3],
      'max-lines-per-function': ['warn', 30]
    }
  },
  {
    ignores: ['node_modules/**', 'coverage/**']
  }
];
