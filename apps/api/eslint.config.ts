// eslint.config.ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      'eslint.config.*',
      'dist/**',
      'prisma/**', // Ignore prisma directory (JS files, data, etc.)
      'node_modules/**',
      '**/*.js', // Ignore JS files - this is a TypeScript project
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended, // Use recommended (not TypeChecked) to avoid type issues
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      // TS-specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'off', // Disable to avoid type-checking issues
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',

      // General
      eqeqeq: ['error', 'always'],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // Prettier
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          tabWidth: 4,
          printWidth: 100,
        },
      ],
    },
  },
];
