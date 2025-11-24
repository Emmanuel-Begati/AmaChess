import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3060',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chess: ['chess.js', 'react-chessboard'],
          pdf: ['pdfjs-dist', 'react-pdf']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf', 'pdfjs-dist/build/pdf.worker']
  },
  worker: {
    format: 'es'
  },
  define: {
    global: 'globalThis'
  },
  assetsInclude: ['**/*.worker.js', '**/*.worker.mjs']
})
