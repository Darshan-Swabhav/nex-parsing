module.exports = {
  env: {
    commonjs: true,
    node: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, parser: 'flow', trailingComma: 'all' },
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'implicit-arrow-linebreak': ['off'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
  },
};
