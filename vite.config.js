import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// The HTML entry point lives in src/, while PWA static assets live in public/.
export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: './',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0'
  }
});
