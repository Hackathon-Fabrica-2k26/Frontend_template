import type { User } from '@/interfaces/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import authService from '@/services/auth'

interface AuthState {
  access: string
  refresh: string
  user: User | null
}

interface PendingOtp {
  otp_token: string
  email: string
  remember: boolean
}

const AUTH_KEY = 'auth'
const OTP_KEY = 'marsupi:pending-otp'

function emptyAuth (): AuthState {
  return {
    access: '',
    refresh: '',
    user: null,
  }
}

function readAuth (): {
  state: AuthState
  remember: boolean
} {
  const storages = [
    { storage: localStorage, remember: true },
    { storage: sessionStorage, remember: false },
  ]

  for (const item of storages) {
    const raw = item.storage.getItem(AUTH_KEY)
    if (!raw) {
      continue
    }

    try {
      const parsed: unknown = JSON.parse(raw)

      if (
        typeof parsed === 'object'
        && parsed !== null
        && 'access' in parsed
        && 'refresh' in parsed
        && typeof parsed.access === 'string'
        && typeof parsed.refresh === 'string'
      ) {
        return {
          state: {
            access: parsed.access,
            refresh: parsed.refresh,
            user: 'user' in parsed
              ? parsed.user as User | null
              : null,
          },
          remember: item.remember,
        }
      }
    } catch {
      // Ignora dados inválidos.
    }

    item.storage.removeItem(AUTH_KEY)
  }

  return {
    state: emptyAuth(),
    remember: false,
  }
}

function readPending (): PendingOtp | null {
  const raw = sessionStorage.getItem(OTP_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'otp_token' in parsed
      && 'email' in parsed
      && 'remember' in parsed
      && typeof parsed.otp_token === 'string'
      && typeof parsed.email === 'string'
      && typeof parsed.remember === 'boolean'
    ) {
      return parsed as PendingOtp
    }
  } catch {
    // Dados inválidos.
  }

  sessionStorage.removeItem(OTP_KEY)
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const initial = readAuth()

  const state = ref<AuthState>(initial.state)
  const remember = ref(initial.remember)
  const pending = ref<PendingOtp | null>(readPending())

  const access = computed(() => state.value.access)
  const user = computed(() => state.value.user)
  const isLogged = computed(() => Boolean(access.value))
  const otpEmail = computed(() => pending.value?.email ?? '')
  const hasPendingOtp = computed(
    () => Boolean(pending.value?.otp_token),
  )

  function persist (): void {
    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_KEY)

    const storage = remember.value
      ? localStorage
      : sessionStorage

    storage.setItem(AUTH_KEY, JSON.stringify(state.value))
  }

  function clearPending (): void {
    pending.value = null
    sessionStorage.removeItem(OTP_KEY)
  }

  async function login (
    matricula: string,
    password: string,
    keepConnected = false,
  ): Promise<void> {
    const response = await authService.login(
      matricula,
      password,
    )

    state.value = emptyAuth()

    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_KEY)

    pending.value = {
      otp_token: response.otp_token,
      email: response.email,
      remember: keepConnected,
    }

    sessionStorage.setItem(
      OTP_KEY,
      JSON.stringify(pending.value),
    )
  }

  async function verifyOtp (code: string): Promise<void> {
    if (!pending.value) {
      throw new Error('Faça login novamente.')
    }

    const tokens = await authService.verifyOtp(
      pending.value.otp_token,
      code,
    )

    remember.value = pending.value.remember

    state.value = {
      access: tokens.access,
      refresh: tokens.refresh,
      user: null,
    }

    persist()
    clearPending()

    try {
      state.value.user = await authService.me()
      persist()
    } catch {
      // O perfil poderá ser carregado depois.
    }
  }

  async function resendOtp (): Promise<void> {
    if (!pending.value) {
      throw new Error('Faça login novamente.')
    }

    await authService.resendOtp(pending.value.otp_token)
  }

  let refreshing: Promise<string> | null = null

  function refreshAccess (): Promise<string> {
    refreshing ??= (async () => {
      if (!state.value.refresh) {
        throw new Error('Sessão expirada.')
      }

      const data = await authService.refresh(
        state.value.refresh,
      )

      state.value.access = data.access

      if (data.refresh) {
        state.value.refresh = data.refresh
      }

      persist()
      return data.access
    })().finally(() => {
      refreshing = null
    })

    return refreshing
  }

  // Salva nome/e-mail só no front (store + storage), sem chamar o servidor.
  async function updateProfile (payload: Partial<User> & { name: string, email: string }): Promise<void> {
    const current = state.value.user ?? (payload.matricula === undefined ? null : { id: payload.id ?? 0, matricula: payload.matricula, name: payload.name, email: payload.email })
    state.value.user = {
      id: current?.id ?? 0,
      matricula: current?.matricula ?? '',
      ...current,
      name: payload.name,
      email: payload.email,
      tratamento: payload.tratamento ?? current?.tratamento,
    }
    persist()
  }

  function logout (): void {
    state.value = emptyAuth()
    remember.value = false

    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_KEY)

    clearPending()
  }

  return {
    access,
    user,
    isLogged,
    otpEmail,
    hasPendingOtp,
    login,
    verifyOtp,
    resendOtp,
    refreshAccess,
    updateProfile,
    logout,
  }
})
