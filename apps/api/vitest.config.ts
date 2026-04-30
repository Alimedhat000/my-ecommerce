import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

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
                'src/config/',
                'dist/',
                'src/utils/logger.ts',
            ],
        },
    },
});
