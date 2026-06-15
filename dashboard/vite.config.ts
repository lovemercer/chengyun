import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: env.VITE_ARTEMIS_GATEWAY || 'https://your-artemis-gateway.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-app-key', env.VITE_APP_KEY || '')
              proxyReq.setHeader('x-app-secret', env.VITE_APP_SECRET || '')
            })
          },
        },
      },
    },
  }
})
