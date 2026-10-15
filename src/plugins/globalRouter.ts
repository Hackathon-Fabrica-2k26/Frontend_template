import type { Router } from 'vue-router'

// Permite navegar fora de componentes (ex.: interceptor do axios).
export const globalRouter: { router: Router | null } = { router: null }
