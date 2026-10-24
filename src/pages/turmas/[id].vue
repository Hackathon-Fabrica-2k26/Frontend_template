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
            class="btn-adicionar-foto"
            color="primary"
            :prepend-icon="Camera"
            @click="acionarUploadFoto"
          >
            Adicionar foto
          </v-btn>
        </div>
      </header>

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
                  <small>Perfil pedagógico atualizado</small>
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
          <p>Adicione uma foto da chamada para cadastrar os alunos.</p>
          <small>Os estudantes da turma aparecerão aqui.</small>
        </section>

        <aside class="cartao-apoio">
          <div>
            <h3>Apoio para sua turma</h3>
            <p>Crie uma atividade e registre os avanços de cada estudante.</p>
          </div>

          <div aria-hidden="true" class="apoio-ilustracao">
            <img alt="" class="icone-notebook" :src="iconeNotebookUrl">
          </div>

          <div class="acoes-apoio">
            <v-btn block color="primary" @click="adicionarAtividade">
              Adicionar atividade
            </v-btn>

            <v-btn
              block
              color="primary"
              variant="outlined"
              @click="enviarAberto = true"
            >
              Enviar trabalhos
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
      :atividade-id="turma.id"
      :atividade-nome="turma.nome"
      :estudantes="alunos"
    />

    <CriarAtividadeModal
      v-model="criarAtividadeAberto"
      :turma-id="turma.id"
      :turma-nome="turma.nome"
    />
  </div>
</template>

<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'
  import { Camera, ChevronRight, Clock, Image } from '@lucide/vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import iconeNotebookUrl from '@/assets/icone-notebook.svg'
  import { useAlunosStore, useEscolasStore } from '@/stores'
  import { notify } from '@/utils/notify'

  const route = useRoute()
  const router = useRouter()
  const escolasStore = useEscolasStore()
  const alunosStore = useAlunosStore()

  const carregando = ref(true)
  const dialogNovoEstudante = ref(false)
  const novoEstudanteNome = ref('')
  const erroNomeEstudante = ref('')
  const salvandoEstudante = ref(false)
  const alunoSelecionado = ref<Aluno | null>(null)
  const enviarAberto = ref(false)
  const criarAtividadeAberto = ref(false)

  const abas = [
    { id: 'estudantes', rotulo: 'Estudantes' },
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
    const limpo = nome.trim()
    return (limpo.charAt(0) || '?').toUpperCase()
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
      ])
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Turma não encontrada.')
      await router.push('/turmas')
    } finally {
      carregando.value = false
    }
  }

  function abrirDialogNovoEstudante () {
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

  function acionarUploadFoto () {
    // TODO: integrar chamada por foto (Backend_template#38).
    console.info('Ação: adicionar foto da chamada')
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
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 0 1rem;
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

.btn-adicionar-foto {
  min-width: 180px;
  min-height: 44px;
}

.grelha-conteudo {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

.cartao-vazio,
.cartao-apoio,
.cartao-lista-alunos {
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
  padding: 1.25rem;
}

.lista-alunos {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #eef5f0;
  border-color: #d9eae0;
  text-align: left;
}

.apoio-ilustracao {
  display: grid;
  min-height: 100px;
  place-items: center;
}

.icone-notebook {
  width: 104px;
  height: 104px;
}

.acoes-apoio {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.estado-aba {
  min-height: 240px;
}

@media (max-width: 900px) {
  .grelha-conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .pagina-turma {
    padding: 1rem;
  }

  .acoes-header,
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
