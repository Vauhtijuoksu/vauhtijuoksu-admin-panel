import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        changeOrigin: true,
        secure: false,
        target: "http://localhost",
        rewrite: (path) => path.replace(/^\/api/, ''),
        hostRewrite: "https://api.dev.vauhtijuoksu.fi"
      }
    },
  },
})

