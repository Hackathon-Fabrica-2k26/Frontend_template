<template>
  <div
    class="mascote-card"
    :class="`mascote-card--${lado}`"
    v-on="handlers"
  >
    <!-- Cabeça atrás do conteúdo, patas e braço na frente (ver MascotePeek) -->
    <MascotePeek :ativo="ativo" class="mascote-card__mascote mascote-card__mascote--tras" parte="tras" />

    <div class="mascote-card__corpo">
      <slot />
    </div>

    <MascotePeek :ativo="ativo" class="mascote-card__mascote mascote-card__mascote--frente" parte="frente" />
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import { useMascoteAtivo } from '@/composables/useMascoteAtivo'

  const props = withDefaults(defineProps<{
    // Sobe e acena sozinho uma vez, logo depois de a tela abrir.
    saudar?: boolean
    // A cada tantos ms o canguru espia de novo (0 desliga). Só roda com a aba visível.
    intervalo?: number
    lado?: 'esq' | 'dir'
  }>(), { saudar: false, intervalo: 0, lado: 'esq' })

  const { ativo, hover, acenar, handlers } = useMascoteAtivo()

  defineExpose({ acenar })

  let ciclo: number | undefined
  let inicio: number | undefined

  onMounted(() => {
    // Movimento reduzido: nada de aparições automáticas; hover e foco continuam valendo.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    if (props.saudar) {
      inicio = window.setTimeout(() => acenar(3300), 1500)
    }
    if (props.intervalo > 0) {
      ciclo = window.setInterval(() => {
        if (!document.hidden && !hover.value) {
          acenar(2600)
        }
      }, props.intervalo)
    }
  })

  onBeforeUnmount(() => {
    window.clearTimeout(inicio)
    window.clearInterval(ciclo)
  })
</script>

<style scoped>
.mascote-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
}

.mascote-card__corpo {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.mascote-card__corpo > :slotted(*) {
  flex: 1;
}

/* Mesma geometria do TurmaCard: a cabeça termina ~11px abaixo da borda do conteúdo,
   onde as patas se apoiam. */
.mascote-card__mascote {
  position: absolute;
  bottom: calc(100% - 11.4px);
  width: 128px;
  height: auto;
  pointer-events: none;
}

.mascote-card--esq .mascote-card__mascote {
  left: 26px;
}

.mascote-card--dir .mascote-card__mascote {
  right: 48px;
}

.mascote-card__mascote--tras {
  z-index: 1;
}

.mascote-card__mascote--frente {
  z-index: 3;
}
</style>
