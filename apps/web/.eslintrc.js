module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
  overrides: [
    {
      files: ['*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
  ],
};
