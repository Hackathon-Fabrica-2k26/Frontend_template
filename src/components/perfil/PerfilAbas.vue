<template>
  <section class="abas">
    <div class="relative px-5 sm:px-6">
      <div aria-label="Seções do perfil" class="flex gap-6" role="tablist" @keydown="teclado">
        <button
          v-for="(aba, i) in abas"
          :id="`aba-${aba.id}`"
          :key="aba.id"
          :ref="el => (botoes[i] = el as HTMLElement | null)"
          :aria-controls="`painel-${aba.id}`"
          :aria-selected="ativa === aba.id"
          class="aba"
          :class="{ 'aba--ativa': ativa === aba.id }"
          role="tab"
          :tabindex="ativa === aba.id ? 0 : -1"
          type="button"
          @click="ativa = aba.id"
        >
          {{ aba.titulo }}
        </button>
      </div>

      <span aria-hidden="true" class="aba-indicador" :style="indicador" />
    </div>

    <div class="h-px bg-support/50" />

    <div
      :id="`painel-${ativa}`"
      :aria-labelledby="`aba-${ativa}`"
      class="px-5 pt-5 pb-6 sm:px-6"
      role="tabpanel"
    >
      <!-- Carregando -->
      <div v-if="estadoAtual === 'carregando'" aria-busy="true" class="flex flex-col gap-3">
        <span class="sk h-11 w-full rounded-xl sm:max-w-[292px]" />

        <div v-for="n in 3" :key="n" class="mt-3 flex items-center gap-4 border-b border-support/40 pb-4">
          <span class="sk h-4 flex-1 rounded-md" />
          <span class="sk hidden h-4 w-16 rounded-md sm:block" />
          <span class="sk hidden h-4 w-12 rounded-md sm:block" />
          <span class="sk size-7 rounded-[24px]" />
        </div>
      </div>

      <!-- Erro -->
      <div v-else-if="estadoAtual === 'erro'" class="vazio" role="alert">
        <img
          alt=""
          class="mascote-erro"
          height="112"
          :src="atencao"
          width="112"
        >

        <h3 class="mt-4 text-[15px] font-semibold text-primary">Não conseguimos carregar {{ ativa === 'turmas' ? 'suas turmas' : 'suas atividades' }}</h3>
        <p class="mt-1 max-w-[260px] text-xs text-text/70">Algo deu errado do nosso lado. Tente novamente em instantes.</p>
        <button class="acao" type="button" @click="emit('recarregar')">Tentar novamente</button>
      </div>

      <!-- Sem turmas -->
      <div v-else-if="ativa === 'turmas' && turmas.length === 0" class="vazio">
        <img
          alt=""
          class="mascote-vazio"
          height="157"
          :src="peekVazio"
          width="190"
        >

        <h3 class="mt-5 text-[15px] font-semibold text-primary">Você ainda não tem turmas</h3>
        <p class="mt-1 max-w-[280px] text-xs text-text/70">Crie sua primeira turma para cadastrar alunos e enviar atividades.</p>

        <router-link class="acao" to="/turmas">
          <Plus :size="15" />
          Nova turma
        </router-link>
      </div>

      <!-- Conteúdo -->
      <template v-else>
        <label class="busca">
          <span class="sr-only">{{ ativa === 'turmas' ? 'Filtrar por nome da turma' : 'Filtrar por título' }}</span>
          <Search aria-hidden="true" class="text-text/60" :size="16" />

          <input
            v-model="busca[ativa]"
            :placeholder="ativa === 'turmas' ? 'Filtrar por nome da turma' : 'Filtrar por título'"
            type="search"
          >
        </label>

        <Transition mode="out-in" name="painel">
          <div v-if="ativa === 'turmas'" key="turmas">
            <div aria-hidden="true" class="cabecalho grid-turmas">
              <span>Turma</span><span>Turno</span><span>Ano letivo</span><span>Alunos</span><span />
            </div>

            <ul class="lista">
              <li v-for="(t, i) in turmasFiltradas" :key="t.id" :style="{ '--i': i }">
                <router-link :aria-label="`Abrir turma ${t.nome}`" class="linha grid-turmas" :to="`/turmas/${t.id}`">
                  <span class="font-medium text-text">{{ t.nome }}</span>

                  <span class="meta">
                    <span>{{ turno(t) }}</span>
                    <span aria-hidden="true" class="sm:hidden"> · </span>
                    <span class="sm:hidden">{{ ano(t) }} · {{ alunos(t) }}</span>
                  </span>

                  <span class="hidden sm:block">{{ ano(t) }}</span>
                  <span class="hidden sm:block">{{ alunos(t) }}</span>
                  <span class="seta"><ChevronRight :size="16" /></span>
                </router-link>
              </li>
            </ul>

            <p v-if="turmasFiltradas.length === 0" class="sem-resultado">Nenhuma turma encontrada para “{{ busca.turmas }}”.</p>
            <p v-else class="rodape">Mostrando {{ turmasFiltradas.length }} {{ turmasFiltradas.length === 1 ? 'turma' : 'turmas' }}</p>
          </div>

          <div v-else key="atividades">
            <div aria-hidden="true" class="cabecalho grid-atividades">
              <span>Atividade</span><span>Data</span><span>Status</span><span />
            </div>

            <ul class="lista">
              <li v-for="(a, i) in atividadesFiltradas" :key="a.id" :style="{ '--i': i }">
                <router-link class="linha grid-atividades" :to="a.turma ? `/turmas/${a.turma}` : '/turmas'">
                  <span class="font-medium text-text">{{ a.titulo }}</span>
                  <span class="meta data">{{ dataBr(a.data) }}</span>
                  <span class="status-celula"><span class="status" :class="`status--${a.status}`">{{ rotuloStatus[a.status] }}</span></span>
                  <span class="ver">Ver <ChevronRight :size="14" /></span>
                </router-link>
              </li>
            </ul>

            <p v-if="atividadesFiltradas.length === 0" class="sem-resultado">
              {{ atividades.length === 0 ? 'Nenhuma atividade ainda.' : `Nenhuma atividade encontrada para “${busca.atividades}”.` }}
            </p>

            <p v-else class="rodape">Mostrando {{ atividadesFiltradas.length }} {{ atividadesFiltradas.length === 1 ? 'atividade' : 'atividades' }}</p>
          </div>
        </Transition>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { Turma } from '@/interfaces/escola'
  import type { AtividadeRecente, StatusAtividade } from '@/interfaces/perfil'
  import { ChevronRight, Plus, Search } from '@lucide/vue'
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import atencao from '@/assets/mascotes/atencao.svg'
  import peekVazio from '@/assets/mascotes/peek-vazio.svg'

  type Estado = 'carregando' | 'erro' | 'ok'

  const props = defineProps<{
    turmas: Turma[]
    atividades: AtividadeRecente[]
    estadoTurmas: Estado
    estadoAtividades: Estado
  }>()
  const emit = defineEmits<{ recarregar: [] }>()

  const abas = [
    { id: 'turmas', titulo: 'Minhas turmas' },
    { id: 'atividades', titulo: 'Atividades recentes' },
  ] as const
  type AbaId = (typeof abas)[number]['id']

  const ativa = ref<AbaId>('turmas')
  const busca = reactive<Record<AbaId, string>>({ turmas: '', atividades: '' })
  const botoes = ref<(HTMLElement | null)[]>([])
  const indicador = ref<Record<string, string>>({ opacity: '0' })

  const estadoAtual = computed(() => (ativa.value === 'turmas' ? props.estadoTurmas : props.estadoAtividades))

  const rotuloStatus: Record<StatusAtividade, string> = {
    analisada: 'Analisada',
    em_analise: 'Em análise',
    pendente: 'Pendente',
  }

  const normaliza = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

  const turmasFiltradas = computed(() => {
    const q = normaliza(busca.turmas)
    return props.turmas.filter(t => normaliza(t.nome).includes(q))
  })
  const atividadesFiltradas = computed(() => {
    const q = normaliza(busca.atividades)
    return props.atividades.filter(a => normaliza(a.titulo).includes(q))
  })

  const turnos: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite', integral: 'Integral' }
  const turno = (t: Turma) => t.turno_display || turnos[(t.turno ?? '').toLowerCase()] || 'Não definido'
  const ano = (t: Turma) => t.ano_letivo || (t.created_at ? new Date(t.created_at).getFullYear() : new Date().getFullYear())
  const alunos = (t: Turma) => `${t.total_estudantes ?? 0} ${(t.total_estudantes ?? 0) === 1 ? 'aluno' : 'alunos'}`

  function dataBr (valor: string): string {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor)
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`
    }
    const data = new Date(valor)
    return Number.isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR')
  }

  // Sublinhado da aba ativa: desliza entre os títulos usando só transform.
  function medir (): void {
    const el = botoes.value[abas.findIndex(a => a.id === ativa.value)]
    if (!el) {
      return
    }
    indicador.value = {
      opacity: '1',
      transform: `translateX(${el.offsetLeft}px) scaleX(${el.offsetWidth})`,
    }
  }

  function teclado (event: KeyboardEvent): void {
    const i = abas.findIndex(a => a.id === ativa.value)
    const passo = event.key === 'ArrowRight' ? 1 : (event.key === 'ArrowLeft' ? -1 : 0)
    if (!passo) {
      return
    }
    event.preventDefault()
    const proxima = (i + passo + abas.length) % abas.length
    ativa.value = abas[proxima]!.id
    nextTick(() => botoes.value[proxima]?.focus())
  }

  watch(ativa, () => nextTick(medir))
  onMounted(() => {
    nextTick(medir)
    window.addEventListener('resize', medir)
    document.fonts?.ready.then(medir)
  })
  onBeforeUnmount(() => window.removeEventListener('resize', medir))
</script>

<style scoped>
.abas {
  padding-top: 18px;
  border: 1px solid rgb(169 199 180 / 0.55);
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgb(38 61 53 / 0.05),
    0 10px 20px -10px rgb(53 107 91 / 0.2),
    0 24px 40px -26px rgb(53 107 91 / 0.26);
  background: #fff;
}

.aba {
  padding: 4px 2px 14px;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: rgb(38 61 53 / 0.75);
  cursor: pointer;
  transition: color 200ms ease;
}

.aba:hover {
  color: var(--color-primary);
}

.aba--ativa {
  font-weight: 600;
  color: var(--color-primary);
}

.aba:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 6px;
}

.aba-indicador {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 1px;
  height: 2px;
  background: var(--color-primary);
  transform-origin: left;
  transition:
    transform 380ms var(--ease-out-expo),
    opacity 200ms ease;
}

.busca {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--color-background);
  transition:
    border-color 200ms ease,
    background-color 200ms ease;
}

.busca:focus-within {
  border-color: var(--color-primary);
  background: #fff;
}

.busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--color-text);
  outline: none;
}

.busca input::placeholder {
  color: rgb(38 61 53 / 0.55);
}

@media (min-width: 640px) {
  .busca {
    max-width: 292px;
  }
}

.cabecalho {
  display: none;
  margin-top: 22px;
  padding: 0 0 10px;
  font-size: 11px;
  color: rgb(38 61 53 / 0.65);
}

.lista {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.lista li {
  border-bottom: 1px solid rgb(169 199 180 / 0.5);
  animation: entra 420ms var(--ease-out-expo) both;
  animation-delay: calc(var(--i) * 45ms);
}

.linha {
  display: grid;
  align-items: center;
  gap: 2px 12px;
  padding: 14px 0;
  font-size: 13px;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 8px;
}

.linha:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.grid-turmas {
  grid-template-columns: 1fr 32px;
}

.grid-turmas > :nth-child(1) {
  grid-column: 1;
}

.grid-turmas > .meta {
  grid-column: 1;
  grid-row: 2;
}

.grid-turmas > .seta {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.grid-atividades {
  grid-template-columns: 1fr auto;
}

.grid-atividades > .data {
  grid-row: 2;
  grid-column: 1;
}

.grid-atividades > .status-celula {
  grid-row: 3;
  grid-column: 1;
  margin-top: 6px;
}

.grid-atividades > .ver {
  grid-column: 2;
  grid-row: 1;
}

.meta {
  font-size: 11px;
  color: rgb(38 61 53 / 0.7);
}

.seta {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 24px;
  background: rgb(169 199 180 / 0.3);
  color: var(--color-primary);
  transition:
    background-color 200ms ease,
    transform 260ms var(--ease-out-expo);
}

.linha:hover .seta {
  background: var(--color-primary);
  color: var(--color-background);
  transform: translateX(3px);
}

.ver {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.linha:hover .ver {
  color: var(--color-primary);
}

.status {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 24px;
  font-size: 11px;
  color: var(--color-text);
}

.status--analisada {
  background: rgb(169 199 180 / 0.45);
}

.status--em_analise {
  background: rgb(227 180 119 / 0.4);
}

.status--pendente {
  background: rgb(38 61 53 / 0.08);
}

.rodape,
.sem-resultado {
  margin: 14px 0 0;
  font-size: 11px;
  color: rgb(38 61 53 / 0.7);
}

.sem-resultado {
  font-size: 13px;
  padding: 18px 0;
}

@media (min-width: 640px) {
  .cabecalho,
  .linha {
    gap: 0 12px;
  }

  .cabecalho {
    display: grid;
  }

  .grid-turmas {
    grid-template-columns: 1.1fr 0.9fr 0.8fr 1.2fr 32px;
  }

  .grid-turmas > .meta {
    grid-row: auto;
    grid-column: auto;
    font-size: 13px;
    color: var(--color-text);
  }

  .grid-turmas > .seta {
    grid-row: auto;
    grid-column: auto;
  }

  .grid-atividades {
    grid-template-columns: 1.6fr 1fr 1fr 48px;
  }

  .grid-atividades > .data {
    grid-row: auto;
    grid-column: auto;
    font-size: 13px;
    color: var(--color-text);
  }

  .grid-atividades > .status-celula,
  .grid-atividades > .ver {
    grid-row: auto;
    grid-column: auto;
    margin-top: 0;
  }

  .grid-atividades > .ver {
    justify-self: end;
  }

  .linha {
    padding: 18px 0;
  }
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 8px 28px;
  text-align: center;
}

.mascote-vazio {
  width: 190px;
  max-width: 70%;
  height: auto;
  animation: entra 700ms var(--ease-out-expo) both;
}

.mascote-erro {
  width: 112px;
  height: auto;
  animation: entra 700ms var(--ease-out-expo) both;
}

.acao {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  margin-top: 18px;
  padding: 0 24px;
  border: 0;
  border-radius: 12px;
  background: var(--color-primary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-background);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.acao:hover {
  background: #2b5b4d;
}

.acao:active {
  transform: scale(0.98);
}

.acao:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@keyframes entra {
  from {
    opacity: 0;
    translate: 0 8px;
  }
}

.painel-enter-active,
.painel-leave-active {
  transition: opacity 140ms ease;
}

.painel-enter-from,
.painel-leave-to {
  opacity: 0;
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
