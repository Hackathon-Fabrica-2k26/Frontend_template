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
            variant="outlined"
            @click="novaTurma"
          >
            <Plus class="mr-2" :size="16" />
            Nova turma
          </v-btn>
        </div>
      </div>

      <section aria-label="Lista de turmas" class="lista-turmas -mt-3 min-h-0 flex-1 flex flex-col gap-10">
        <TurmaCard
          v-for="(turma, index) in turmas"
          :key="turma.id"
          :estudantes="turma.estudantes"
          :icone="turma.icone"
          :nome="turma.nome"
          :saudar="index === 0"
          :style="{ animationDelay: `${240 + index * 110}ms` }"
          :to="`/turmas/${turma.id}`"
          :turno="turma.turno"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@lucide/vue'
  import { ref } from 'vue'

  // TODO: trocar pelo nome do usuário logado (auth.user?.name) quando o backend entregar.
  const nome = ref('Ana')

  // TODO: carregar de turmasService.list() quando o backend entregar turno e total de estudantes.
  const turmas = ref<{
    id: number
    nome: string
    turno: string
    estudantes: number
    icone: 'lapis' | 'caderno' | 'carteira'
  }[]>([
    { id: 1, nome: '1º ano A', turno: 'Manhã', estudantes: 25, icone: 'lapis' },
    { id: 2, nome: '2º ano B', turno: 'Tarde', estudantes: 28, icone: 'caderno' },
    { id: 3, nome: '3º ano A', turno: 'Manhã', estudantes: 26, icone: 'carteira' },
    { id: 4, nome: '4º ano B', turno: 'Tarde', estudantes: 27, icone: 'lapis' },
    { id: 5, nome: '5º ano A', turno: 'Manhã', estudantes: 24, icone: 'caderno' },
    { id: 6, nome: '6º ano C', turno: 'Tarde', estudantes: 30, icone: 'carteira' },
    { id: 7, nome: '7º ano A', turno: 'Manhã', estudantes: 29, icone: 'lapis' },
    { id: 8, nome: '8º ano B', turno: 'Tarde', estudantes: 25, icone: 'caderno' },
  ])

  function novaTurma () {
    // TODO: abrir o fluxo de criação de turma.
  }
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
</style>
