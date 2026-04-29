import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import app from './src/app';
import logger from './src/utils/logger';

dotenv.config({ path: '.env.test' });

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            reportsDirectory: './public/coverage',
            exclude: [
                'node_modules/',
                'src/tests/',
                'src/app.ts',
                '*.config.*',
                'prisma/',
                'dist/',
                'src/config/',
                '**/logger.ts',
            ],
        },
    },
});
