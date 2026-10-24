<template>
  <MarsupiLoading
    v-if="carregando"
    class="py-16"
    label="Carregando turma..."
  />

  <div v-else-if="turma" class="pagina-turma">
    <nav aria-label="Navegação estrutural" class="breadcrumbs">
      <router-link class="crumb-link" to="/turmas">Minhas turmas</router-link>
      <span>/</span>
      <strong>{{ turma.nome }}</strong>
    </nav>

    <section class="banner-turma">
      <div class="banner-conteudo">
        <span class="badge-nivel">Ensino fundamental</span>
        <h1>{{ turma.nome }}</h1>
        <p class="banner-info">{{ turnoFormatado }} · {{ totalEstudantes }} {{ totalEstudantes === 1 ? 'estudante' : 'estudantes' }}</p>
        <small>Cada descoberta começa aqui.</small>
      </div>

      <div aria-hidden="true" class="banner-grafismo">
        <span class="dot dot-1" />
        <span class="dot dot-2" />

        <div class="bloco-numero">
          <div class="circulo-outline">{{ codigoNumero }}</div>
          <span>Aprender juntos</span>
        </div>

        <div class="forma-organica-laranja" />
        <div class="forma-organica-verde" />
      </div>
    </section>

    <nav aria-label="Seções da turma" class="abas-navegacao" role="tablist">
      <button
        v-for="aba in abas"
        :key="aba.id"
        :aria-selected="abaAtiva === aba.id"
        class="aba-item"
        :class="{ ativa: abaAtiva === aba.id }"
        role="tab"
        type="button"
        @click="abaAtiva = aba.id"
      >
        {{ aba.rotulo }}
      </button>
    </nav>

    <template v-if="abaAtiva === 'estudantes'">
      <header class="seccao-header">
        <div>
          <h2>Estudantes da turma</h2>
          <p>Acompanhe os perfis e registros da turma.</p>
        </div>

        <div class="acoes-header">

          <v-btn
            class="btn-adicionar-foto btn-animado"
            color="primary"
            @click="adicionarIntegrantes"
          >
            <UserPlus class="btn-animado__icone" :size="18" />
            Adicionar integrantes
          </v-btn>
        </div>
      </header>

      <div v-if="alunosSemConsentimento > 0" class="alerta-consentimento-turma">
        <ShieldAlert class="alerta-icone" :size="20" />

        <div class="alerta-texto">
          <strong>Aviso LGPD (Art. 14): </strong>
          <span> {{ alunosSemConsentimento }} {{ alunosSemConsentimento === 1 ? 'estudante possui' : 'estudantes possuem' }} autorização pendente. O sistema bloqueia análises por inteligência artificial até a autorização dos responsáveis.</span>
        </div>
      </div>

      <div class="grelha-conteudo">
        <section v-if="alunos.length > 0" class="cartao-lista-alunos">
          <ul aria-label="Estudantes da turma" class="lista-alunos">
            <li
              v-for="(aluno, index) in alunos"
              :key="aluno.id"
              class="item-aluno"
              role="button"
              tabindex="0"
              @click="alunoSelecionado = aluno"
              @keydown.enter.prevent="alunoSelecionado = aluno"
              @keydown.space.prevent="alunoSelecionado = aluno"
            >
              <div class="aluno-principal">
                <div
                  aria-hidden="true"
                  class="avatar-aluno"
                  :class="`avatar-tom-${index % 3}`"
                >
                  {{ obterInicial(aluno.nome) }}
                </div>

                <div class="aluno-texto">
                  <strong>{{ aluno.nome }}</strong>

                  <div class="aluno-subinfo">
                    <small>Perfil pedagógico atualizado</small>

                    <ConsentimentoBadge
                      compacto
                      :status="consentimentoStore.obterStatus(aluno.id)"
                      @click="abrirTermo(aluno)"
                    />
                  </div>
                </div>
              </div>

              <ChevronRight class="icone-seta" :size="18" />
            </li>
          </ul>
        </section>

        <section v-else class="cartao-vazio">
          <div class="icone-vazio-container">
            <Image class="icone-vazio" :size="30" />
          </div>

          <h3>Nenhum aluno cadastrado</h3>
          <p>Adicione os integrantes pela foto da chamada para cadastrar os alunos.</p>
          <small>Os estudantes da turma aparecerão aqui.</small>
        </section>

        <aside class="cartao-apoio">
          <div>
            <h3>Apoio para sua turma</h3>
            <p>Crie uma atividade e registre os avanços de cada estudante.</p>
          </div>

          <!-- Com atividade cadastrada: o card da atividade principal (a mais recente) no lugar da ilustração. -->
          <button
            v-if="atividadePrincipal"
            class="atividade-principal"
            type="button"
            @click="abaAtiva = 'atividades'"
          >
            <FileText class="atividade-principal__icone" :size="30" :stroke-width="1.6" />

            <span class="atividade-principal__texto">
              <strong>{{ atividadePrincipal.titulo || atividadePrincipal.nome }}</strong>
              <small>{{ resumoRelatorios(atividadePrincipal) }}</small>
            </span>

            <ChevronRight class="atividade-principal__seta" :size="22" />
          </button>

          <div v-else aria-hidden="true" class="apoio-ilustracao">
            <img alt="" class="icone-notebook" :src="iconeNotebookUrl">
          </div>

          <div class="acoes-apoio">
            <v-btn block class="botao-apoio" color="primary" @click="acaoPrincipalApoio">
              {{ atividadePrincipal ? 'Enviar atividades' : 'Adicionar atividade' }}
              <ArrowRight v-if="atividadePrincipal" class="botao-apoio__seta" :size="20" />
            </v-btn>
          </div>
        </aside>
      </div>

      <AlunoDetalhesModal
        v-if="alunoSelecionado"
        :aberto="Boolean(alunoSelecionado)"
        :aluno="alunoSelecionado"
        :turma-nome="turma.nome"
        :turno="turnoFormatado"
        @fechar="alunoSelecionado = null"
      />
    </template>

    <!-- Atividades da turma: é daqui que se enviam os trabalhos (precisa de uma atividade criada). -->
    <section v-else-if="abaAtiva === 'atividades'" class="aba-atividades">
      <header class="seccao-header">
        <div>
          <h2>Atividades da turma</h2>
          <p>Escolha uma atividade para enviar os trabalhos dos estudantes.</p>
        </div>

        <v-btn class="btn-animado" color="primary" @click="adicionarAtividade">
          Adicionar atividade
        </v-btn>
      </header>

      <ul v-if="atividades.length > 0" class="atividades-lista">
        <li v-for="atividade in atividades" :key="atividade.id" class="atividade-linha">
          <div class="atividade-info">
            <strong class="atividade-nome">{{ atividade.titulo || atividade.nome }}</strong>

            <small v-if="atividade.descricao">{{ atividade.descricao }}</small>
          </div>

          <v-btn color="primary" variant="outlined" @click="abrirEnvio(atividade)">
            Enviar trabalhos
          </v-btn>
        </li>
      </ul>

      <section v-else class="cartao-vazio">
        <Clock class="icone-vazio" :size="40" />
        <h3>Nenhuma atividade ainda</h3>
        <p>Crie a primeira atividade para depois enviar os trabalhos dos estudantes.</p>
      </section>
    </section>

    <section v-else class="cartao-vazio estado-aba">
      <Clock class="icone-vazio" :size="40" />
      <h3>{{ abaAtiva === 'atividades' ? 'Atividades' : 'Registros' }}</h3>
      <p>Esta seção estará disponível em breve.</p>
    </section>

    <v-dialog v-model="dialogNovoEstudante" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6 text-h6 font-weight-bold">
          Adicionar estudante
        </v-card-title>

        <v-card-text class="px-6 pt-2">
          <v-form @submit.prevent="salvarNovoEstudante">
            <v-text-field
              v-model="novoEstudanteNome"
              autofocus
              density="comfortable"
              :disabled="salvandoEstudante"
              :error-messages="erroNomeEstudante"
              label="Nome do estudante"
              placeholder="Ex.: Alice Santos"
              required
              variant="outlined"
              @update:model-value="erroNomeEstudante = ''"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0 justify-end ga-2">
          <v-btn
            :disabled="salvandoEstudante"
            variant="text"
            @click="fecharDialogNovoEstudante"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            :loading="salvandoEstudante"
            variant="flat"
            @click="salvarNovoEstudante"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <EnviarTrabalhosDialog
      v-model="enviarAberto"
      :atividade-id="atividadeEnvio?.id ?? 0"
      :atividade-nome="atividadeEnvio?.titulo || atividadeEnvio?.nome"
      :estudantes="alunos"
    />

    <CriarAtividadeModal
      v-model="criarAtividadeAberto"
      :turma-id="turma.id"
      :turma-nome="turma.nome"
      @created="atividadeCriada"
    />

    <TermoConsentimentoDialog
      v-if="alunoTermo"
      v-model="termoAberto"
      :aluno-id="alunoTermo.id"
      :aluno-nome="alunoTermo.nome"
      :turma-id="turma?.id"
      @alterado="carregarDados"
    />
  </div>
