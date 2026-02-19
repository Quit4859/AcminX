import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensuring process.env is available for Gemini and E2B SDKs
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});