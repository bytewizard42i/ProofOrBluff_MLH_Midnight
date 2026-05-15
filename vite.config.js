import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proof or Bluff dev server on port 3015 (per project convention).
// `demoLand/src/game` is imported directly from the existing JS modules.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3015,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 3015,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
