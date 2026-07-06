import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy/rarely-changing vendor code into its own cacheable
        // chunks so a deploy only busts the cache for what actually changed,
        // and the browser can fetch these chunks in parallel.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('tesseract.js')) return 'vendor-ocr';
            if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx', './src/pages/Login.tsx'],
    },
  },
})
