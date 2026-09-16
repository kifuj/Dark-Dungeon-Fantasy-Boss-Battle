/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Moteur (`shared/`) + composants React (`src/tests/`, rendus dans jsdom).
    include: ['shared/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    environment: 'jsdom',
  },
});
