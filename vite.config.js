import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Lmis',
        short_name: 'Lmis',
        description: 'Ethiopian Labor Market Information System',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/images/lmis-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/lmis-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
