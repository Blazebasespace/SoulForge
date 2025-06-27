import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://chatapi.akash.network',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/pinata-api': {
        target: 'https://api.pinata.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/pinata-api/, '')
      }
    }
  }
});