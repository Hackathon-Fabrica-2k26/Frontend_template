import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { globalRouter } from './globalRouter'

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

function isAuthEndpoint (url?: string): boolean {
  return Boolean(
    url
    && /auth\/(?:login|logout|refresh|otp\/verify|otp\/resend)\//.test(url),
  )
}

api.interceptors.request.use(config => {
  const auth = useAuthStore()

  if (auth.access && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${auth.access}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined

    if (
      error.response?.status !== 401
      || !original
      || original._retry
      || isAuthEndpoint(original.url)
    ) {
      throw error
    }

    original._retry = true

    const auth = useAuthStore()

    try {
      const access = await auth.refreshAccess()

      original.headers.Authorization = `Bearer ${access}`

      return api(original)
    } catch (refreshError) {
      await auth.logout()

      const rotaAtual = globalRouter.router?.currentRoute.value
      const caminho = typeof window === 'undefined' ? '' : window.location.pathname
      const ehPublica
        = rotaAtual?.meta?.public === true
          || rotaAtual?.matched.some(r => r.meta?.public === true)
          || caminho.startsWith('/apoio')
          || caminho === '/enviar-laudo'
          || caminho === '/conferir-dados'
          || caminho === '/sair-site'

      if (!ehPublica) {
        await globalRouter.router?.push('/login')
      }
      throw refreshError
    }
  },
)

export default api
