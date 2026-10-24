<script setup lang="ts">
  import type { EtapaLaudo } from '@/components/laudo/LaudoEtapas.vue'
  import { onMounted, ref } from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import logoUrl from '@/assets/logoBaseTexto.webp'
  import LaudoEtapas from '@/components/laudo/LaudoEtapas.vue'

  // Layout do fluxo do responsável. Sem navegação: só a logo (sem link para a área logada) e o
  // cartão centralizado com as etapas, o mascote (slot `mascote`, com um LaudoMascote), o
  // título e o subtítulo. O conteúdo vai no slot padrão e os botões (LaudoBotao) no slot
  // `acoes`, que fica no rodapé do cartão.
  defineProps<{
    etapa: EtapaLaudo
    titulo: string
    subtitulo: string
  }>()

  const SAIDA_MS = 160

  const tituloEl = ref<HTMLElement | null>(null)
  const saindo = ref(false)

  function semMovimento () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Cada tela do fluxo monta este layout de novo: o foco vai para o título, e o leitor de tela
  // anuncia a troca de tela.
  onMounted(() => tituloEl.value?.focus({ preventScroll: true }))

  // Saída curta antes da troca de tela; sem movimento, a troca é imediata.
  onBeforeRouteLeave(async () => {
    if (semMovimento()) return
    saindo.value = true
    await new Promise(resolve => setTimeout(resolve, SAIDA_MS))
  })
</script>

<template>
  <div class="laudo" :class="{ 'laudo--saindo': saindo }">
    <header class="laudo__topo">
      <!-- Máscara: o logo é preto no arquivo; aqui ganha o verde do fluxo. -->
      <span aria-label="Marsupi" class="marca" role="img" :style="{ maskImage: `url(${logoUrl})` }" />
    </header>

    <main class="laudo__centro">
      <section aria-labelledby="titulo-laudo" class="cartao">
        <LaudoEtapas :atual="etapa" />

        <slot name="mascote" />

        <h1 id="titulo-laudo" ref="tituloEl" tabindex="-1">{{ titulo }}</h1>

        <p class="sub">{{ subtitulo }}</p>

        <div class="cartao__corpo">
          <slot />
        </div>

        <div v-if="$slots.acoes" class="acoes">
          <slot name="acoes" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.laudo {
  /* Cores do fluxo do responsável (Figma, seção Apoio). Valem só aqui dentro. */
  --apoio-verde: #2f4f45;
  --apoio-texto: #263d35;
  --apoio-texto-sec: #526d65;
  --apoio-borda: #dce6df;
  --apoio-fundo: #f7f7f1;
  --apoio-caixa: #f3f4ee;
  --apoio-menta: #e4eee7;
  --apoio-erro: #c0392b;
  --apoio-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --apoio-gap: 12px;

  display: grid;
  min-height: 100dvh;
  grid-template-rows: auto 1fr;
  padding:
    max(16px, env(safe-area-inset-top))
    max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom))
    max(16px, env(safe-area-inset-left));
  background: var(--apoio-fundo);
  color: var(--apoio-texto);
  font-family: var(--font-family);
  line-height: 1.5;
}

.laudo__topo {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding-inline: clamp(0px, 2vw, 16px);
}

.marca {
  display: block;
  width: clamp(96px, 9vw, 120px);
  aspect-ratio: 596 / 240;
  background: var(--apoio-verde);
  mask-position: left center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

/* O cartão fica no centro da área livre. A sobra embaixo, da altura do topo, equilibra a logo,
   e o cartão fica no centro da viewport em telas altas. */
.laudo__centro {
  display: grid;
  place-items: center;
  padding-block: clamp(16px, 4dvh, 40px);
}

@media (min-width: 600px) and (min-height: 700px) {
  .laudo__centro {
    padding-bottom: calc(48px + clamp(16px, 4dvh, 40px));
  }
}

.cartao {
  display: flex;
  width: min(100%, 600px);
  flex-direction: column;
  align-items: center;
  padding: clamp(20px, 5vw, 40px) clamp(16px, 5vw, 40px);
  border: 1px solid var(--apoio-borda);
  border-radius: clamp(16px, 3vw, 24px);
  background: #fff;
  text-align: center;
  animation: cartao-entra 300ms var(--apoio-ease) both;
}

.laudo--saindo .cartao {
  opacity: 0;
  translate: 0 -6px;
  transition: opacity 160ms ease, translate 160ms ease;
}

@keyframes cartao-entra {
  from {
    opacity: 0;
    translate: 0 10px;
  }
}

h1 {
  margin: clamp(12px, 2vw, 16px) 0 4px;
  font-size: clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

/* Foco do programa (troca de tela), não do teclado: sem anel. */
h1:focus {
  outline: none;
}

.sub {
  max-width: 46ch;
  margin: 0;
  color: var(--apoio-texto-sec);
  font-size: clamp(0.875rem, 0.84rem + 0.2vw, 0.9375rem);
  overflow-wrap: anywhere;
  text-wrap: pretty;
}

.cartao__corpo {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  gap: var(--apoio-gap);
  margin-top: clamp(16px, 3vw, 24px);
}

/* Mobile first: botões empilhados, largura total, o principal em cima. */
.acoes {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  gap: var(--apoio-gap);
  margin-top: clamp(20px, 4vw, 28px);
}

.acoes :slotted(.laudo-botao--principal) {
  order: -1;
}

@media (min-width: 520px) {
  .acoes {
    grid-template-columns: 1fr 2fr;
  }

  .acoes :slotted(.laudo-botao--principal) {
    order: 0;
  }

  /* Um botão só ocupa a linha inteira. */
  .acoes :slotted(.laudo-botao:only-child) {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cartao {
    animation: none;
  }

  .laudo--saindo .cartao {
    translate: none;
    transition: none;
  }
}
</style>
