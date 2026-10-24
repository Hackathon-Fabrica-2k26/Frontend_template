
<template>
  <div class="relative isolate h-[calc(100dvh-158px)]">
    <TurmasFundo />

    <div class="relative z-[1] flex h-full flex-col px-2 pt-10 pb-4 sm:px-6">
      <div class="relative left-1/2 grid w-screen -translate-x-1/2 items-center gap-4 px-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:px-28">
        <p class="entrada text-3xl leading-tight font-normal text-text">
          Bem-vinda, <strong class="font-semibold">{{ nome }}</strong>!
        </p>

        <h1 class="entrada text-2xl font-semibold text-text [animation-delay:80ms] lg:text-center">
          Minhas turmas
        </h1>

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

      <section
        aria-label="Lista de turmas"
        class="lista-turmas -mt-3 min-h-0 flex-1 flex flex-col gap-10"
      >
        <p v-if="carregando" class="estado-lista">
          Carregando suas turmas...
        </p>

        <div v-else-if="erro" class="estado-lista" role="alert">
          <p>{{ erro }}</p>
          <v-btn variant="outlined" color="primary" @click="carregarTurmas">
            Tentar novamente
          </v-btn>
        </div>

        <div v-else-if="turmas.length === 0" class="estado-lista">
          <h2>Você ainda não tem turmas cadastradas.</h2>
          <p>Crie sua primeira turma para começar.</p>
          <v-btn color="primary" @click="novaTurma">
            <Plus class="mr-2" :size="16" />
            Criar primeira turma
          </v-btn>
        </div>

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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import turmasService from '@/services/turmas'

interface TurmaCardItem {
  id: number
  nome: string
  turno: string
  estudantes: number
  icone: 'lapis' | 'caderno' | 'carteira'
}

const router = useRouter()

// Temporário até integrar o nome do usuário autenticado.
const nome = ref('Ana')

const turmas = ref<TurmaCardItem[]>([])
const carregando = ref(false)
const erro = ref('')

async function carregarTurmas (): Promise<void> {
  carregando.value = true
  erro.value = ''

  try {
    const resultado = await turmasService.list()

    const icones = ['lapis', 'caderno', 'carteira'] as const

    turmas.value = resultado.map((turma, index) => ({
      id: turma.id,
      nome: turma.nome,
      turno: turma.turno,
      estudantes: turma.alunos?.length ?? 0,
      icone: icones[index % icones.length] ?? 'lapis',
    }))
  } catch (error) {
    erro.value = error instanceof Error
      ? error.message
      : 'Não foi possível carregar suas turmas.'
  } finally {
    carregando.value = false
  }
}

function novaTurma (): void {
  router.push('/turmas/nova')
}

onMounted(() => {
  carregarTurmas()
})
</script>

<style scoped>
.lista-turmas {
  width: 100%;
  max-width: 606px;
  margin-inline: auto;
  padding: 72px 26px 48px;
  overflow-y: auto;
  overscroll-behavior: contain;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 32px,
    #000 calc(100% - 32px),
    transparent
  );
}

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

.estado-lista {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 20px;
  color: var(--color-primary);
  text-align: center;
}

.estado-lista h2 {
  font-size: 20px;
  font-weight: 600;
}

.estado-lista p {
  font-size: 14px;
}
</style>
