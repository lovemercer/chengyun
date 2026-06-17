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
          target: env.VITE_ARTEMIS_GATEWAY || 'https://131.135.1.150:443',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => '/artemis' + path,
        },
      },
    },
  }
})
