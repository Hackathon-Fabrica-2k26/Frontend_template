import type { RegisterPayload, User } from '@/interfaces/user'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import authService from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // Persistido no localStorage (chave "auth").
  const state = useStorage('auth', {
    access: '',
    refresh: '',
    user: null as User | null,
  })

  const access = computed(() => state.value.access)
  const user = computed(() => state.value.user)
  const isLogged = computed(() => Boolean(state.value.access))

  async function login (email: string, password: string) {
    const tokens = await authService.login(email, password)
    state.value.access = tokens.access
    state.value.refresh = tokens.refresh
    state.value.user = await authService.me()
  }

  async function register (payload: RegisterPayload) {
    await authService.register(payload)
    await login(payload.email, payload.password)
  }

  // Uma renovação por vez: requisições simultâneas com 401 esperam a mesma promise.
  let refreshing: Promise<string> | null = null

  function refreshAccess () {
    refreshing ??= (async () => {
      if (!state.value.refresh) {
        throw new Error('Sessão expirada.')
      }
      const data = await authService.refresh(state.value.refresh)
      state.value.access = data.access
      if (data.refresh) {
        state.value.refresh = data.refresh
      }
      return data.access
    })().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  function logout () {
    state.value = { access: '', refresh: '', user: null }
  }

  return { access, user, isLogged, login, register, refreshAccess, logout }
})
