import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all addresses including LAN and public
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  envPrefix: 'REACT_APP_'
})