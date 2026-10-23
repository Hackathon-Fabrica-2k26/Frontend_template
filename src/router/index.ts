import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { globalRouter } from '@/plugins/globalRouter'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

globalRouter.router = router

router.beforeEach(to => {
  const auth = useAuthStore()

  // Login é uma página pública.
  if (to.path === '/login') {
    if (auth.isLogged) {
      return '/'
    }

    return true
  }

  // OTP exige que o login tenha sido iniciado.
  if (to.path === '/otp') {
    if (auth.isLogged) {
      return '/'
    }

    if (!auth.hasPendingOtp) {
      return '/login'
    }

    return true
  }

  // Páginas públicas não exigem autenticação.
  if (to.meta.public === true) {
    return true
  }

  // Protege as páginas privadas.
  if (!auth.isLogged) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
})

router.onError((err, to) => {
  if (
    err?.message?.includes?.(
      'Failed to fetch dynamically imported module',
    )
  ) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error(
        'Dynamic import error, reloading did not fix it',
        err,
      )
    } else {
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
