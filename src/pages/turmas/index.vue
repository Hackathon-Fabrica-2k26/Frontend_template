<template>
  <div class="relative isolate h-[calc(100dvh-158px)]">
    <TurmasFundo />

    <div class="relative z-[1] flex h-full flex-col px-2 pt-10 pb-4 sm:px-6">
      <div class="relative left-1/2 grid w-screen -translate-x-1/2 items-center gap-4 px-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:px-28">
        <p class="entrada text-3xl leading-tight font-normal text-text">
          Bem-vinda, <strong class="font-semibold">{{ nome }}</strong>!
        </p>

        <h1 class="entrada text-2xl font-semibold text-text [animation-delay:80ms] lg:text-center">Minhas turmas</h1>

        <div class="entrada [animation-delay:160ms] lg:justify-self-end">
          <v-btn
            class="nova-turma"
            color="primary"
            to="/turmas/nova"
            variant="outlined"
          >
            <Plus class="mr-2" :size="16" />
            Nova turma
          </v-btn>
        </div>
      </div>

      <!-- Estado de carregamento -->
      <div v-if="carregando && turmas.length === 0" class="flex flex-1 items-center justify-center">
        <MarsupiLoading label="Carregando turmas..." />
      </div>

      <!-- Estado vazio -->
      <div
        v-else-if="turmas.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 text-center px-4"
      >
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-support)]/30 text-[var(--color-primary)]">
          <GraduationCap :size="36" />
        </div>

        <h2 class="text-xl font-semibold text-text">Nenhuma turma cadastrada</h2>

        <p class="max-w-md text-sm text-text/80">
          Você ainda não possui turmas vinculadas. Crie sua primeira turma para começar a gerenciar seus estudantes.
        </p>

        <v-btn
          class="nova-turma nova-turma--cheia mt-2"
          color="primary"
          to="/turmas/nova"
          variant="flat"
        >
          <Plus class="mr-2" :size="16" />
          Criar primeira turma
        </v-btn>
      </div>

      <!-- Lista de turmas -->
      <section
        v-else
        aria-label="Lista de turmas"
        class="lista-turmas -mt-3 min-h-0 flex-1 flex flex-col gap-10"
      >
        <TurmaCard
          v-for="(turma, index) in turmas"
          :key="turma.id"
          :estudantes="turma.total_estudantes ?? 0"
          :icone="iconePorIndice(index)"
          :nome="turma.nome"
          :saudar="index === 0"
          :style="{ animationDelay: `${240 + index * 110}ms` }"
          :to="`/turmas/${turma.id}`"
          :turno="turma.turno_display || formatarTurno(turma.turno)"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TurnoTurma } from '@/interfaces/escola'
  import { GraduationCap, Plus } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useEscolasStore } from '@/stores/escolas'
  import { notify } from '@/utils/notify'

  const authStore = useAuthStore()
  const escolasStore = useEscolasStore()

  const nome = computed(() => {
    const raw = authStore.user?.name?.trim()
    return raw ? raw.split(' ', 1)[0] : 'Professora'
  })

  const carregando = ref(true)

  const turmas = computed(() => {
    return Array.isArray(escolasStore.turmas) ? escolasStore.turmas : []
  })

  const icones: ('lapis' | 'caderno' | 'carteira')[] = ['lapis', 'caderno', 'carteira']
  function iconePorIndice (index: number): 'lapis' | 'caderno' | 'carteira' {
    return icones[index % icones.length]
  }

  function formatarTurno (turno?: TurnoTurma): string {
    if (!turno) return 'Não definido'
    const mapa: Record<string, string> = {
      manha: 'Manhã',
      tarde: 'Tarde',
      noite: 'Noite',
      integral: 'Integral',
    }
    return mapa[turno.toLowerCase()] ?? turno
  }

  onMounted(async () => {
    carregando.value = true
    try {
      await Promise.all([
        escolasStore.fetchTurmas(),
        escolasStore.fetchEscolas().catch(() => {}),
      ])
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível carregar as turmas.')
    } finally {
      carregando.value = false
    }
  })
</script>

<style scoped>
/* Rolagem própria da lista. O respiro (padding) evita cortar o glow, o zoom do hover e o
   canguru que sobe acima do primeiro cartão; a margem negativa devolve esse espaço ao topo. */
.lista-turmas {
  width: 100%;
  max-width: 606px;
  margin-inline: auto;
  padding: 72px 26px 48px;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Os cartões somem suavemente nas bordas da lista, sem passar por cima do título. */
  mask-image: linear-gradient(to bottom, transparent, #000 32px, #000 calc(100% - 32px), transparent);
}

/* Barra de rolagem na identidade do Marsupi: trilho verde claro, thumb verde de apoio que
   escurece no hover. Chromium usa o pseudo-elemento; Firefox, as propriedades padrão. */
.lista-turmas::-webkit-scrollbar {
  display: block;
  width: 10px;
}

.lista-turmas::-webkit-scrollbar-track {
  margin-block: 14px;
  background: #e1eae0;
  border-radius: 999px;
}

.lista-turmas::-webkit-scrollbar-thumb {
  background: var(--color-support);
  border: 2px solid #e1eae0;
  border-radius: 999px;
  transition: background-color 0.2s;
}

.lista-turmas::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

@media (max-width: 640px) {
  .lista-turmas {
    padding-inline: 8px;
  }
}

@supports not selector(::-webkit-scrollbar) {
  .lista-turmas {
    scrollbar-color: var(--color-support) #e1eae0;
    scrollbar-width: thin;
  }
}

.entrada {
  animation: entrada 0.6s var(--ease-out-expo, ease) backwards;
}

:deep(.turma-item) {
  animation: entrada 0.7s var(--ease-out-expo, ease) backwards;
}

@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

.nova-turma {
  min-width: 190px;
  height: 52px;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.35);
  font-size: 0.9375rem;
  font-weight: 500;
}

/* O fundo translúcido do botão vazado não pode valer para o botão cheio. */
.nova-turma--cheia {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.nova-turma--cheia:hover {
  background: var(--color-primary);
  filter: brightness(1.1);
}
</style>
