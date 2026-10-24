<script setup lang="ts">
  // Mostra/esconde um bloco com fade e expansão suave de altura, sem empurrar o resto do
  // cartão de uma vez. Dentro do corpo do cartão (gap de 12px), o espaço também abre aos poucos.
  defineProps<{ aberto: boolean }>()
</script>

<template>
  <Transition name="laudo-expandir">
    <div v-if="aberto" class="laudo-expandir">
      <div class="laudo-expandir__dentro">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.laudo-expandir {
  display: grid;
  width: 100%;
  grid-template-rows: 1fr;
  /* Desconta o gap do pai; o espaço volta como padding e anima junto com a altura. */
  margin-top: calc(var(--apoio-gap, 12px) * -1);
}

.laudo-expandir__dentro {
  min-height: 0;
  padding-top: var(--apoio-gap, 12px);
}

.laudo-expandir-enter-active,
.laudo-expandir-leave-active {
  overflow: hidden;
  transition: grid-template-rows 240ms var(--apoio-ease), opacity 200ms ease;
}

.laudo-expandir-enter-from,
.laudo-expandir-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .laudo-expandir-enter-active,
  .laudo-expandir-leave-active {
    transition: opacity 100ms ease;
  }

  .laudo-expandir-enter-from,
  .laudo-expandir-leave-to {
    grid-template-rows: 1fr;
  }
}
</style>
