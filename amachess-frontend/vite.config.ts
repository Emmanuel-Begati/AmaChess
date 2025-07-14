import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
