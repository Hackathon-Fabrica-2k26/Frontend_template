import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { globalRouter } from '@/plugins/globalRouter'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
    // Qualquer endereço sem página cai na tela de erro, logado ou não.
    {
      path: '/:pathMatch(.*)*',
      name: 'nao-encontrada',
      component: () => import('@/pages/erro.vue'),
      meta: { public: true, aberta: true },
    },
  ],
})

globalRouter.router = router

// Toda rota exige login, exceto as marcadas com meta.public (ver pages/login.vue).
// meta.aberta: abre para qualquer pessoa, logada ou não (ex.: tela de erro), sem redirecionar.
router.beforeEach(to => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLogged) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && !to.meta.aberta && auth.isLogged) {
    return '/'
  }
})

// https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
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
