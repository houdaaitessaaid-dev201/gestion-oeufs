import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs pour compatibilité totale avec GitHub Pages (sous-dossiers https://user.github.io/repo/)
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true, // Accès mobile sur le même réseau WiFi
  }
});
