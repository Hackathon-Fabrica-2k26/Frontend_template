<template>
  <!-- Cada parte do canguru é um elemento HTML com a sua própria transformação: o navegador
       move tudo na GPU, sem repintar o SVG a cada quadro. As posições seguem o sistema de
       coordenadas do símbolo (origem 230,105; 1100 x 745), em unidades de --mw / 1100. -->

  <!-- Parte de trás: só a cabeça. Fica atrás do modal, que cobre o resto do corpo. -->
  <div
    v-if="parte === 'tras'"
    ref="caixa"
    aria-hidden="true"
    class="mm mm--tras"
    :class="estado"
  >
    <svg class="mm__svg" focusable="false" viewBox="230 105 1100 745" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="mm-corte"><rect height="762" width="1263" x="0" y="0" /></clipPath>
      </defs>

      <g clip-path="url(#mm-corte)">
        <!-- Contorno creme (como nas patas): a cabeça se destaca sobre qualquer fundo -->
        <path
          :d="SIMBOLO"
          fill="#356B5B"
          fill-rule="evenodd"
          paint-order="stroke"
          stroke="#F7F7F1"
          stroke-linejoin="round"
          stroke-width="26"
        />
      </g>
    </svg>
  </div>

  <!-- Parte da frente: patas na borda e o adereço da etapa (lupa, selo, faíscas). -->
  <div v-else aria-hidden="true" class="mm mm--frente" :class="estado">
    <svg class="mm__svg mm__patas" focusable="false" viewBox="230 105 1100 745" xmlns="http://www.w3.org/2000/svg">
      <MascotePata :x="330" :y="756" />
      <MascotePata :x="800" :y="756" />
    </svg>

    <!-- Processando: lupa que varre, presa pela ponta do cabo (adereço "lupa" do pacote) -->
    <svg ref="lupa" class="mm__adereco mm__lupa" viewBox="0 0 300 300">
      <line
        stroke="#E3B477"
        stroke-linecap="round"
        stroke-width="34"
        x1="188"
        x2="262"
        y1="188"
        y2="262"
      />

      <circle
        cx="120"
        cy="120"
        fill="#FFFFFF"
        r="84"
        stroke="#356B5B"
        stroke-width="22"
      />

      <path
        d="M 70 112 Q 80 76 118 70"
        fill="none"
        stroke="#A9C7B4"
        stroke-linecap="round"
        stroke-width="12"
      />

    </svg>

    <!-- Revisão: o selo de check estoura quando todos os alunos foram escolhidos -->
    <svg class="mm__adereco mm__selo" viewBox="0 0 300 300">
      <circle cx="150" cy="150" fill="#E3B477" r="124" />

      <path
        d="M 86 152 L 132 198 L 216 104"
        fill="none"
        stroke="#263D35"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="28"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { SIMBOLO } from '@/assets/mascote-simbolo'

  type Etapa = 'envio' | 'processamento' | 'revisao' | 'concluido'

  const props = withDefaults(defineProps<{
    parte: 'tras' | 'frente'
    etapa: Etapa
    // Um arquivo está sobre a área de envio.
    arrastando?: boolean
    // Revisão completa: todos os alunos escolhidos.
    pronto?: boolean
    // Quantos arquivos já foram analisados (cada novo faz a cabeça acenar).
    concluidos?: number
    // Quantos arquivos estão na lista de envio (receber ou remover um também faz que sim).
    recebidos?: number
    // Há análise em andamento: só então a lupa varre.
    ocupado?: boolean
  }>(), { arrastando: false, pronto: false, concluidos: 0, recebidos: 0, ocupado: false })

  const caixa = ref<HTMLElement | null>(null)
  const lupa = ref<SVGElement | null>(null)

  // O canguru já abre espiando com as patas na borda (antes só as orelhas apareciam e ele
  // parecia sumido); na etapa final a cabeça afunda, porque ele pula para dentro do modal.
  const subido = computed(() => props.etapa !== 'concluido')

  const estado = computed(() => [
    `mm--${props.etapa}`,
    {
      'mm--subido': subido.value,
      'mm--arrastando': props.arrastando,
      'mm--pronto': props.pronto,
      'mm--ocupado': props.ocupado,
    },
  ])

  // "Que sim" com a cabeça: Web Animations API na propriedade `translate`, que soma com o
  // `transform` da subida e roda na GPU. Reinicia a cada nova reação, sem recriar elementos.
  watch(() => [props.concluidos, props.recebidos, props.pronto], () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Cada arquivo concluído faz a lente da lupa pulsar (propriedade `scale`: soma com o
    // `transform` da varredura, sem brigar com ela).
    lupa.value?.animate(
      [{ scale: '1' }, { scale: '1.12', offset: 0.4 }, { scale: '1' }],
      { duration: 420, easing: 'ease-out' },
    )

    if (props.parte !== 'tras') {
      return
    }
    caixa.value?.animate(
      [
        { translate: '0 0', offset: 0 },
        { translate: '0 8%', offset: 0.35 },
        { translate: '0 0', offset: 1 },
      ],
      { duration: 500, easing: 'ease-in-out' },
    )
  })
