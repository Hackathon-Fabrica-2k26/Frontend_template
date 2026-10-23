<template>
  <div
    class="aviso"
    :class="[`aviso--${notice.type}`, { 'aviso--pausado': pausado }]"
    :role="notice.type === 'error' ? 'alert' : 'status'"
    @focusin="pausar"
    @focusout="retomar"
    @pointerenter="pausar"
    @pointerleave="retomar"
  >
    <!-- Canguru espiando: só em sucesso, no aviso mais recente -->
    <template v-if="mascote">
      <MascotePeek :ativo="espiando" class="aviso__mascote aviso__mascote--tras" parte="tras" />
    </template>

    <div class="aviso__cartao">
      <span aria-hidden="true" class="aviso__icone">
        <CircleCheck v-if="notice.type === 'success'" :size="20" />
        <CircleAlert v-else-if="notice.type === 'error'" :size="20" />
        <Info v-else :size="20" />
      </span>

      <div class="aviso__texto">
        <strong class="aviso__titulo">{{ titulo }}</strong>
        <p class="aviso__mensagem">{{ notice.message }}</p>
      </div>

      <button aria-label="Fechar aviso" class="aviso__fechar" type="button" @click="emit('fechar')">
        <X :size="16" />
      </button>

      <span
        aria-hidden="true"
        class="aviso__barra"
        :style="{ animationDuration: `${notice.duration}ms` }"
      />
    </div>

    <MascotePeek
      v-if="mascote"
      :ativo="espiando"
      class="aviso__mascote aviso__mascote--frente"
      parte="frente"
    />
  </div>
</template>

<script setup lang="ts">
  import type { Notice } from '@/utils/notify'
  import { CircleAlert, CircleCheck, Info, X } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  const props = defineProps<{
    notice: Notice
    // Mostra o canguru espiando (sucesso do aviso mais recente).
    mascote?: boolean
  }>()

  const emit = defineEmits<{ fechar: [] }>()

  const titulo = computed(() => ({
    success: 'Tudo certo',
    error: 'Algo deu errado',
    info: 'Aviso',
  })[props.notice.type])

  const pausado = ref(false)
  const espiando = ref(false)

  // Tempo restante com pausa no hover/foco: ler com calma não faz o aviso sumir.
  let restante = props.notice.duration
  let inicio = 0
  let fim: number | undefined
  let subir: number | undefined

  function iniciar () {
    inicio = Date.now()
    fim = window.setTimeout(() => emit('fechar'), restante)
  }

  function pausar () {
    if (pausado.value) {
      return
    }
    pausado.value = true
    window.clearTimeout(fim)
    restante -= Date.now() - inicio
  }

  function retomar () {
    if (!pausado.value) {
      return
    }
    pausado.value = false
    iniciar()
  }

  onMounted(() => {
    iniciar()
    // O canguru sobe depois que o aviso termina de entrar.
    subir = window.setTimeout(() => (espiando.value = true), 380)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(fim)
    window.clearTimeout(subir)
  })
</script>

<style scoped>
.aviso {
  --ease: var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
  --mp-escala: 0.6875; /* canguru de 88px: proporcional ao de 128px dos cards */

  position: relative;
  isolation: isolate;
  pointer-events: auto;
}

.aviso__cartao {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow: hidden;
  padding: 14px 14px 18px 16px;
  background: #fdfdfb;
  border: 1px solid var(--color-support);
  border-radius: 14px;
  box-shadow:
    0 16px 30px -16px rgb(38 61 53 / 0.38),
    0 4px 10px -4px rgb(38 61 53 / 0.14);
  color: var(--color-text);
}

.aviso__icone {
  display: grid;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  place-items: center;
  background: #e1eae0;
  border-radius: 50%;
  color: var(--color-primary);
}

.aviso--error .aviso__icone {
  background: #f6e4e2;
  color: #b3261e;
}

.aviso__texto {
  min-width: 0;
  flex: 1;
  padding-top: 1px;
}

.aviso__titulo {
  display: block;
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.3;
}

.aviso--error .aviso__titulo {
  color: #b3261e;
}

.aviso__mensagem {
  margin-top: 2px;
  font-size: 0.9375rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.aviso__fechar {
  display: grid;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  place-items: center;
  margin: -2px -2px 0 0;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #7c9a8e;
  cursor: pointer;
  transition: background-color 0.2s var(--ease), color 0.2s var(--ease);
}

.aviso__fechar:hover {
  background: #e6eee6;
  color: var(--color-primary);
}

.aviso__fechar:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Barra de tempo: esvazia até o aviso fechar e congela quando a pessoa está lendo. */
.aviso__barra {
  position: absolute;
  right: 16px;
  bottom: 7px;
  left: 16px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 999px;
  opacity: 0.45;
  transform-origin: left center;
  animation: aviso-barra linear forwards;
}

.aviso--error .aviso__barra {
  background: #b3261e;
}

.aviso--pausado .aviso__barra {
  animation-play-state: paused;
}

@keyframes aviso-barra {
  to {
    transform: scaleX(0);
  }
}

.aviso__mascote {
  position: absolute;
  right: 26px;
  bottom: calc(100% - 7.8px);
  width: 88px;
  height: auto;
  pointer-events: none;
}

.aviso__mascote--tras {
  z-index: 1;
}

.aviso__mascote--frente {
  z-index: 3;
}

/* Erro: depois de entrar, o aviso treme uma vez (mesma linguagem do login). */
.aviso--error {
  animation: aviso-treme 480ms cubic-bezier(0.36, 0.07, 0.19, 0.97) 420ms;
}

@keyframes aviso-treme {
  20%, 60% {
    translate: -7px 0;
  }

  40%, 80% {
    translate: 6px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aviso__barra {
    display: none;
  }
}
</style>
