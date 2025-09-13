import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ 
    babel: {
      parserOpts: {
        plugins: ['decorators-legacy']
      }
    }
  })],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020',
    ignoreAnnotations: true
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      },
      onwarn(warning, warn) {
        // Suppress TypeScript warnings during build
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
    target: 'es2020',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  base: '/'
})