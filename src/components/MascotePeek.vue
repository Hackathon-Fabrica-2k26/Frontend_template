<template>
  <!-- Parte de trás: só a cabeça. Fica atrás do card, que cobre o resto do corpo. -->
  <svg
    v-if="parte === 'tras'"
    aria-hidden="true"
    class="mascote mascote--tras"
    :class="{ 'mascote--ativo': ativo }"
    focusable="false"
    viewBox="230 105 1100 745"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="mascote-corte"><rect height="762" width="1263" x="0" y="0" /></clipPath>
    </defs>

    <g clip-path="url(#mascote-corte)">
      <g>
        <path :d="SIMBOLO" fill="#356B5B" fill-rule="evenodd" />
      </g>
    </g>
  </svg>

  <!-- Parte da frente: patas apoiadas na borda do card e o braço que acena. -->
  <svg
    v-else
    aria-hidden="true"
    class="mascote mascote--frente"
    :class="{ 'mascote--ativo': ativo }"
    focusable="false"
    viewBox="230 105 1100 745"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="mascote__pata mascote__pata--esq" transform="translate(330 756) scale(1.25)">
      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="-34"
        x2="-34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="-34"
        x2="-34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="0"
        x2="0"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="0"
        x2="0"
        y1="0"
        y2="46"
      />

      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="34"
        x2="34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="34"
        x2="34"
        y1="0"
        y2="46"
      />

      <path d="M -72 6 C -72 -30 -40 -44 0 -44 C 40 -44 72 -30 72 6 C 72 30 40 36 0 36 C -40 36 -72 30 -72 6 Z" fill="#356B5B" stroke="#F7F7F1" stroke-width="9" />
    </g>

    <g class="mascote__pata mascote__pata--dir" transform="translate(800 756) scale(1.25)">
      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="-34"
        x2="-34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="-34"
        x2="-34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="0"
        x2="0"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="0"
        x2="0"
        y1="0"
        y2="46"
      />

      <line
        stroke="#F7F7F1"
        stroke-linecap="round"
        stroke-width="42"
        x1="34"
        x2="34"
        y1="0"
        y2="46"
      />

      <line
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="30"
        x1="34"
        x2="34"
        y1="0"
        y2="46"
      />

      <path d="M -72 6 C -72 -30 -40 -44 0 -44 C 40 -44 72 -30 72 6 C 72 30 40 36 0 36 C -40 36 -72 30 -72 6 Z" fill="#356B5B" stroke="#F7F7F1" stroke-width="9" />
    </g>

    <!-- Braço: nasce na base (1010, 782) do peek-aceno. -->
    <g transform="translate(1010 782)">
      <g class="mascote__braco-entra">
        <g class="mascote__braco-acena">
          <path
            d="M 0 0 C 80 -90 120 -230 80 -360"
            fill="none"
            stroke="#F7F7F1"
            stroke-linecap="round"
            stroke-width="112"
          />

          <path
            d="M 0 0 C 80 -90 120 -230 80 -360"
            fill="none"
            stroke="#356B5B"
            stroke-linecap="round"
            stroke-width="86"
          />

          <circle
            cx="80"
            cy="-370"
            fill="#356B5B"
            r="64"
            stroke="#F7F7F1"
            stroke-width="12"
          />

          <path
            class="mascote__ondas"
            d="M 176 -450 C 216 -400 216 -340 176 -290 M 216 -490 C 280 -420 280 -320 216 -250"
            fill="none"
            stroke="#A9C7B4"
            stroke-linecap="round"
            stroke-width="14"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { SIMBOLO } from '@/assets/mascote-simbolo'

  // Mascote Marsupi espiando o card (peek-duas-patas + braço do peek-aceno).
  // Use duas vezes no mesmo pai: parte="tras" abaixo do card e parte="frente" acima dele.
  withDefaults(defineProps<{
    parte: 'tras' | 'frente'
    ativo?: boolean
  }>(), { ativo: false })
</script>

<style scoped>
.mascote {
  overflow: visible;
}

/* Cabeça: só as pontas das orelhas aparecem em repouso; sobe com leve sobressalto. */
.mascote--tras {
  /* --mp-escala: proporção do tamanho de referência (128px de largura). */
  transform: translateY(calc(53px * var(--mp-escala, 1)));
  transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
  will-change: transform;
}

.mascote--tras.mascote--ativo {
  transform: translateY(calc(8px * var(--mp-escala, 1)));
}

/* Patas: aparecem depois que a cabeça já subiu, como quem se apoia na borda. */
.mascote--frente .mascote__pata {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mascote--frente.mascote--ativo .mascote__pata--esq {
  opacity: 1;
  transition: opacity 0.2s ease 0.15s;
}

/* A pata direita dá lugar ao braço que acena. */
.mascote__braco-entra {
  opacity: 0;
  transform: rotate(35deg) scale(0.4);
  transition: transform 0.4s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.2s ease;
}

.mascote--frente.mascote--ativo .mascote__braco-entra {
  opacity: 1;
  transform: none;
  transition-delay: 0.2s;
}

.mascote--frente {
  will-change: transform;
}

.mascote__braco-acena {
  transform-origin: 0 0;
}

.mascote--frente.mascote--ativo .mascote__braco-acena {
  animation: mascote-acena 0.45s ease-in-out 0.5s infinite alternate;
}

.mascote__ondas {
  opacity: 0.35;
}

.mascote--frente.mascote--ativo .mascote__ondas {
  animation: mascote-ondas 0.45s ease-in-out 0.5s infinite alternate;
}

@keyframes mascote-acena {
  from {
    transform: rotate(-9deg);
  }

  to {
    transform: rotate(13deg);
  }
}

@keyframes mascote-ondas {
  to {
    opacity: 1;
  }
}
</style>
