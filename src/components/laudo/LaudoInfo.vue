<script setup lang="ts">
  import type { Component } from 'vue'

  // Caixa informativa do fluxo: ícone e texto. `neutro` (bege, ícone num círculo branco),
  // `plano` (igual, sem fundo, para itens dentro de outra caixa), `destaque` (verde, para
  // confirmações) e `aviso` (para alertas).
  withDefaults(defineProps<{
    icone: Component
    tom?: 'neutro' | 'plano' | 'destaque' | 'aviso'
  }>(), { tom: 'neutro' })
</script>

<template>
  <div class="laudo-info" :class="`laudo-info--${tom}`">
    <span aria-hidden="true" class="laudo-info__icone">
      <component :is="icone" :size="16" />
    </span>

    <span class="laudo-info__texto"><slot /></span>
  </div>
</template>

<style scoped>
.laudo-info {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--apoio-caixa);
  color: var(--apoio-texto);
  font-size: 0.875rem;
  line-height: 1.45;
  text-align: left;
}

.laudo-info__icone {
  display: grid;
  width: 32px;
  height: 32px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #fff;
}

.laudo-info__texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

.laudo-info--plano {
  padding: 0;
  background: none;
}

.laudo-info--destaque,
.laudo-info--aviso {
  padding-block: 12px;
}

.laudo-info--destaque {
  background: var(--apoio-menta);
}

.laudo-info--aviso {
  background: #fbf3e6;
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.laudo-info--destaque .laudo-info__icone,
.laudo-info--aviso .laudo-info__icone {
  width: auto;
  height: auto;
  background: none;
}
</style>
