<script setup lang="ts">
  import type { Atividade } from '@/interfaces/atividade'
  import type { Turma } from '@/interfaces/escola'
  import { ChevronRight, FileText, Plus, Search } from '@lucide/vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { atividadesService } from '@/services/atividades'
  import { turmasService } from '@/services/escolas'
  import { notify } from '@/utils/notify'

  // Atividades no menu principal (issue #90): antes só dava para chegar pelo Perfil.
  const router = useRouter()
  const atividades = ref<Atividade[]>([])
  const turmas = ref<Turma[]>([])
  const carregando = ref(true)
  const erro = ref('')
  const busca = ref('')
  const turmaFiltro = ref<number | null>(null)
  const statusFiltro = ref<string | null>(null)
  const escolhendoTurma = ref(false)
  const turmaNova = ref<number | null>(null)
  const criarAberto = ref(false)

  const opcoesStatus = [
    { title: 'Rascunho', value: 'rascunho' },
    { title: 'Versões geradas', value: 'variacoes_geradas' },
    { title: 'Aprovada', value: 'aprovada' },
    { title: 'Encerrada', value: 'encerrada' },
  ]
  const rotuloStatus = Object.fromEntries(opcoesStatus.map(o => [o.value, o.title]))
  const nomeTurma = computed(() => new Map(turmas.value.map(t => [t.id, t.nome])))
  const turmaEscolhida = computed(() => turmas.value.find(t => t.id === turmaNova.value))

  const filtradas = computed(() => {
    const termo = busca.value.trim().toLowerCase()
    return atividades.value.filter(a =>
      (!statusFiltro.value || a.status === statusFiltro.value)
      && (!termo || (a.titulo || a.nome || '').toLowerCase().includes(termo)),
    )
  })

  async function carregarAtividades () {
    carregando.value = true
    erro.value = ''
    try {
      const lista: Atividade[] = []
      let page = 1
      while (true) {
        const resposta = await atividadesService.list({ turma: turmaFiltro.value ?? undefined, page })
        lista.push(...resposta.results)
        if (!resposta.next) break
        page += 1
      }
      atividades.value = lista
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Não foi possível carregar as atividades.'
    } finally {
      carregando.value = false
    }
  }

  async function carregarTurmas () {
    try {
      turmas.value = (await turmasService.list()).results
    } catch {
      turmas.value = []
    }
  }

  function novaAtividade () {
    if (turmas.value.length === 0) {
      notify.info('Cadastre uma turma antes de criar atividades.')
      return
    }
    // Com uma turma só, não precisa perguntar.
    if (turmas.value.length === 1) {
      turmaNova.value = turmas.value[0]!.id
      criarAberto.value = true
      return
    }
    turmaNova.value = turmaFiltro.value
    escolhendoTurma.value = true
  }

  function confirmarTurma () {
    if (!turmaNova.value) return
    escolhendoTurma.value = false
    criarAberto.value = true
  }

  function atividadeCriada (atividade: Atividade) {
    void router.push(`/atividades/${atividade.id}`)
  }

  function formatarData (iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  watch(turmaFiltro, carregarAtividades)
  onMounted(() => {
    void carregarTurmas()
    void carregarAtividades()
  })
</script>

<template>
  <main class="atividades-pagina">
    <header class="cabecalho">
      <div>
        <h1>Atividades</h1>
        <p>Crie a atividade uma vez; o Marsupi prepara as versões e analisa os trabalhos.</p>
      </div>

      <v-btn color="primary" :prepend-icon="Plus" size="large" @click="novaAtividade">Nova atividade</v-btn>
    </header>

    <div class="filtros">
      <v-text-field
        v-model="busca"
        clearable
        density="comfortable"
        hide-details
        label="Buscar atividade"
        :prepend-inner-icon="Search"
        variant="outlined"
      />

      <v-select
        v-model="turmaFiltro"
        clearable
        density="comfortable"
        hide-details
        item-title="nome"
        item-value="id"
        :items="turmas"
        label="Turma"
        variant="outlined"
      />

      <v-select
        v-model="statusFiltro"
        clearable
        density="comfortable"
        hide-details
        :items="opcoesStatus"
        label="Status"
        variant="outlined"
      />
    </div>

    <MarsupiLoading v-if="carregando" label="Carregando atividades..." />

    <v-alert v-else-if="erro" role="alert" type="error" variant="tonal">
      {{ erro }}
      <v-btn class="ml-3" variant="text" @click="carregarAtividades">Tentar novamente</v-btn>
    </v-alert>

    <section v-else-if="filtradas.length === 0" class="vazio">
      <FileText :size="40" :stroke-width="1.5" />
      <h2>{{ atividades.length === 0 ? 'Nenhuma atividade ainda' : 'Nenhuma atividade com esses filtros' }}</h2>
      <p v-if="atividades.length === 0">Envie um PDF, um DOCX ou uma foto da atividade para começar.</p>
    </section>

    <ul v-else class="lista">
      <li v-for="a in filtradas" :key="a.id">
        <router-link class="linha" :to="`/atividades/${a.id}`">
          <div class="info">
            <strong>{{ a.titulo || a.nome || `Atividade #${a.id}` }}</strong>

            <small>
              {{ a.turma ? nomeTurma.get(a.turma) ?? 'Turma' : 'Sem turma' }} · {{ formatarData(a.created_at) }}
            </small>
          </div>

          <v-chip
            :color="a.status === 'aprovada' ? 'primary' : a.status === 'variacoes_geradas' ? 'secondary' : undefined"
            size="small"
          >
            {{ rotuloStatus[a.status ?? ''] ?? 'Rascunho' }}
          </v-chip>

          <ChevronRight aria-hidden="true" :size="20" />
        </router-link>
      </li>
    </ul>

    <v-dialog v-model="escolhendoTurma" max-width="420">
      <v-card class="pa-6" rounded="lg">
        <h2 class="mb-4">Para qual turma?</h2>

        <v-select
          v-model="turmaNova"
          item-title="nome"
          item-value="id"
          :items="turmas"
          label="Turma"
          variant="outlined"
        />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="escolhendoTurma = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!turmaNova" @click="confirmarTurma">Continuar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <CriarAtividadeModal
      v-model="criarAberto"
      :turma-id="turmaNova ?? undefined"
      :turma-nome="turmaEscolhida?.nome"
      @created="atividadeCriada"
    />
  </main>
</template>

<style scoped>
.atividades-pagina { max-width: 1120px; margin: 0 auto; color: #263d35; }
.cabecalho { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px; margin: 20px 0 24px; }
h1 { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 600; }
.cabecalho p { color: #52695f; }
.filtros { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.lista { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }
.linha { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff; border: 1px solid #dbe5dc; border-radius: 12px; color: inherit; text-decoration: none; transition: border-color .2s; }
.linha:hover, .linha:focus-visible { border-color: #356b5b; }
.info { flex: 1; min-width: 0; }
.info strong { display: block; overflow-wrap: anywhere; }
.info small { color: #52695f; }
.vazio { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px 16px; color: #52695f; text-align: center; }
.vazio h2 { color: #263d35; font-size: 1.15rem; }
@media (max-width: 700px) { .filtros { grid-template-columns: 1fr; } }
</style>
