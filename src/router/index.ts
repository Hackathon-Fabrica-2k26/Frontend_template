import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { globalRouter } from '@/plugins/globalRouter'
import { setupLayouts } from 'virtual:generated-layouts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(
    routes.map(route => ({
      ...route,
      children: route.children?.map(child => ({
        ...child,
        meta: {
          ...child.meta,
          layout: false,
        },
      })),
    })),
  ),
})



globalRouter.router = router

// MODO DESENVOLVIMENTO
// Autenticação temporariamente desativada.
// Todas as rotas podem ser acessadas sem login.

// Tratamento de erros de carregamento das rotas.
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
