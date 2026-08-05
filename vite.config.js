import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          core: ['./src/core/orchestrator.js', './src/core/superpowers.state.js'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/consult': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
