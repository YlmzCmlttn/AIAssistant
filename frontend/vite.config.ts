import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ensure Vite listens on all interfaces
    port: 5173,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
