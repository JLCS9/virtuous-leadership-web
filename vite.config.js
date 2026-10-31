import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En local, /api/* va al servidor de api/ (node api/server.mjs, puerto 3001).
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
})
