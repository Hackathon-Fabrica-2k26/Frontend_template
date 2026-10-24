<script setup lang="ts">
  // Botão do rodapé do fluxo do responsável: verde do fluxo, alvo de toque de 48px e
  // hover/pressionado sutis. O resto (disabled, loading, @click) vai direto para o v-btn.
  defineProps<{ principal?: boolean }>()
</script>

<template>
  <v-btn
    class="laudo-botao"
    :class="{ 'laudo-botao--principal': principal }"
    color="#2f4f45"
    :variant="principal ? 'flat' : 'outlined'"
  >
    <slot />
  </v-btn>
</template>

<style scoped>
.laudo-botao {
  width: 100%;
  height: 48px !important;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0;
  text-transform: none;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    translate 180ms ease,
    scale 120ms ease;
}

.laudo-botao:not(.v-btn--disabled):hover {
  box-shadow: 0 6px 14px rgb(47 79 69 / 0.16);
  translate: 0 -1px;
}

.laudo-botao:not(.v-btn--disabled):active {
  box-shadow: none;
  scale: 0.98;
  translate: none;
}

.laudo-botao:focus-visible {
  outline: 2px solid var(--apoio-verde, #2f4f45);
  outline-offset: 3px;
}

.laudo-botao.v-btn--disabled {
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .laudo-botao {
    transition: background-color 120ms ease;
  }

  .laudo-botao:not(.v-btn--disabled):hover,
  .laudo-botao:not(.v-btn--disabled):active {
    scale: none;
    translate: none;
  }
}
</style>
