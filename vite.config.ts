import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Define environment variables
    define: {
      // Make environment variables available globally
      'process.env': env
    },

    // Basic build configuration
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 800,

      // Enable source maps for production
      sourcemap: true
    },

    // Basic server configuration
    server: {
      // Enable compression
      compress: true
    },

    // Resolve paths
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  };
});
