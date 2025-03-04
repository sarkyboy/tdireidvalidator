import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Cloudflare Pages 部署配置
    target: 'esnext',
    assetsInlineLimit: 4096,
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true
  }
})