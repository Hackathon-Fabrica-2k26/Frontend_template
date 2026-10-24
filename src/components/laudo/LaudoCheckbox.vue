<script setup lang="ts">
  import { Check } from '@lucide/vue'

  // Checkbox do fluxo: input nativo (teclado e leitor de tela) com a caixa desenhada aqui, para
  // a marca animar. Atributos como aria-required vão para o input.
  defineOptions({ inheritAttrs: false })

  const marcado = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="laudo-checkbox">
    <input v-model="marcado" class="laudo-checkbox__input" type="checkbox" v-bind="$attrs">

    <span aria-hidden="true" class="laudo-checkbox__caixa">
      <Check :size="14" :stroke-width="3" />
    </span>

    <span class="laudo-checkbox__texto"><slot /></span>
  </label>
</template>

<style scoped>
.laudo-checkbox {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  gap: 12px;
  color: var(--apoio-texto);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
}

.laudo-checkbox__input {
  position: absolute;
  width: 20px;
  height: 20px;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.laudo-checkbox__caixa {
  display: grid;
  width: 20px;
  height: 20px;
  flex: none;
  place-items: center;
  border: 1.5px solid var(--apoio-verde);
  border-radius: var(--radius-checkbox);
  background: #fff;
  color: #fff;
  transition: background-color 150ms ease;
}

.laudo-checkbox__caixa svg {
  scale: 0;
  transition: scale 180ms var(--apoio-ease);
}

.laudo-checkbox__input:checked + .laudo-checkbox__caixa {
  background: var(--apoio-verde);
}

.laudo-checkbox__input:checked + .laudo-checkbox__caixa svg {
  scale: 1;
}

.laudo-checkbox__input:focus-visible + .laudo-checkbox__caixa {
  outline: 2px solid var(--apoio-verde);
  outline-offset: 3px;
}

.laudo-checkbox__texto {
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {
  .laudo-checkbox__caixa,
  .laudo-checkbox__caixa svg {
    transition: none;
  }
}
</style>
