import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// const apiProxyTarget =
//   process.env.VITE_API_PROXY_TARGET ?? 'http://192.168.31.28:8081'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // proxy: {
    //   '/api': {
    //     target: apiProxyTarget,
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})
