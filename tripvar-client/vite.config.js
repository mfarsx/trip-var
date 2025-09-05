import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect Docker environment
const isDocker = process.env.DOCKER === 'true' || process.env.VITE_DOCKER === 'true' || process.env.NODE_ENV === 'docker'

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
            environment: process.env.NODE_ENV || 'development',
            docker: isDocker,
            proxyTarget: isDocker ? 'http://server:8000' : 'http://localhost:8000',
            envVars: {
              DOCKER: process.env.DOCKER,
              VITE_DOCKER: process.env.VITE_DOCKER,
              NODE_ENV: process.env.NODE_ENV
            }
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
    },
    proxy: {
      '/api': {
        target: isDocker ? 'http://server:8000' : 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        proxyTimeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 Proxy error:', err.message);
            console.log('   Target:', isDocker ? 'http://server:8000' : 'http://localhost:8000');
            console.log('   Docker detected:', isDocker);
            console.log('   Environment variables:', {
              DOCKER: process.env.DOCKER,
              VITE_DOCKER: process.env.VITE_DOCKER,
              NODE_ENV: process.env.NODE_ENV
            });
            console.log('   Error code:', err.code);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Sending Request to the Target:', req.method, req.url);
            console.log('   Target URL:', isDocker ? 'http://server:8000' : 'http://localhost:8000');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
