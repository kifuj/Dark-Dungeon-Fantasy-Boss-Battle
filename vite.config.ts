/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Les clés Supabase peuvent être nommées VITE_… ou NEXT_PUBLIC_… (voir .env.example).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  test: {
    // Moteur (`shared/`) + composants React (`src/tests/`, rendus dans jsdom).
    include: ['shared/tests/**/*.test.ts', 'src/tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
  },
});
