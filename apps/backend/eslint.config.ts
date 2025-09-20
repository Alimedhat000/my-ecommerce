// eslint.config.ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
    {
        ignores: ['eslint.config.*', 'dist/**'], // <--- top-level ignore (applies to the whole run)
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked, // strict TypeScript rules with type info
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
            '@typescript-eslint/no-floating-promises': 'error',
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
