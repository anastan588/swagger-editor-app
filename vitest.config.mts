import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
    coverage: {
      include: ['app/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'app/**/*.test.{js,jsx,ts,tsx}',
        'app/**/*.spec.{js,jsx,ts,tsx}',
        'app/setupTests.{js,ts}',
        'app/**/*.d.ts',
        'app/types/types.{js,ts}',
      ],
      thresholds: {
        statements: 80,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
