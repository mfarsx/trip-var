import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
    historyApiFallback: true,
    proxy: {
      [process.env.VITE_API_PATH]: {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(new RegExp(`^${process.env.VITE_API_PATH}`), ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
