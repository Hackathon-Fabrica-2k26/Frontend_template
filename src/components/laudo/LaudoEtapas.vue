<script setup lang="ts">
  import type { Component } from 'vue'
  import { Check, ClipboardCheck, ShieldCheck, Upload } from '@lucide/vue'
  import { computed } from 'vue'

  // `concluido` marca as três etapas como feitas (tela final).
  export type EtapaLaudo = 'consentimento' | 'enviar' | 'conferir' | 'concluido'

  const props = defineProps<{ atual: EtapaLaudo }>()

  const etapas: { id: Exclude<EtapaLaudo, 'concluido'>, rotulo: string, icone: Component }[] = [
    { id: 'consentimento', rotulo: 'Consentimento', icone: ShieldCheck },
    { id: 'enviar', rotulo: 'Enviar', icone: Upload },
    { id: 'conferir', rotulo: 'Conferir', icone: ClipboardCheck },
  ]

  const indiceAtual = computed(() => props.atual === 'concluido'
    ? etapas.length
    : etapas.findIndex(e => e.id === props.atual))

  // Cada tela monta as etapas de novo: a que acabou de ser feita ganha o "pop" do check, e a
  // linha que chega na etapa atual se preenche.
  function classes (i: number) {
    return {
      'etapa--ativa': i === indiceAtual.value,
      'etapa--feita': i < indiceAtual.value,
      'etapa--recente': i === indiceAtual.value - 1,
      'etapa--alcancada': i <= indiceAtual.value,
    }
  }
</script>

<template>
  <ol aria-label="Etapas do envio do laudo" class="etapas">
    <li
      v-for="(etapa, i) in etapas"
      :key="etapa.id"
      :aria-current="i === indiceAtual ? 'step' : undefined"
      class="etapa"
      :class="classes(i)"
    >
      <span aria-hidden="true" class="etapa__icone">
        <component :is="i < indiceAtual ? Check : etapa.icone" :size="16" />
      </span>

      <span class="etapa__rotulo">
        {{ etapa.rotulo }}<span v-if="i < indiceAtual" class="sr-only"> (concluída)</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.etapas {
  --circulo: clamp(28px, 6vw, 32px);

  display: grid;
  width: min(100%, 420px);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.etapa {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* Linha entre uma etapa e a anterior: trilho (::before) e preenchimento (::after). */
.etapa + .etapa::before,
.etapa + .etapa::after {
  content: '';
  position: absolute;
  top: calc(var(--circulo) / 2 - 1px);
  right: calc(50% + var(--circulo) / 2 + 6px);
  left: calc(-50% + var(--circulo) / 2 + 6px);
  height: 2px;
  border-radius: 2px;
  background: var(--apoio-borda);
}

.etapa + .etapa::after {
  background: var(--apoio-verde);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 350ms var(--apoio-ease);
}

.etapa + .etapa--alcancada::after {
  transform: scaleX(1);
}

/* A linha que chega na etapa atual se preenche ao abrir a tela. */
.etapa--ativa::after {
  animation: preenche 350ms var(--apoio-ease) 120ms backwards;
}

@keyframes preenche {
  from {
    transform: scaleX(0);
  }
}

.etapa__icone {
  display: grid;
  width: var(--circulo);
  height: var(--circulo);
  place-items: center;
  border-radius: 50%;
  background: #eef2ec;
  color: var(--apoio-texto-sec);
  transition: background-color 200ms ease, color 200ms ease;
}

.etapa--ativa .etapa__icone,
.etapa--feita .etapa__icone {
  background: var(--apoio-verde);
  color: #fff;
}

.etapa--recente .etapa__icone {
  animation: pop 320ms var(--apoio-ease) 200ms backwards;
}

@keyframes pop {
  0% {
    scale: 0.6;
  }

  60% {
    scale: 1.12;
  }

  100% {
    scale: 1;
  }
}

.etapa__rotulo {
  max-width: 100%;
  color: var(--apoio-texto-sec);
  font-size: 0.75rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.etapa--ativa .etapa__rotulo {
  color: var(--apoio-texto);
  font-weight: var(--font-weight-semibold);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Telas muito estreitas: só o rótulo da etapa atual fica visível (os outros seguem para o
   leitor de tela). */
@media (max-width: 359px) {
  .etapa:not(.etapa--ativa) .etapa__rotulo {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .etapa + .etapa::after,
  .etapa__icone {
    transition: none;
  }

  .etapa--ativa::after,
  .etapa--recente .etapa__icone {
    animation: none;
  }
}
</style>