</template>

<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'
  import { ArrowRight, ChevronRight, Clock, FileText, Image, ShieldAlert, UserPlus } from '@lucide/vue'
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import iconeNotebookUrl from '@/assets/icone-notebook.svg'
  import { atividadesService } from '@/services/atividades'
  import { useAlunosStore, useConsentimentoStore, useEscolasStore } from '@/stores'
  import { notify } from '@/utils/notify'

  const route = useRoute()
  const router = useRouter()
  const escolasStore = useEscolasStore()
  const alunosStore = useAlunosStore()
  const consentimentoStore = useConsentimentoStore()

  const carregando = ref(true)
  const dialogNovoEstudante = ref(false)
  const novoEstudanteNome = ref('')
  const erroNomeEstudante = ref('')
  const salvandoEstudante = ref(false)
  const alunoSelecionado = ref<Aluno | null>(null)
  const termoAberto = ref(false)
  const alunoTermo = ref<Aluno | null>(null)

  function abrirTermo (aluno: Aluno) {
    alunoTermo.value = aluno
    termoAberto.value = true
  }
  const enviarAberto = ref(false)
  const criarAtividadeAberto = ref(false)
  const atividades = ref<Atividade[]>([])
  const atividadeEnvio = ref<Atividade | null>(null)

  const abas = [
    { id: 'estudantes', rotulo: 'Estudantes' },
    { id: 'atividades', rotulo: 'Atividades' },
  ] as const

  const abaAtiva = ref<(typeof abas)[number]['id']>('estudantes')

  const mapaTurno: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    integral: 'Integral',
  }

  const turmaId = computed(() => {
    const params = route.params as { id?: string | string[] }
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id
    return Number(rawId)
  })

  const turma = computed(() => escolasStore.turmaAtual)
  const alunos = computed(() => alunosStore.alunos)

  const alunosSemConsentimento = computed(() => {
    return alunos.value.filter(a => consentimentoStore.obterStatus(a.id) !== 'ativo').length
  })

  const turnoFormatado = computed(() => {
    if (!turma.value) {
      return 'Manhã'
    }
    if (turma.value.turno_display) {
      return turma.value.turno_display
    }
    const chave = turma.value.turno ?? ''
    return mapaTurno[chave] ?? (chave || 'Manhã')
  })

  const totalEstudantes = computed(() => {
    if (typeof turma.value?.total_estudantes === 'number') {
      return Math.max(turma.value.total_estudantes, alunos.value.length)
    }
    return alunos.value.length
  })

  const codigoNumero = computed(() => {
    const nome = turma.value?.nome ?? ''
    const match = nome.match(/\d+/)
    const numero = match ? Number(match[0]) : (turma.value?.id ?? 1)
    return String(numero).padStart(2, '0')
  })

  function obterInicial (nome: string) {
    const partes = nome.trim().split(/\s+/).filter(Boolean)
    if (partes.length >= 2 && partes[0].toLowerCase() === 'aluno') {
      return (partes[1].charAt(0) || 'A').toUpperCase()
    }
    if (partes.length >= 2) {
      return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase()
    }
    return (partes[0]?.charAt(0) || '?').toUpperCase()
  }

  // Falha ao listar atividades não derruba a página: o painel só mostra o estado vazio.
  async function carregarAtividades (turma: number) {
    try {
      atividades.value = (await atividadesService.list({ turma })).results
    } catch {
      atividades.value = []
    }
  }

  // A atividade criada fica salva na turma e o envio de trabalhos já abre nela.
  async function atividadeCriada (atividade: Atividade) {
    atividades.value.unshift(atividade)
    await nextTick()
    abrirEnvio(atividade)
  }

  // Sem atividade salva: cria uma. Com atividade conectada à turma: envia os trabalhos nela
  // (a mais recente; as outras ficam na aba "Atividades").
  function acaoPrincipalApoio () {
    if (atividadePrincipal.value) {
      abrirEnvio(atividadePrincipal.value)
      return
    }
    adicionarAtividade()
  }

  // A atividade mais recente da turma (pela data de criação; sem data, a primeira da lista).
  const atividadePrincipal = computed(() =>
    atividades.value.reduce<Atividade | null>(
      (maisNova, atual) => (!maisNova || (atual.created_at ?? '') > (maisNova.created_at ?? '') ? atual : maisNova),
      null,
    ),
  )

  function resumoRelatorios (atividade: Atividade): string {
    const total = atividade.relatorios?.length ?? 0
    if (total === 0) return 'Nenhum relatório ainda'
    return `${total} ${total === 1 ? 'relatório disponível' : 'relatórios disponíveis'}`
  }

  function abrirEnvio (atividade: Atividade) {
    atividadeEnvio.value = atividade
    enviarAberto.value = true
  }

  async function carregarDados () {
    const id = turmaId.value
    if (!Number.isInteger(id) || id <= 0) {
      notify.error('Turma não encontrada.')
      await router.push('/turmas')
      return
    }

    carregando.value = true
    try {
      await Promise.all([
        escolasStore.fetchTurma(id),
        alunosStore.fetchAlunos({ turma: id }),
        carregarAtividades(id),
      ])
      if (alunosStore.alunos.length > 0) {
        await consentimentoStore.carregarParaAlunos(alunosStore.alunos.map(a => a.id))
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Turma não encontrada.')
      await router.push('/turmas')
    } finally {
      carregando.value = false
    }
  }

  function _abrirDialogNovoEstudante () {
    novoEstudanteNome.value = ''
    erroNomeEstudante.value = ''
    dialogNovoEstudante.value = true
  }

  function fecharDialogNovoEstudante () {
    dialogNovoEstudante.value = false
    novoEstudanteNome.value = ''
    erroNomeEstudante.value = ''
  }

  async function salvarNovoEstudante () {
    const nome = novoEstudanteNome.value.trim()
    if (!nome) {
      erroNomeEstudante.value = 'Informe o nome do estudante.'
      return
    }

    salvandoEstudante.value = true
    try {
      await alunosStore.createAluno({
        nome,
        turma: turmaId.value,
      })
      await Promise.all([
        escolasStore.fetchTurma(turmaId.value),
        alunosStore.fetchAlunos({ turma: turmaId.value }),
      ])
      notify.success('Estudante cadastrado com sucesso!')
      fecharDialogNovoEstudante()
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível cadastrar o estudante.')
    } finally {
      salvandoEstudante.value = false
    }
  }

  // Abre o cadastro de alunos já preenchido com os dados desta turma: só falta enviar a foto.
  function adicionarIntegrantes () {
    void router.push({ path: '/turmas/nova', query: { turma: turma.value?.id } })
  }

  function adicionarAtividade () {
    criarAtividadeAberto.value = true
  }

  onMounted(() => {
    carregarDados()
  })

  watch(turmaId, (novoId, antigoId) => {
    if (novoId !== antigoId) {
      alunoSelecionado.value = null
      carregarDados()
    }
  })
</script>

<style scoped>
.pagina-turma {
  /* Mesma margem lateral do perfil: ocupa a tela toda com respiro pequeno. */
  position: relative;
  left: 50%;
  width: 100vw;
  padding: 0 0.75rem 2.5rem;
  transform: translateX(-50%);
  color: #1f3a2c;
}

.breadcrumbs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.4rem;
  color: #557063;
  font-size: 0.85rem;
}

