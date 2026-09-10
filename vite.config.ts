import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages veröffentlicht Projektseiten unter /<Repository>/.
// Der feste Basispfad stellt sicher, dass Assets, Manifest und Service Worker
// auch unter https://mac-mac-sg.github.io/Stammbaum/ korrekt aufgelöst werden.
const BASE = '/Stammbaum/'

export default defineConfig({
  base: BASE,
  plugins: [react()],
})
