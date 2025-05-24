import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Enable React Fast Refresh in development
        fastRefresh: !isProduction,
        // Optimize JSX in production
        jsxRuntime: 'automatic'
      })
    ],

    // Define environment variables (only expose VITE_ prefixed vars for security)
    define: {
      // Only expose necessary environment variables
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'process.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(env.VITE_FIREBASE_DATABASE_URL),
      'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'process.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL)
    },

    // Enhanced build configuration for performance
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,

      // Enable source maps only in development
      sourcemap: !isProduction,

      // Optimize for production
      minify: isProduction ? 'terser' : false,

      // Terser options for better compression
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : undefined,

      // Advanced code splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/database', 'firebase/auth'],
            'vendor-ui': ['lucide-react'],

            // Admin chunks (lazy loaded)
            'admin-core': [
              'src/pages/AdminPage.tsx',
              'src/components/AdminLogin.tsx'
            ],
            'admin-managers': [
              'src/components/admin/SEOManager.tsx',
              'src/components/admin/AnalyticsDashboard.tsx',
              'src/components/admin/EmailMarketing.tsx'
            ],

            // Game chunks (lazy loaded)
            'games': [
              'src/components/GameWindow.tsx'
            ]
          },

          // Optimize chunk file names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/js/[name]-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },

      // Target modern browsers for better optimization
      target: 'es2020',

      // Enable CSS code splitting
      cssCodeSplit: true,

      // Optimize CSS
      cssMinify: isProduction
    },

    // Enhanced server configuration
    server: {
      // Enable compression
      compress: true,

      // Enable HTTP/2
      http2: false, // Set to true if you have HTTPS certificates

      // Optimize for development
      hmr: {
        overlay: true
      }
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/database',
        'firebase/auth',
        'lucide-react'
      ],
      exclude: [
        // Exclude large admin components from pre-bundling
        'src/components/admin',
        'src/pages/AdminPage'
      ]
    },

    // Resolve paths
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },

    // Enable experimental features for better performance
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` };
        } else {
          return { relative: true };
        }
      }
    }
  };
});
