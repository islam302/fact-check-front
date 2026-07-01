import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Same key the serverless proxies in /api use. Only applied by the dev proxy below,
// so it never ends up in the client bundle.
const API_KEY = 'nra_ce35c0f17f8ab7e1446eb14af61baf247e17aca000693b4ee4a0984e'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev calls hit /fact_checker/... same-origin; Vite forwards to the upstream
      // and injects the API key, avoiding CORS and keeping the key server-side.
      '/fact_checker': {
        target: 'http://62.72.22.223',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key', API_KEY)
          })
        },
      },
    },
  },
})
