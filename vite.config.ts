import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets so it works on GitHub Pages subpaths directly!
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
