import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/roblox-api/economy': {
        target: 'https://economy.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/economy/, ''),
      },
      '/roblox-api/thumbnails': {
        target: 'https://thumbnails.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/thumbnails/, ''),
      },
      '/roblox-api/users': {
        target: 'https://users.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/users/, ''),
      },
      '/roblox-api/games': {
        target: 'https://games.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/games/, ''),
      },
      '/roblox-api/apis': {
        target: 'https://apis.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/apis/, ''),
      },
      // NEW: game-passes API
      '/roblox-api/gamepasses': {
        target: 'https://gamepasses.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/gamepasses/, ''),
      },
      '/roblox-api/www': {
        target: 'https://www.roblox.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/roblox-api\/www/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          });
        },
      },
      // Proxies for Roblox CDN images to solve CORS/403 issues
      '/roblox-cdn-tr': {
        target: 'https://tr.rbxcdn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-cdn-tr/, ''),
      },
      '/roblox-cdn-t0': {
        target: 'https://t0.rbxcdn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-cdn-t0/, ''),
      },
    },
  },
})