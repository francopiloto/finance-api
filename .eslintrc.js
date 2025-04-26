module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'warn',

    // https://www.npmjs.com/package/eslint-plugin-import
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        named: true,
        groups: [
          ['builtin'],
          ['external', 'internal'],
          ['parent', 'sibling', 'index'],
          ['object', 'type'],
        ],
        'newlines-between': 'always',
        pathGroups: [
          { group: 'builtin', pattern: '@nestjs*', position: 'before' },
          { group: 'external', pattern: '?!src*/**', position: 'before' },
          { group: 'external', pattern: '?!@{modules,decorators}*/**', position: 'before' },
          { group: 'external', pattern: 'src*/**', position: 'after' },
          { group: 'external', pattern: '@{modules,decorators}*/**', position: 'after' },
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};
