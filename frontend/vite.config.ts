import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React + router runtime — tiny, cached forever
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // TanStack Query
          'vendor-query': ['@tanstack/react-query'],
          // Radix UI primitives
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-visually-hidden',
          ],
          // Motion (framer-motion-sized dep)
          'vendor-motion': ['motion'],
          // Form validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utility / misc
          'vendor-misc': ['ky', 'sonner', 'date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
