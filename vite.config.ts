import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: './src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },  css: {
    postcss: path.resolve(__dirname, './postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
      '@/components': path.resolve(__dirname, './src/client/components'),
      '@/pages': path.resolve(__dirname, './src/client/pages'),
      '@/hooks': path.resolve(__dirname, './src/client/hooks'),
      '@/utils': path.resolve(__dirname, './src/client/utils'),
      '@/types': path.resolve(__dirname, './src/shared'),
      '@/services': path.resolve(__dirname, './src/client/services'),
      '@/store': path.resolve(__dirname, './src/client/store'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
