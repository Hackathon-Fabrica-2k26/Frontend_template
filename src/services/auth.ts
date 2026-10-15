import type { RegisterPayload, User } from '@/interfaces/user'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

export interface Tokens {
  access: string
  refresh: string
}

// Um service por recurso do backend. Todos os erros saem como Error com mensagem pronta.
class AuthService {
  async login (email: string, password: string): Promise<Tokens> {
    try {
      const { data } = await api.post<Tokens>('auth/login/', { email, password })
      return data
    } catch (error) {
      throw buildApiError(error, 'E-mail ou senha inválidos.')
    }
  }

  async register (payload: RegisterPayload): Promise<User> {
    try {
      const { data } = await api.post<User>('auth/register/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar a conta.')
    }
  }

  async refresh (refresh: string): Promise<{ access: string, refresh?: string }> {
    const { data } = await api.post('auth/refresh/', { refresh })
    return data
  }

  async me (): Promise<User> {
    try {
      const { data } = await api.get<User>('auth/me/')
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o usuário.')
    }
  }
}

export default new AuthService()
