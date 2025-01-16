import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'),
    host: true,
    proxy: {
      '/api/v1': {
        target: 'http://ai-service:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
