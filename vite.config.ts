import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Pinned so the dev origin always matches the backend CORS_ALLOWED_ORIGINS
  // entry. strictPort makes a taken port fail loudly instead of drifting to 5174.
  server: {
    port: 5173,
    strictPort: true,
  },
})
