import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

export default defineConfig({
  // Single source of truth for the product version: package.json "version".
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Relative base: the same build works on GitHub Pages, Netlify, or any static host.
  // Safe because all routing is hash-based (#/...).
  base: './',
  plugins: [react(), tailwindcss()],
})
