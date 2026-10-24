<template>
  <section aria-label="Resumo" class="grid grid-cols-3 gap-2.5 sm:gap-4">
    <article
      v-for="item in itens"
      :key="item.chave"
      class="cartao-resumo"
      :class="`cartao-resumo--${item.chave}`"
      @pointerleave="apagar"
      @pointermove="seguir"
    >
      <span aria-hidden="true" class="cartao-resumo__mancha" />
      <span aria-hidden="true" class="cartao-resumo__brilho" />

      <template v-if="carregando">
        <span class="sk h-3.5 w-14 rounded-md sm:w-20" />
        <span class="sk mt-3 h-8 w-10 rounded-md" />
        <span class="sk mt-3 hidden h-3 w-24 rounded-md sm:block" />
      </template>

      <template v-else>
        <span aria-hidden="true" class="icone">
          <component :is="item.icone" :size="18" :stroke-width="1.8" />
        </span>

        <h3 class="text-[11px] font-normal text-text/70 sm:text-xs">
          <span class="sm:hidden">{{ item.curto }}</span>
          <span class="hidden sm:inline">{{ item.rotulo }}</span>
        </h3>

        <p :aria-label="erro ? 'indisponível' : undefined" class="numero">{{ erro ? '—' : exibido[item.chave] }}</p>
        <p class="hidden text-[11px] text-text/70 sm:block">{{ item.apoio }}</p>
      </template>
    </article>
  </section>
</template>

<script setup lang="ts">
  import type { PerfilResumo } from '@/interfaces/perfil'
  import { ClipboardList, ScanSearch, School } from '@lucide/vue'
  import { computed, onBeforeUnmount, reactive, watch } from 'vue'

  const props = defineProps<{ resumo: PerfilResumo | null, carregando?: boolean, erro?: boolean }>()

  const itens = [
    { chave: 'turmas', icone: School, rotulo: 'Turmas', curto: 'Turmas', apoio: 'ano letivo 2026' },
    { chave: 'atividades', icone: ClipboardList, rotulo: 'Atividades', curto: 'Atividades', apoio: 'criadas por você' },
    { chave: 'trabalhos_analisados', icone: ScanSearch, rotulo: 'Trabalhos analisados', curto: 'Analisados', apoio: 'enviados pelos alunos' },
  ] as const

  const exibido = reactive({ turmas: 0, atividades: 0, trabalhos_analisados: 0 })
  const alvo = computed(() => props.resumo)
  let quadro = 0

  // Os números sobem até o valor real uma única vez, quando o resumo chega.
  watch(alvo, resumo => {
    cancelAnimationFrame(quadro)
    if (!resumo) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(exibido, resumo)
      return
    }

    const inicio = performance.now()
    const duracao = 900
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - (1 - t) ** 4
      for (const { chave } of itens) {
        exibido[chave] = Math.round(resumo[chave] * suave)
      }
      if (t < 1) {
        quadro = requestAnimationFrame(passo)
      }
    }
    quadro = requestAnimationFrame(passo)
  }, { immediate: true })

  // O brilho acompanha o ponteiro dentro do cartão (só atualiza duas variáveis CSS).
  function seguir (event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement
    const caixa = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${event.clientX - caixa.left}px`)
    el.style.setProperty('--my', `${event.clientY - caixa.top}px`)
  }

  function apagar (event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
  }

  onBeforeUnmount(() => cancelAnimationFrame(quadro))
</script>

<style scoped>
.cartao-resumo {
  position: relative;
  isolation: isolate;
  padding: 14px 14px 16px;
  overflow: hidden;
  border: 1px solid rgb(169 199 180 / 0.6);
  border-radius: 20px;
  background: linear-gradient(160deg, #fff 55%, rgb(247 247 241 / 0.9));
  box-shadow:
    0 1px 2px rgb(38 61 53 / 0.05),
    0 10px 20px -10px rgb(53 107 91 / 0.22),
    0 24px 40px -24px rgb(53 107 91 / 0.28);
  transition:
    translate 380ms var(--ease-out-expo),
    box-shadow 380ms var(--ease-out-expo),
    border-color 260ms ease;
}

.cartao-resumo:hover {
  translate: 0 -3px;
  border-color: rgb(53 107 91 / 0.45);
  box-shadow:
    0 1px 2px rgb(38 61 53 / 0.06),
    0 14px 28px -10px rgb(53 107 91 / 0.3),
    0 0 0 4px rgb(169 199 180 / 0.22),
    0 30px 48px -22px rgb(53 107 91 / 0.38);
}

/* Mancha orgânica no canto, uma cor da marca por cartão. */
.cartao-resumo__mancha {
  position: absolute;
  z-index: -2;
  right: -34px;
  bottom: -44px;
  width: 120px;
  height: 120px;
  border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%;
  background: rgb(169 199 180 / 0.32);
  transition: scale 600ms var(--ease-out-expo);
}

.cartao-resumo--atividades .cartao-resumo__mancha {
  border-radius: 58% 42% 44% 56% / 46% 58% 42% 54%;
  background: rgb(227 180 119 / 0.28);
}

.cartao-resumo--trabalhos_analisados .cartao-resumo__mancha {
  background: rgb(53 107 91 / 0.16);
}

.cartao-resumo:hover .cartao-resumo__mancha {
  scale: 1.18;
}

/* Brilho verde que segue o ponteiro. */
.cartao-resumo__brilho {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 0%), rgb(169 199 180 / 0.5), transparent 70%);
  opacity: 0;
  transition: opacity 300ms ease;
}

.cartao-resumo:hover .cartao-resumo__brilho {
  opacity: 1;
}

.icone {
  display: none;
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 12px;
  background: rgb(169 199 180 / 0.3);
  color: var(--color-primary);
  transition:
    background-color 260ms ease,
    color 260ms ease,
    rotate 420ms var(--ease-out-expo);
}

.cartao-resumo:hover .icone {
  rotate: -8deg;
  background: var(--color-primary);
  color: var(--color-background);
}

.numero {
  margin: 2px 0 4px;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

@media (min-width: 640px) {
  .cartao-resumo {
    padding: 18px 22px 20px;
  }

  .icone {
    display: grid;
    top: 16px;
    right: 16px;
  }

  .numero {
    margin: 6px 0;
    font-size: 34px;
  }
}

.sk {
  display: block;
  background: linear-gradient(100deg, rgb(169 199 180 / 0.2) 30%, rgb(169 199 180 / 0.42) 50%, rgb(169 199 180 / 0.2) 70%);
  background-size: 250% 100%;
  animation: sk 1.5s linear infinite;
}

@keyframes sk {
  to {
    background-position: -150% 0;
  }
}
</style>
