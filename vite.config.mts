import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts-next'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Rotas vêm de src/pages, layouts de src/layouts, componentes de src/components (auto-registrados).
export default defineConfig({
  plugins: [
    VueRouter({ dts: 'src/typed-router.d.ts' }),
    tailwindcss(),
    Layouts(),
    Vue({ template: { transformAssetUrls } }),
    Vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
    Components({ dts: 'src/components.d.ts' }),
    Fonts({
      google: {
        families: [{ name: 'Poppins', styles: 'wght@400;500;600' }],
      },
    }),
    vueDevTools(),
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: { '@': fileURLToPath(new URL('src', import.meta.url)) },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: { host: '0.0.0.0', port: 3000 },
})
