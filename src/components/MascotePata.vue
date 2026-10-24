<template>
  <!-- Pata apoiada na borda: palma orgânica + 3 dedos caídos, com contorno na cor de fundo.
       Use dentro de um <svg> com o sistema de coordenadas do símbolo. -->
  <g :transform="`translate(${x} ${y}) scale(1.25)`">
    <template v-for="dx in [-34, 0, 34]" :key="dx">
      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        :x1="dx"
        :x2="dx"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        :x1="dx"
        :x2="dx"
        y1="0"
        y2="46"
      />
    </template>

    <path
      d="M -72 6 C -72 -30 -40 -44 0 -44 C 40 -44 72 -30 72 6 C 72 30 40 36 0 36 C -40 36 -72 30 -72 6 Z"
      fill="#356B5B"
      stroke="#F7F7F1"
      stroke-width="9"
    />
  </g>
</template>

<script setup lang="ts">
  defineProps<{ x: number, y: number }>()
</script>
