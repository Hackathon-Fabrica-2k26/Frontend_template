<template>
  <figure class="radar">
    <svg :aria-label="descricao" role="img" viewBox="-30 0 380 300">
      <polygon
        v-for="nivel in niveis"
        :key="nivel"
        class="radar-grade"
        :points="poligono(nivel / 100)"
      />

      <line
        v-for="(eixo, i) in eixos"
        :key="eixo.nome"
        class="radar-eixo"
        :x1="CX"
        :x2="ponto(i, 1).x"
        :y1="CY"
        :y2="ponto(i, 1).y"
      />

      <polygon class="radar-area" :points="areaPontos" />

      <circle
        v-for="(eixo, i) in eixos"
        :key="`p-${eixo.nome}`"
        class="radar-ponto"
        :cx="ponto(i, eixo.valor / 100).x"
        :cy="ponto(i, eixo.valor / 100).y"
        r="4.5"
      />

      <text
        v-for="(eixo, i) in eixos"
        :key="`t-${eixo.nome}`"
        class="radar-rotulo"
        :text-anchor="ancora(i)"
        :x="ponto(i, 1.2).x"
        :y="ponto(i, 1.2).y + 4"
      >
        {{ eixo.nome }}
      </text>
    </svg>
  </figure>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{ metricas: Record<string, number> }>()

  const CX = 160
  const CY = 150
  const RAIO = 95
  const niveis = [25, 50, 75, 100]

  const eixos = computed(() =>
    Object.entries(props.metricas).map(([nome, valor]) => ({
      nome,
      valor: Math.min(100, Math.max(0, valor)),
    })),
  )

  function ponto (indice: number, escala: number) {
    const angulo = (Math.PI * 2 * indice) / Math.max(eixos.value.length, 1) - Math.PI / 2
    return { x: CX + Math.cos(angulo) * RAIO * escala, y: CY + Math.sin(angulo) * RAIO * escala }
  }

  function poligono (escala: number): string {
    return eixos.value.map((_, i) => `${ponto(i, escala).x},${ponto(i, escala).y}`).join(' ')
  }

  function ancora (indice: number): 'start' | 'middle' | 'end' {
    const x = ponto(indice, 1).x
    if (Math.abs(x - CX) < 8) return 'middle'
    return x > CX ? 'start' : 'end'
  }

  const areaPontos = computed(() =>
    eixos.value.map((e, i) => `${ponto(i, e.valor / 100).x},${ponto(i, e.valor / 100).y}`).join(' '),
  )

  const descricao = computed(() =>
    `Radar de habilidades: ${eixos.value.map(e => `${e.nome} ${e.valor}%`).join(', ')}`,
  )
</script>

<style scoped>
.radar { margin: 0; }
.radar svg { display: block; width: 100%; height: auto; }
.radar-grade { fill: none; stroke: #a9c7b4; stroke-width: 1; }
.radar-eixo { stroke: #a9c7b4; stroke-width: 1; }
.radar-area {
  fill: rgb(53 107 91 / 28%);
  stroke: #356b5b;
  stroke-width: 2.5;
  stroke-linejoin: round;
  transform-origin: 160px 150px;
  animation: radar-abrir 0.8s cubic-bezier(.3, 1.3, .5, 1) both;
}
.radar-ponto { fill: #e3b477; stroke: #356b5b; stroke-width: 2; }
.radar-rotulo { fill: #263d35; font-family: Poppins, sans-serif; font-size: 11px; font-weight: 500; }

@keyframes radar-abrir { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .radar-area { animation: none; } }
</style>
