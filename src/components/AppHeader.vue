<template>
  <header class="sticky top-3 z-50 mt-5 px-3 sm:px-8 lg:px-28">
    <div
      class="mx-auto flex items-center gap-2 rounded-3xl border-[1.5px] border-primary bg-background/90 py-2.5 pr-3 pl-3 backdrop-blur-md sm:gap-8 sm:py-3.5 sm:pr-10 sm:pl-6 shadow-[0_1px_2px_rgb(38_61_53/0.06),0_8px_16px_-6px_rgb(38_61_53/0.12),0_24px_40px_-16px_rgb(53_107_91/0.28)]"
    >
      <router-link
        aria-label="Marsupi - ir para o início"
        class="grid h-11 w-9 shrink-0 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-[52px] sm:w-11"
        to="/"
      >
        <!-- Máscara: o símbolo é preto no arquivo original; aqui ganha o verde primary. -->
        <span
          aria-hidden="true"
          class="block h-[38px] w-[27px] bg-primary mask-contain mask-center mask-no-repeat sm:h-[46px] sm:w-[33px]"
          :style="{ maskImage: `url(${logo})` }"
        />
      </router-link>

      <AppHeaderNav :links="links" />

      <div class="ml-auto flex items-center gap-2 sm:gap-8">
        <AppHeaderSearch @submit="onSearch" />
        <AppHeaderUser :email="auth.user?.email" :name="auth.user?.name" @logout="onLogout" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import logo from '@/assets/logoBase.webp'
  import { useAuthStore } from '@/stores/auth'

  defineProps<{ links: { title: string, to: string }[] }>()

  const auth = useAuthStore()
  const router = useRouter()

  function onSearch (query: string) {
    router.push({ path: '/turmas', query: { q: query } })
  }

  function onLogout () {
    auth.logout()
    router.push('/login')
  }
</script>
