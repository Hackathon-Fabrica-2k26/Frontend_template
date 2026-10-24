<template>
  <div
    ref="item"
    class="turma-item"
    :class="{ 'turma-item--ativo': ativo }"
    v-on="handlers"
    @pointermove="seguirMouse"
  >
    <!-- Glow quente que respira atrás do card -->
    <span aria-hidden="true" class="turma-item__brilho" />

    <!-- Canguru espiando: cabeça atrás do card, patas e braço na frente -->
    <MascotePeek :ativo="ativo" class="turma-item__mascote turma-item__mascote--tras" parte="tras" />

    <v-card class="turma-card" variant="outlined">
      <!-- Luz que acompanha o ponteiro dentro do card -->
      <span aria-hidden="true" class="turma-card__luz" />

      <!-- Canto decorativo com o ícone da turma -->
      <div aria-hidden="true" class="turma-card__canto">
        <TurmaIcone class="turma-card__icone" :tipo="icone" />
        <span class="turma-card__ponto" />
      </div>

      <h2 class="turma-card__nome">{{ nome }}</h2>

      <div class="turma-card__rodape">
        <dl class="turma-card__dados">
          <div>
            <dt>Turno</dt>
            <dd>{{ turno }}</dd>
          </div>

          <div>
            <dt>Estudantes</dt>
            <dd>{{ estudantes }}</dd>
          </div>
        </dl>

        <v-btn class="turma-card__acessar" :to="to" variant="flat">
          Acessar turma
          <ArrowRight class="turma-card__seta ml-2" :size="14" />
        </v-btn>
      </div>
    </v-card>

    <MascotePeek :ativo="ativo" class="turma-item__mascote turma-item__mascote--frente" parte="frente" />
  </div>
</template>

<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useMascoteAtivo } from '@/composables/useMascoteAtivo'

  const props = withDefaults(defineProps<{
    nome: string
    turno: string
    estudantes: number | string
    to: string
    icone?: 'lapis' | 'caderno' | 'carteira'
    // Faz o canguru subir e acenar sozinho uma vez, logo depois da entrada da página.
    saudar?: boolean
  }>(), { icone: 'lapis', saudar: false })

  const item = ref<HTMLElement | null>(null)
  const { ativo, acenar, handlers } = useMascoteAtivo()

  let inicio: number | undefined

  onMounted(() => {
    if (!props.saudar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    inicio = window.setTimeout(() => acenar(3300), 1500)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(inicio)
    cancelAnimationFrame(quadro)
  })

  let quadro = 0

  // Um ajuste por quadro: evita repintar a luz a cada evento de ponteiro.
  function seguirMouse (event: PointerEvent) {
    const { clientX, clientY } = event
    if (quadro) {
      return
    }
    quadro = requestAnimationFrame(() => {
      quadro = 0
      const el = item.value
      if (!el) {
        return
      }
      const box = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${clientX - box.left}px`)
      el.style.setProperty('--my', `${clientY - box.top}px`)
    })
  }
</script>

<style scoped>
.turma-item {
  --ease: var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));

  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  width: 100%;
  max-width: 540px;
  margin-inline: auto;
  transition: transform 0.35s var(--ease);
  will-change: transform;
}

.turma-item--ativo {
  transform: scale(1.03);
}

/* Glow: sombra verde suave e deslocada para baixo, sem blur animado (só opacidade, que roda
   na GPU). Fica abaixo do card, então não tinge os olhos vazados do mascote. */
.turma-item__brilho {
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: 12px;
  box-shadow:
    0 14px 26px -12px rgb(53 107 91 / 0.32),
    0 4px 10px -4px rgb(53 107 91 / 0.18);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s var(--ease);
}

.turma-item--ativo .turma-item__brilho {
  opacity: 1;
}

/* Posição do mascote: a cabeça termina ~11px abaixo da borda superior do card, onde as patas
   se apoiam (0,0864 da largura da ilustração). */
.turma-item__mascote {
  position: absolute;
  bottom: calc(100% - 11.4px);
  left: 26px;
  width: 128px;
  height: auto;
  pointer-events: none;
}

.turma-item__mascote--tras {
  z-index: 1;
}

.turma-item__mascote--frente {
  z-index: 3;
}

.turma-card {
  position: relative;
  z-index: 2;
  overflow: hidden;
  width: 100%;
  padding: 26px 36px 22px;
  background: #fdfdfb;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  color: var(--color-text);
  transition: border-color 0.3s var(--ease), box-shadow 0.3s var(--ease);
}

.turma-item--ativo .turma-card {
  border-color: rgb(53 107 91 / 0.65);
  box-shadow: 0 0 0 3px rgb(169 199 180 / 0.4);
}

.turma-card__luz {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    240px circle at var(--mx, 50%) var(--my, 0%),
    rgb(169 199 180 / 0.32),
    transparent 70%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s var(--ease);
}

.turma-item--ativo .turma-card__luz {
  opacity: 1;
}

.turma-card__canto {
  position: absolute;
  top: -6px;
  right: -6px;
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  background: #e1eae0;
  border-radius: 50%;
  border-radius: px 0px 50% 50%;
}

.turma-card__icone {
  width: 60px;
  height: 60px;
  margin: 14px 0 0 -2px;
  transition: transform 0.5s cubic-bezier(0.34, 1.45, 0.64, 1);
}

.turma-item--ativo .turma-card__icone {
  transform: rotate(-8deg) scale(1.1);
}

.turma-card__ponto {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 14px;
  height: 14px;
  background: #deae72;
  border-radius: 50%;
}

.turma-item--ativo .turma-card__ponto {
  animation: ponto-pulsa 1.2s ease-in-out infinite;
}

@keyframes ponto-pulsa {
  50% {
    transform: scale(1.3);
  }
}

.turma-card__nome {
  padding-bottom: 38px;
  border-bottom: 1px solid #e6e9e3;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.3;
}

.turma-card__rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 26px;
}

.turma-card__dados {
  display: flex;
  margin: 0;
  gap: 44px;
}

.turma-card__dados dt {
  font-size: 0.8125rem;
  color: var(--color-primary);
  line-height: 1.4;
}

.turma-card__dados dd {
  margin: 2px 0 0;
  font-size: 1rem;
  font-weight: 500;
}

.turma-card__acessar {
  min-width: 210px;
  height: 46px;
  background: #e6eee6;
  border-radius: 8px;
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background-color 0.2s var(--ease), color 0.2s var(--ease);
}

.turma-card__acessar:hover {
  background: #d8e5da;
}

.turma-item--ativo .turma-card__acessar {
  background: var(--color-primary);
  color: var(--color-background);
}

.turma-card__seta {
  transition: transform 0.3s var(--ease);
}

.turma-item--ativo .turma-card__seta {
  transform: translateX(4px);
}

@media (max-width: 480px) {
  .turma-card__rodape {
    flex-direction: column;
    align-items: stretch;
  }

  .turma-card__acessar {
    width: 100%;
  }
}
</style>
