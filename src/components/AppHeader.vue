<template>
  <header class="sticky top-3 z-50 mt-5 px-3 sm:px-8 lg:px-28">
    <!-- Filtro de refração: desloca o fundo perto das bordas, como a borda grossa de uma lente (só Chromium usa). -->
    <svg aria-hidden="true" class="absolute size-0" focusable="false">
      <filter
        id="liquid-glass"
        color-interpolation-filters="sRGB"
        height="100%"
        width="100%"
        x="0"
        y="0"
      >
        <feTurbulence
          baseFrequency="0.008 0.02"
          numOctaves="2"
          result="noise"
          seed="7"
          type="fractalNoise"
        />

        <feGaussianBlur in="noise" result="map" stdDeviation="6" />

        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="26"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <div
      class="liquid-glass mx-auto flex items-center gap-2 rounded-3xl py-2.5 pr-3 pl-3 sm:gap-8 sm:py-3.5 sm:pr-10 sm:pl-6"
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

<style scoped>
.liquid-glass {
  position: relative;
  isolation: isolate;
  /* Fallback sem backdrop-filter: quase opaco para o texto continuar legível. */
  background: rgb(247 247 241 / 0.92);
  border: 1px solid rgb(53 107 91 / 0.28);
  box-shadow:
    /* aro especular: luz entrando pelo topo e pela esquerda */
    inset 0 1.5px 0 rgb(255 255 255 / 0.9),
    inset 1.5px 0 0 rgb(255 255 255 / 0.45),
    /* borda escura de baixo, dá espessura ao vidro */
    inset 0 -1.5px 0 rgb(53 107 91 / 0.14),
    inset 0 0 22px rgb(255 255 255 / 0.35),
    0 1px 2px rgb(38 61 53 / 0.06),
    0 10px 18px -6px rgb(38 61 53 / 0.14),
    0 26px 44px -18px rgb(53 107 91 / 0.3);
}

@supports (backdrop-filter: blur(1px)) {
  .liquid-glass {
    background: linear-gradient(
      135deg,
      rgb(255 255 255 / 0.52) 0%,
      rgb(247 247 241 / 0.3) 45%,
      rgb(169 199 180 / 0.2) 100%
    );
    backdrop-filter: blur(14px) saturate(170%) brightness(1.04);
  }
}

/* Refração real só onde o navegador aceita url() em backdrop-filter (Chromium). */
@supports (backdrop-filter: url(#a)) {
  .liquid-glass {
    backdrop-filter: url(#liquid-glass) blur(10px) saturate(170%) brightness(1.04);
  }
}

/* Brilho que atravessa o vidro, só no canto superior. */
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(120% 90% at 12% 0%, rgb(255 255 255 / 0.55), transparent 55%);
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass {
    background: var(--color-background);
    backdrop-filter: none;
  }
}
</style>
