/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** `true` ativa o mock de envio de trabalhos; padrão: false (usa a API real). */
  readonly VITE_MOCK_TRABALHOS?: string
  /** `true` ativa o mock de atividades; padrão: false (usa a API real). */
  readonly VITE_MOCK_ATIVIDADES?: string
  /** `true` ativa o mock de turmas e chamada; padrão: false (usa a API real). */
  readonly VITE_MOCK_TURMAS?: string
}

declare module 'vue-router' {
  interface RouteMeta {
    /** Nome do layout em src/layouts (padrão: default). `false` desativa o layout. */
    layout?: string | false
    /** Rota acessível sem login. */
    public?: boolean
  }
}
