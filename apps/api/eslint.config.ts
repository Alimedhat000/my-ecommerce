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
      '**/*.test.ts', // Ignore test files for unused warnings
      'vitest.config.ts', // Ignore vitest config - not part of main codebase
      'src/tests/**', // Ignore all test files
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
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'off', // Disable to avoid type-checking issues
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Disable - will fix during refactor

      // General
      eqeqeq: ['error', 'always'],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // Prettier
      'prettier/prettier': [
        'error',
        {
          "semi": true,
          "singleQuote": true,
          "tabWidth": 2,
          "trailingComma": "es5",
          "printWidth": 100,
          "endOfLine": "lf"
        }
        ,
      ],
    },
  },
];
