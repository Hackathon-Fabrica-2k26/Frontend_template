/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

import 'vue-router'

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

declare module 'vue-router' {
  interface RouteMeta {
    /** Nome do layout em src/layouts (padrão: default). */
    layout?: string
    /** Rota acessível sem login. */
    public?: boolean
  }
}
