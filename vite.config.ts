import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/officearcadegame/' : '/',
  define: { __TEST_MODE__: JSON.stringify(mode === 'test') },
  test: { include: ['src/**/*.test.ts'] },
  build: { minify: false, sourcemap: false },
}));
