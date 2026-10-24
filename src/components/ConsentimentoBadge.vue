<template>
  <button
    :aria-label="`Status LGPD: ${textoStatus}. Clique para ver o termo.`"
    class="consentimento-badge"
    :class="`consentimento-badge--${status}`"
    type="button"
    @click.stop="$emit('click')"
  >
    <component
      :is="iconeStatus"
      class="badge-icone"
      :size="14"
    />

    <span class="badge-texto">{{ textoStatus }}</span>
  </button>
</template>

<script setup lang="ts">
  import type { StatusConsentimento } from '@/interfaces/consentimento'
  import { ShieldAlert, ShieldCheck, ShieldX } from '@lucide/vue'
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      status: StatusConsentimento
      compacto?: boolean
    }>(),
    {
      compacto: false,
    },
  )

  defineEmits<{
    (e: 'click'): void
  }>()

  const iconeStatus = computed(() => {
    switch (props.status) {
      case 'ativo': {
        return ShieldCheck
      }
      case 'revogado': {
        return ShieldX
      }
      default: {
        return ShieldAlert
      }
    }
  })

  const textoStatus = computed(() => {
    if (props.compacto) {
      switch (props.status) {
        case 'ativo': {
          return 'Autorizado'
        }
        case 'revogado': {
          return 'Revogado'
        }
        default: {
          return 'Pendente'
        }
      }
    }

    switch (props.status) {
      case 'ativo': {
        return 'LGPD: Autorizado'
      }
      case 'revogado': {
        return 'LGPD: Revogado'
      }
      default: {
        return 'LGPD: Pendente'
      }
    }
  })
</script>

<style scoped>
.consentimento-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
}

.consentimento-badge:hover {
  transform: translateY(-1px);
}

.consentimento-badge:focus-visible {
  outline: 2px solid #356b5b;
  outline-offset: 2px;
}

.badge-icone {
  flex-shrink: 0;
}

/* Status: Ativo (Verde Marsupi) */
.consentimento-badge--ativo {
  background-color: #e8f3ee;
  color: #245647;
  border-color: #a9c7b4;
}

.consentimento-badge--ativo:hover {
  background-color: #dceee5;
}

/* Status: Pendente (Âmbar suave) */
.consentimento-badge--pendente {
  background-color: #fef8ee;
  color: #8c5d18;
  border-color: #e3b477;
}

.consentimento-badge--pendente:hover {
  background-color: #fdf2df;
}

/* Status: Revogado (Cinza/Avermelhado neutro) */
.consentimento-badge--revogado {
  background-color: #f7eded;
  color: #8a3434;
  border-color: #dfbaba;
}

.consentimento-badge--revogado:hover {
  background-color: #f4e2e2;
}
</style>
