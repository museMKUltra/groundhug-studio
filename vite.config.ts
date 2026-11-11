import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path";

const apiProxy = {
  "/api": {
    target: "http://localhost:8080",
    changeOrigin: true,
    secure: false,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Ask before activating a new version (a reload would close the PiP timer).
      registerType: "prompt",
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png", "notification-icon.png"],
      manifest: {
        name: "TickBun",
        short_name: "TickBun",
        description: "Time tracker & break reminder",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#1D192B",
        background_color: "#ffffff",
        icons: [
          {src: "pwa-64x64.png", sizes: "64x64", type: "image/png"},
          {src: "pwa-192x192.png", sizes: "192x192", type: "image/png"},
          {src: "pwa-512x512.png", sizes: "512x512", type: "image/png"},
          {src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable"},
        ],
      },
      workbox: {
        // Precache the app shell only; API calls always go to the network.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: apiProxy,
  },
  // `npm run preview` serves the production build (with the service worker),
  // so it needs the same API proxy to log in and call the backend locally.
  preview: {
    proxy: apiProxy,
  },
})