.crumb-link {
  color: inherit;
  text-decoration: none;
}

.crumb-link:hover {
  text-decoration: underline;
}

.banner-turma {
  position: relative;
  display: flex;
  min-height: 195px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 2.2rem 2.8rem;
  border-radius: 20px;
  background: #386754;
  color: #fff;
}

.banner-conteudo {
  position: relative;
  z-index: 2;
}

.badge-nivel {
  display: inline-block;
  margin-bottom: 0.85rem;
  padding: 0.36rem 1rem;
  border-radius: 20px;
  background: #fff;
  color: #386754;
  font-size: 0.78rem;
  font-weight: 600;
}

.banner-turma h1 {
  margin: 0 0 0.35rem;
  font-size: 2.2rem;
}

.banner-turma p {
  margin: 0 0 1.25rem;
  opacity: 0.92;
}

.banner-info {
  color: #fff;
  font-weight: 600;
  opacity: 1 !important;
}

.banner-turma small {
  font-size: 0.95rem;
  opacity: 0.85;
}

.banner-grafismo {
  position: absolute;
  inset: 0 0 0 auto;
  width: 320px;
}

.banner-grafismo::before {
  position: absolute;
  top: -150px;
  right: -28px;
  width: 290px;
  height: 290px;
  border-radius: 50%;
  background: rgb(255 255 255 / 24%);
  content: '';
  transform: rotate(-24deg);
}

