import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to display startup information
    {
      name: 'startup-info',
      configureServer(server) {
        server.middlewares.use('/startup-info', (req, res, next) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            message: 'Tripvar Client is running',
            port: server.config.server.port,
            host: server.config.server.host,
            environment: process.env.NODE_ENV || 'development'
          }));
        });
      }
    }
  ],
  server: {
    host: true, // Needed for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
})
