// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This enables listening on all network interfaces
    port: 5173,
    // Optional: Enable HTTPS for secure testing
    // https: true,
  }
})