.dot {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e5a463;
}

.dot-1 { top: 35px; left: 20px; }
.dot-2 { top: 65px; left: 80px; }

.bloco-numero {
  position: absolute;
  top: 50%;
  right: 45px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  transform: translateY(-50%);
}

.circulo-outline {
  display: grid;
  width: 155px;
  height: 155px;
  place-items: center;
  border: 1.5px solid rgb(255 255 255 / 45%);
  border-radius: 50%;
  font-size: 5.4rem;
  font-weight: 700;
}

.bloco-numero span {
  position: absolute;
  bottom: 0;
  width: max-content;
  padding: 0.45rem 1.4rem;
  border-radius: 20px;
  background: #fff;
  color: #2f5646;
  font-size: 0.75rem;
  font-weight: 700;
}

.forma-organica-laranja,
.forma-organica-verde {
  position: absolute;
  border-radius: 50%;
}

.forma-organica-laranja {
  right: -25px;
  bottom: -45px;
  width: 140px;
  height: 140px;
  background: #e5a463;
}

.forma-organica-verde {
  right: 50px;
  bottom: -60px;
  width: 170px;
  height: 120px;
  background: #4b7d68;
  opacity: 0.6;
}

.abas-navegacao {
  display: flex;
  gap: 2rem;
  margin: 1.8rem 0 2.2rem;
  border-bottom: 1px solid #e2ece5;
}

