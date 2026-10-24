<script setup lang="ts">
  import { ref } from 'vue'

  // Mascote do fluxo do responsável, num círculo. Três camadas de movimento que não brigam
  // entre si (cada uma mexe numa propriedade diferente):
  // - `entrada`: uma vez, ao abrir a tela (translate/scale/opacity);
  // - `pose`: estado contínuo da tela (rotate/scale com transição, ou um balanço em loop);
  // - `reagir()`: gesto curto disparado pela página (Web Animations API em `transform`).
  // Os SVGs `carregando` e `sucesso` já trazem animação própria, que roda dentro do <img>.
  withDefaults(defineProps<{
    src: string
    entrada?: 'espiar' | 'pop' | 'quique'
    pose?: 'parado' | 'lendo' | 'inclinado' | 'esticado'
    /** Anel de comemoração, uma vez (tela final). */
    celebrar?: boolean
  }>(), { entrada: 'pop', pose: 'parado', celebrar: false })

  export type ReacaoMascote = 'sim' | 'pulo' | 'decola'

  const corpo = ref<HTMLElement | null>(null)

  const REACOES: Record<ReacaoMascote, { quadros: Keyframe[], ms: number }> = {
    // "Que sim" com a cabeça.
    sim: {
      quadros: [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-9deg)', offset: 0.25 },
        { transform: 'rotate(6deg)', offset: 0.55 },
        { transform: 'rotate(-2deg)', offset: 0.8 },
        { transform: 'rotate(0deg)' },
      ],
      ms: 650,
    },
    // Pulinho de alegria.
    pulo: {
      quadros: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-16%) scale(1.03, 0.97)', offset: 0.35 },
        { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.65 },
        { transform: 'translateY(-4%)', offset: 0.82 },
        { transform: 'translateY(0)' },
      ],
      ms: 600,
    },
    // Avião de papel saindo: inclina para a frente e volta.
    decola: {
      quadros: [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: 'translate(10%, -14%) rotate(-10deg)', offset: 0.4 },
        { transform: 'translate(-2%, 2%) rotate(3deg)', offset: 0.75 },
        { transform: 'translate(0, 0) rotate(0deg)' },
      ],
      ms: 700,
    },
  }

  function reagir (tipo: ReacaoMascote) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { quadros, ms } = REACOES[tipo]
    corpo.value?.animate(quadros, { duration: ms, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)' })
  }

  defineExpose({ reagir })
</script>

<template>
  <span
    aria-hidden="true"
    class="mascote"
    :class="[`mascote--entra-${entrada}`, `mascote--${pose}`, { 'mascote--celebrar': celebrar }]"
  >
    <span class="mascote__janela">
      <span ref="corpo" class="mascote__corpo">
        <Transition mode="out-in" name="mascote-troca">
          <img :key="src" alt="" class="mascote__img" :src="src">
        </Transition>
      </span>
    </span>
  </span>
</template>

<style scoped>
.mascote {
  position: relative;
  display: grid;
  width: clamp(72px, 16vw, 96px);
  aspect-ratio: 1;
  margin-top: clamp(16px, 3vw, 24px);
  border-radius: 50%;
  background: var(--apoio-menta);
}

/* Corta só embaixo: o canguru "espia" saindo da borda de baixo do círculo, mas orelhas e
   pulos podem passar por cima e pelos lados. */
.mascote__janela {
  display: grid;
  place-items: center;
  clip-path: inset(-100% -100% 0 -100%);
}

.mascote__corpo {
  display: grid;
  width: 76%;
  place-items: center;
  transform-origin: 50% 90%;
  transition: rotate 300ms var(--apoio-ease), scale 250ms var(--apoio-ease), translate 250ms var(--apoio-ease);
}

.mascote__img {
  display: block;
  width: 100%;
  height: auto;
  transform-origin: 50% 90%;
  animation: respira 4.5s ease-in-out infinite;
}

/* ---------- entrada (uma vez) ---------- */
.mascote--entra-espiar .mascote__corpo {
  animation: espiar 600ms var(--apoio-ease) 150ms backwards;
}

.mascote--entra-pop .mascote__corpo {
  animation: pop 450ms cubic-bezier(0.34, 1.4, 0.64, 1) 150ms backwards;
}

.mascote--entra-quique .mascote__corpo {
  animation: quique 650ms ease-out 150ms backwards;
}

@keyframes espiar {
  0% {
    opacity: 0;
    translate: 0 70%;
  }

  40% {
    opacity: 1;
  }

  75% {
    translate: 0 -5%;
  }

  100% {
    translate: 0 0;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    scale: 0.4;
  }
}

@keyframes quique {
  0% {
    opacity: 0;
    translate: 0 -60%;
  }

  45% {
    opacity: 1;
    translate: 0 0;
    scale: 1.06 0.92;
  }

  70% {
    translate: 0 -10%;
    scale: 0.98 1.03;
  }

  100% {
    translate: 0 0;
    scale: 1;
  }
}

/* ---------- pose (enquanto durar o estado) ---------- */
@keyframes respira {
  50% {
    scale: 1.025 0.985;
  }
}

/* Lendo o laudo: balança de um lado para o outro, como quem passa os olhos na página. */
.mascote--lendo .mascote__img {
  animation: le 2.4s ease-in-out infinite;
}

@keyframes le {
  0%,
  100% {
    rotate: -5deg;
  }

  50% {
    rotate: 5deg;
  }
}

/* Editando uma lista: inclina a cabeça, atento. */
.mascote--inclinado .mascote__corpo {
  rotate: -8deg;
}

/* Arquivo por cima da área de envio: estica e sobe, pronto para pegar. */
.mascote--esticado .mascote__corpo {
  scale: 1.08;
  translate: 0 -6%;
}

/* ---------- troca de imagem ---------- */
.mascote-troca-enter-active {
  transition: opacity 220ms ease, scale 260ms cubic-bezier(0.34, 1.4, 0.64, 1);
}

.mascote-troca-leave-active {
  transition: opacity 140ms ease, scale 140ms ease;
}

.mascote-troca-enter-from,
.mascote-troca-leave-to {
  opacity: 0;
  scale: 0.7;
}

/* ---------- tela final: anel que se abre uma vez ---------- */
.mascote--celebrar::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation: anel 450ms ease-out 450ms;
}

@keyframes anel {
  from {
    opacity: 0.8;
    scale: 0.95;
  }

  to {
    opacity: 0;
    scale: 1.4;
  }
}

/* Mesma especificidade das regras de entrada/pose (duas classes), vindo depois: vence. */
@media (prefers-reduced-motion: reduce) {
  .mascote .mascote__corpo,
  .mascote .mascote__img,
  .mascote.mascote--celebrar::after {
    animation: none;
  }

  .mascote .mascote__corpo,
  .mascote .mascote-troca-enter-active,
  .mascote .mascote-troca-leave-active {
    transition: none;
  }
}
</style>
