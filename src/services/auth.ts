import type { User } from '@/interfaces/user'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

export interface Tokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  otp_token: string
  email: string
}

class AuthService {
  async login (
    matricula: string,
    password: string,
  ): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>(
        'auth/login/',
        { matricula, password },
      )

      return data
    } catch (error: unknown) {
      throw buildApiError(error, 'Matrícula ou senha inválidas.')
    }
  }

  async verifyOtp (
    otp_token: string,
    code: string,
  ): Promise<Tokens> {
    try {
      const { data } = await api.post<Tokens>(
        'auth/otp/verify/',
        { otp_token, code },
      )

      return data
    } catch (error: unknown) {
      throw buildApiError(error, 'Código inválido ou expirado.')
    }
  }

  async resendOtp (otp_token: string): Promise<void> {
    try {
      await api.post('auth/otp/resend/', { otp_token })
    } catch (error: unknown) {
      throw buildApiError(error, 'Não foi possível reenviar o código.')
    }
  }

  async refresh (
    refresh: string,
  ): Promise<{ access: string, refresh?: string }> {
    const { data } = await api.post<{
      access: string
      refresh?: string
    }>('auth/refresh/', { refresh })

    return data
  }

  async me (): Promise<User> {
    try {
      const { data } = await api.get<User>('auth/me/')
      return data
    } catch (error: unknown) {
      throw buildApiError(error, 'Não foi possível carregar o usuário.')
    }
  }

  async updateProfile (payload: { name: string, email: string }): Promise<User> {
    try {
      const { data } = await api.patch<User>('auth/me/', payload)
      return data
    } catch (error: unknown) {
      throw buildApiError(error, 'Não foi possível atualizar o perfil.')
    }
  }
}

export default new AuthService()
