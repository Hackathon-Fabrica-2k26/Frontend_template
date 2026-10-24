<script setup lang="ts">
  import { ArrowLeft, House } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import erro404Url from '@/assets/erro-404.svg'
  import logoUrl from '@/assets/logoBaseTexto.webp'
  import stickerBuscaUrl from '@/assets/mascotes/adesivo-busca.svg'
  import stickerDuvidaUrl from '@/assets/mascotes/adesivo-duvida.svg'
  import ondaDireitaUrl from '@/assets/onda-direita.svg'
  import ondaEsquerdaUrl from '@/assets/onda-esquerda.svg'
  import { menuLinks } from '@/config/menu'
  import { useAuthStore } from '@/stores/auth'

  // Sem layout próprio: com login a página desenha o header da plataforma, sem login não.
  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const router = useRouter()
  const auth = useAuthStore()

  const logado = computed(() => auth.isLogged)
  const destino = computed(() => (logado.value ? '/' : '/login'))
  const rotuloBotao = computed(() => (logado.value ? 'Voltar ao início' : 'Voltar ao login'))

  // Há histórico do próprio app para voltar? (state.back vem do vue-router)
  const temPaginaAnterior = computed(() => typeof window !== 'undefined' && Boolean(window.history.state?.back))

  const palco = ref<HTMLElement | null>(null)
  let quadro = 0

  // Os adesivos andam um pouco no sentido contrário do ponteiro (profundidade). Um ajuste por quadro.
  function mover (event: PointerEvent) {
    if (event.pointerType === 'touch' || quadro) {
      return
    }
    const { clientX, clientY } = event
    quadro = requestAnimationFrame(() => {
      quadro = 0
      palco.value?.style.setProperty('--px', ((clientX / window.innerWidth) - 0.5).toFixed(3))
      palco.value?.style.setProperty('--py', ((clientY / window.innerHeight) - 0.5).toFixed(3))
    })
  }

  onMounted(() => {
    document.title = 'Página não encontrada · Marsupi'
  })

  onBeforeUnmount(() => cancelAnimationFrame(quadro))
</script>

<template>
  <div class="pagina">
    <AppHeader v-if="logado" :links="menuLinks" />

    <main ref="palco" class="not-found" :class="{ 'not-found--logado': logado }" @pointermove="mover">
      <img alt="" class="onda onda--esquerda" :src="ondaEsquerdaUrl">
      <img alt="" class="onda onda--direita" :src="ondaDireitaUrl">

      <router-link
        v-if="!logado"
        aria-label="Marsupi - ir para o login"
        class="marca"
        to="/login"
      >
        <!-- Máscara: o logo é preto no arquivo; aqui ganha o verde primary. -->
        <span aria-hidden="true" class="marca__logo" :style="{ maskImage: `url(${logoUrl})` }" />
      </router-link>

      <section aria-labelledby="titulo-404" class="conteudo">
        <div class="cena">
          <img alt="404" class="codigo entra" :src="erro404Url">

          <span aria-hidden="true" class="adesivo adesivo--duvida">
            <img alt="" :src="stickerDuvidaUrl">
          </span>

          <span aria-hidden="true" class="adesivo adesivo--busca">
            <img alt="" :src="stickerBuscaUrl">
          </span>
        </div>

        <h1 id="titulo-404" class="entra" style="animation-delay: 140ms">Parece que saímos do caminho.</h1>

        <p class="entra" style="animation-delay: 220ms">
          Procuramos por todo canto, mas não achamos a página que você queria. Ela pode ter mudado de lugar ou o endereço está incorreto.
        </p>

        <div class="acoes entra" style="animation-delay: 300ms">
          <v-btn
            class="acao"
            color="primary"
            :prepend-icon="logado ? House : ArrowLeft"
            size="large"
            :to="destino"
            variant="flat"
          >
            {{ rotuloBotao }}
          </v-btn>

          <v-btn
            v-if="temPaginaAnterior"
            class="acao"
            color="primary"
            size="large"
            variant="outlined"
            @click="router.back()"
          >
            Página anterior
          </v-btn>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.not-found {
  position: relative;
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 6rem 1.25rem 7rem;
  --px: 0;
  --py: 0;
  overflow: hidden;
  background: var(--color-background);
  font-family: var(--font-family);
}

.not-found--logado {
  /* Header sticky ocupa ~110px do topo; o conteúdo centraliza no resto. */
  min-height: calc(100dvh - 110px);
  margin-top: -1.25rem;
  padding-block: 2rem 6rem;
}

.conteudo {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-icon-label);
  text-align: center;
}

.cena {
  position: relative;
  margin-bottom: var(--space-groups);
}

.cena .codigo {
  margin-bottom: 0;
}

.adesivo {
  position: absolute;
  width: clamp(64px, 11vw, 112px);
  translate: calc(var(--px) * -26px) calc(var(--py) * -18px);
  transition: translate 500ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
  pointer-events: none;
}

.adesivo img {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 14px rgb(53 107 91 / 0.22));
  animation: flutua 5s ease-in-out infinite;
}

.adesivo--duvida {
  top: -14%;
  right: -9%;
}

.adesivo--duvida img {
  rotate: 8deg;
}

.adesivo--busca {
  bottom: -10%;
  left: -8%;
  translate: calc(var(--px) * 22px) calc(var(--py) * 14px);
}

.adesivo--busca img {
  rotate: -9deg;
  animation-delay: -2.4s;
}

@keyframes flutua {
  50% {
    transform: translateY(-9px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .adesivo,
  .adesivo img {
    animation: none;
    transition: none;
  }
}

.codigo {
  display: block;
  width: clamp(260px, 52vw, 600px);
  height: auto;
  margin-bottom: var(--space-groups);
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.375rem, 3vw, 1.875rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
  text-wrap: balance;
}

p {
  max-width: 44ch;
  margin: 0;
  color: rgb(38 61 53 / 0.82);
  font-size: 1rem;
  line-height: 1.6;
  text-wrap: pretty;
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-icon-label);
  margin-top: var(--space-groups);
}

.acao {
  height: var(--control-height) !important;
  min-width: 190px;
  border-radius: var(--radius-control);
  font-family: inherit;
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0;
  text-transform: none;
}

.acao:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Logo no topo, sobre o fundo claro: antes ficava em cima da onda laranja, com contraste baixo. */
.marca {
  position: absolute;
  top: 1.75rem;
  left: 2rem;
  z-index: 1;
  display: block;
  border-radius: var(--radius-control);
}

.marca:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

.marca__logo {
  display: block;
  width: 112px;
  height: 45px;
  background: var(--color-primary);
  mask-position: left center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.onda {
  position: absolute;
  bottom: 0;
  height: auto;
  pointer-events: none;
}

.onda--esquerda {
  left: 0;
  width: clamp(110px, 13vw, 260px);
}

.onda--direita {
  right: 0;
  width: clamp(140px, 21vw, 400px);
}

.entra {
  animation: entra 700ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
}

@keyframes entra {
  from {
    opacity: 0;
    translate: 0 14px;
  }
}

@media (max-width: 480px) {
  .not-found {
    padding-block: 5.5rem 8rem;
  }

  .marca {
    left: 1.25rem;
  }

  .acao {
    width: 100%;
  }

  .adesivo--duvida {
    right: -4%;
  }

  .adesivo--busca {
    left: -4%;
  }

  .acoes {
    width: 100%;
    max-width: 320px;
  }
}
</style>