</script>

<style scoped>
/* O pai posiciona (absolute) e define --mw; os adereços se ancoram nesta caixa. */
.mm {
  aspect-ratio: 1100 / 745;
}

.mm__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* ---------- cabeça: orelhas no repouso, sobe com leve sobressalto ---------- */
.mm--tras {
  /* --mw = largura do canguru (definida pelo pai). A cabeça tem 0,588*mw acima da borda;
     em repouso sobra 0,17*mw de orelhas à mostra. */
  transform: translateY(calc(var(--mw, 150px) * 0.418));
  transform-origin: 50% 85%;
  transition:
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    rotate 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.mm--tras.mm--subido {
  transform: translateY(calc(var(--mw, 150px) * 0.067));
}

/* Etapa final: a cabeça some por inteiro; quem pula é o canguru inteiro, dentro do modal. */
.mm--tras.mm--concluido {
  transform: translateY(calc(var(--mw, 150px) * 0.66));
}

/* Arquivo por cima da área de envio: o canguru inclina a cabeça, curioso. */
.mm--tras.mm--arrastando {
  rotate: -5deg;
}

/* Parado no envio, as orelhas se mexem de vez em quando (um tique, com longas pausas). */
.mm--tras.mm--envio:not(.mm--arrastando) {
  animation: mm-orelha 7s ease-in-out 2s infinite;
}

@keyframes mm-orelha {
  0%, 88%, 100% {
    rotate: 0deg;
  }

  91% {
    rotate: -4deg;
  }

  94% {
    rotate: 3deg;
  }

  97% {
    rotate: -1.5deg;
  }
}

/* ---------- patas: surgem depois que a cabeça já subiu ---------- */
.mm__patas {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mm--subido .mm__patas {
  opacity: 1;
  transition-delay: 0.25s;
}

/* ---------- adereços: elementos soltos, posicionados em unidades de --mw / 1100 ---------- */
.mm__adereco {
  position: absolute;
  display: block;
  overflow: visible;
  will-change: transform, opacity;
}

/* lupa (processando): gira em torno da ponta do cabo, que fica no canto inferior direito */
.mm__lupa {
  top: calc(var(--mw, 150px) * 0.4176);
  left: calc(var(--mw, 150px) * 0.5404);
  width: calc(var(--mw, 150px) * 0.3545);
  height: calc(var(--mw, 150px) * 0.3545);
  opacity: 0;
  transform: translateY(40px) rotate(18deg) scale(0.6);
  transform-origin: 87.3% 87.3%;
  transition: opacity 0.25s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.mm--processamento .mm__lupa {
  opacity: 1;
  transform: none;
  transition-delay: 0.35s;
  animation: mm-varre 1.6s ease-in-out 0.9s infinite alternate;
}

/* Sem análise rodando, a lupa para onde estava: varrer sem conferir nada não significa nada. */
.mm--processamento:not(.mm--ocupado) .mm__lupa {
  animation-play-state: paused;
}

/* varre de um lado a outro, como quem confere cada trabalho */
@keyframes mm-varre {
  from {
    transform: rotate(-16deg);
  }

  to {
    transform: rotate(10deg) translateY(-6%);
  }
}

/* selo (revisão completa) */
.mm__selo {
  top: calc(var(--mw, 150px) * 0.2909);
  left: calc(var(--mw, 150px) * 0.5682);
  width: calc(var(--mw, 150px) * 0.2455);
  height: calc(var(--mw, 150px) * 0.2455);
  opacity: 0;
  transform: scale(0);
}

.mm--revisao.mm--pronto .mm__selo {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
