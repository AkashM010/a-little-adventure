import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base: the same build works on GitHub Pages, Netlify, or any static host.
  // Safe because all routing is hash-based (#/...).
  base: './',
  plugins: [react(), tailwindcss()],
})
