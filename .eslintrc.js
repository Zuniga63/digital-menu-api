const RULES = {
  OFF: 'off',
  ERROR: 'error',
  WARN: 'warn',
};

module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  rules: {
    'prettier/prettier': RULES.ERROR,
    'no-underscore-dangle': RULES.OFF,
    'no-unused-vars': [RULES.ERROR, { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    'import/extensions': [
      RULES.ERROR,
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
  },
  /* https://stackoverflow.com/questions/59265981/typescript-eslint-missing-file-extension-ts-import-extensions */
  settings: {
    'import/extensions': ['.js', '.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
