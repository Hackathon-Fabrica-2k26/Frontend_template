import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { globalRouter } from './globalRouter'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

api.interceptors.request.use(config => {
  const { access } = useAuthStore()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

function isAuthEndpoint (url?: string) {
  return Boolean(url && /auth\/(?:login|refresh|register)\//.test(url))
}

// 401: tenta renovar o token uma vez e repete a requisição; se falhar, volta ao login.
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    if (error.response?.status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      throw error
    }
    original._retry = true
    const auth = useAuthStore()
    try {
      const access = await auth.refreshAccess()
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    } catch (refreshError) {
      auth.logout()
      globalRouter.router?.push('/login')
      throw refreshError
    }
  },
)

export default api