.aba-item {
  position: relative;
  padding: 0.75rem 0.2rem;
  border: 0;
  background: transparent;
  color: #647d71;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.aba-item.ativa {
  color: #224334;
}

.aba-item.ativa::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #e59f58;
  content: '';
}

.seccao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.seccao-header h2,
.cartao-vazio h3,
.cartao-apoio h3 {
  margin: 0 0 0.3rem;
  color: #1a3629;
}

.seccao-header p,
.cartao-vazio p,
.cartao-apoio p {
  margin: 0;
  color: #6a8276;
  font-size: 0.88rem;
}

.acoes-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.btn-adicionar-estudante,
.btn-animado {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s var(--ease-out-expo, ease), box-shadow 0.3s;
}

/* Brilho que atravessa o botão no hover. */
.btn-animado::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 28%) 50%, transparent 65%);
  content: '';
  translate: -120% 0;
  transition: translate 0.7s var(--ease-out-expo, ease);
  pointer-events: none;
}

.btn-animado:hover {
  box-shadow: 0 8px 20px -8px rgb(53 107 91 / 55%);
  transform: translateY(-2px);
}

.btn-animado:hover::after {
  translate: 120% 0;
}

.btn-animado:active {
  transform: scale(0.97);
}

.btn-animado__icone {
  margin-right: 0.5rem;
  transition: transform 0.35s cubic-bezier(.3, 1.6, .5, 1);
}

.btn-animado:hover .btn-animado__icone {
  transform: translateX(3px) scale(1.18) rotate(-8deg);
}

@media (prefers-reduced-motion: reduce) {
  .btn-animado,
  .btn-animado::after,
  .btn-animado__icone {
    transition: none;
  }
}

.btn-adicionar-foto {
  min-width: 180px;
  min-height: 44px;
}

.grelha-conteudo {
  display: grid;
  grid-template-columns: 1fr 340px;
  align-items: start;
  gap: 1.5rem;
}

.cartao-vazio,
.cartao-apoio {
  min-height: 280px;
  padding: 2rem;
  border: 1px solid #e1eee6;
  border-radius: 18px;
  background: #fff;
}

.cartao-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cartao-lista-alunos {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid #e1eee6;
  border-radius: 18px;
  background: #fff;
  max-height: 580px;
}

.lista-alunos {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: #a9c7b4 transparent;
}

