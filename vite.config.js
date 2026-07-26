import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/porfolio/',
  resolve: {
    // Alias que espera shadcn/cult-ui; el mapeo para el editor está en jsconfig.json
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
