/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

declare module 'vue-router' {
  interface RouteMeta {
    /** Nome do layout em src/layouts (padrão: default). `false` desativa o layout. */
    layout?: string | false
    /** Rota acessível sem login. */
    public?: boolean
  }
}