.item-aluno {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid #e1eee6;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 64px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.item-aluno:hover,
.item-aluno:focus-visible {
  border-color: #bdd3c6;
  background: #f9fcfa;
  outline: none;
}

.aluno-principal {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.avatar-aluno {
  display: grid;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  font-size: 0.95rem;
  font-weight: 700;
}

.avatar-tom-0 {
  background: #a8c5b8;
  color: #1f3a2c;
}

.avatar-tom-1 {
  background: #d7e5dd;
  color: #224334;
}

.avatar-tom-2 {
  background: #ebd9c0;
  color: #5a4221;
}

.aluno-texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.aluno-texto strong {
  overflow: hidden;
  color: #1a3629;
  font-size: 0.96rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aluno-texto small {
  color: #6a8276;
  font-size: 0.8rem;
}

.aluno-subinfo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.alerta-consentimento-turma {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #fef8ee;
  border: 1px solid #e3b477;
  color: #795217;
  margin-bottom: 1.25rem;
}

.alerta-icone {
  flex-shrink: 0;
  color: #c97d19;
  margin-top: 1px;
}

.alerta-texto {
  font-size: 0.85rem;
  line-height: 1.45;
}

.icone-seta {
  flex-shrink: 0;
  color: #386754;
}

.icone-vazio-container {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 1.4rem;
  place-items: center;
  border-radius: 50%;
  background: #eaf3ed;
}

.icone-vazio {
  color: #386754;
}

.cartao-vazio small {
  margin-top: 0.25rem;
  color: #8da498;
  font-size: 0.8rem;
}

.cartao-apoio {
  /* Fica parado na direita enquanto a lista rola. */
  position: sticky;
  top: 7rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #eef5f0;
  border-color: #d9eae0;
  text-align: left;
}

.apoio-ilustracao {
  display: grid;
  min-height: 100px;
  place-items: center;
}

.aba-atividades {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.atividades-lista {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.atividade-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid #e1eee6;
  border-radius: 14px;
  background: #fff;
}

.atividade-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.15rem;
}

.atividade-info small {
  overflow: hidden;
  color: #52695f;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.atividade-nome {
  color: #1f3a2c;
  font-weight: 600;
  text-decoration: none;
}

.atividade-principal {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 1.25rem;
  border: 1px solid #c9ddcf;
  border-radius: 12px;
  background: #fff;
  color: #1f3a2c;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.atividade-principal:hover {
  border-color: #356b5b;
  box-shadow: 0 8px 18px -10px rgb(53 107 91 / 45%);
  transform: translateY(-1px);
}

.atividade-principal:focus-visible {
  outline: 2px solid #e3b477;
  outline-offset: 2px;
}

.atividade-principal__icone {
  flex: none;
  color: #356b5b;
}

.atividade-principal__texto {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
}

.atividade-principal__texto strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.atividade-principal__texto small {
  color: #52695f;
  font-size: 0.8rem;
}

.atividade-principal__seta {
  flex: none;
  color: #1f3a2c;
  transition: transform 0.2s;
}

.atividade-principal:hover .atividade-principal__seta {
  transform: translateX(3px);
}

.botao-apoio__seta {
  position: absolute;
  right: 1rem;
}

.acoes-apoio {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.cartao-apoio .v-btn {
  flex: none;
  height: 44px;
  min-height: 44px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

@media (min-width: 640px) {
  .pagina-turma {
    padding-inline: 2rem;
  }
}

@media (min-width: 1024px) {
  .pagina-turma {
    padding-inline: 7rem;
  }
}

.icone-notebook {
  width: 104px;
  height: 104px;
}

.estado-aba {
  min-height: 240px;
}

/* Desktop: banner compacto e cartão lateral sticky */
@media (min-width: 901px) and (min-height: 820px) {
  .pagina-turma .banner-turma {
    min-height: 128px;
    padding-block: 1.1rem;
  }

  .pagina-turma .banner-turma h1 {
    font-size: 1.9rem;
  }

  .pagina-turma .banner-turma small {
    display: none;
  }

  .cartao-apoio {
    position: sticky;
    top: 1rem;
  }
}

@media (max-width: 900px) {
  .grelha-conteudo {
    grid-template-columns: 1fr;
  }

  .cartao-apoio {
    position: static;
  }
}

@media (max-width: 680px) {
  .pagina-turma {
    padding: 1rem;
  }

  .acoes-header,
  .btn-adicionar-estudante,
  .btn-adicionar-foto {
    width: 100%;
  }

  .banner-turma {
    padding: 1.8rem 1.4rem;
  }

  .banner-grafismo {
    display: none;
  }

  .seccao-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
