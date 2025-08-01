import eslintPlugin from 'ultracite/eslint';

export default [
  eslintPlugin.configs.next(), 

  {
    rules: {
      // Disable these globally
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
];
