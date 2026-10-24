<script setup lang="ts">
  import type { NomeReconhecido, TurmaPayload, TurnoTurma } from '@/interfaces/escola'
  import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    FileImage,
    GraduationCap,
    ImageUp,
    LoaderCircle,
    Plus,
    RefreshCw,
    Sun,
    Trash2,
    X,
  } from '@lucide/vue'
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
  } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import carregandoUrl from '@/assets/mascotes/carregando.svg'
  import planejamentoUrl from '@/assets/mascotes/planejamento.svg'
  import sucessoUrl from '@/assets/mascotes/sucesso.svg'
  import { useAlunosStore } from '@/stores/alunos'
  import { useEscolasStore } from '@/stores/escolas'
  import { notify } from '@/utils/notify'

  interface AlunoEditavel extends NomeReconhecido {
    revisado: boolean
  }

  const router = useRouter()
  const route = useRoute()
  const escolasStore = useEscolasStore()
  const alunosStore = useAlunosStore()

  // Com ?turma=<id> a tela vira "Cadastrar alunos": dados da turma já preenchidos e travados,
  // só falta a foto da chamada. Ao confirmar, os alunos entram na turma que já existe.
  const turmaExistenteId = computed(() => Number(route.query.turma) || null)
  const modoIntegrantes = computed(() => turmaExistenteId.value !== null)
  const carregandoTurma = ref(false)

  const passo = ref<1 | 2>(1)
  const criada = ref(false)
  const turmaCriadaId = ref<number | null>(null)
  const nome = ref('')
  const anoLetivoTexto = ref(String(new Date().getFullYear()))
  const turno = ref<TurnoTurma>('manha')
  const turnos: Array<{ label: string, value: TurnoTurma }> = [
    { label: 'Manhã', value: 'manha' },
    { label: 'Tarde', value: 'tarde' },
    { label: 'Noite', value: 'noite' },
    { label: 'Integral', value: 'integral' },
  ]
  const turnoLabel = computed(
    () => turnos.find(opcao => opcao.value === turno.value)?.label ?? turno.value,
  )
  const turnoAberto = ref(false)
  const turnoRef = ref<HTMLElement | null>(null)

  const foto = ref<File | null>(null)
  const fotoUrl = ref<string | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)
  const arrastando = ref(false)

  const alunos = ref<AlunoEditavel[]>([])
  const processando = ref(false)
  const salvando = ref(false)
  const mensagemErro = ref('')
  const mensagemSucesso = ref('')
  let proximoId = 0

  const anoLetivo = computed(() => Number(anoLetivoTexto.value))

  const pendentes = computed(() =>
    alunos.value.filter(aluno =>
      aluno.confianca !== null
      && aluno.confianca < 0.8
      && !aluno.revisado,
    ).length,
  )

  function limparErro (): void {
    mensagemErro.value = ''
  }

  function mostrarErro (error: unknown, fallback: string): void {
    mensagemErro.value = error instanceof Error
      ? error.message
      : fallback

    mensagemSucesso.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function normalizarAno (event: Event): void {
    const input = event.target as HTMLInputElement
    anoLetivoTexto.value = input.value.replace(/\D/g, '').slice(0, 4)
    input.value = anoLetivoTexto.value
    limparErro()
  }

  function selecionarTurno (valor: TurnoTurma): void {
    turno.value = valor
    turnoAberto.value = false
    limparErro()
  }

  function fecharTurnoFora (event: PointerEvent): void {
    if (
      turnoRef.value
      && !turnoRef.value.contains(event.target as Node)
    ) {
      turnoAberto.value = false
    }
  }

  function abrirSeletor (): void {
    fileInput.value?.click()
  }

  function aplicarFoto (arquivo: File): void {
    const tipos = ['image/jpeg', 'image/png', 'image/webp']
    const maximo = 20 * 1024 * 1024

    if (!tipos.includes(arquivo.type)) {
      mostrarErro(
        new Error('Formato inválido. Use JPG, PNG ou WEBP.'),
        'Arquivo inválido.',
      )
      return
    }

    if (arquivo.size > maximo) {
      mostrarErro(
        new Error('A foto deve ter no máximo 20 MB.'),
        'Arquivo muito grande.',
      )
      return
    }

    if (fotoUrl.value) {
      URL.revokeObjectURL(fotoUrl.value)
    }

    foto.value = arquivo
    fotoUrl.value = URL.createObjectURL(arquivo)
    alunos.value = []
    limparErro()
  }

  function selecionarFoto (event: Event): void {
    const input = event.target as HTMLInputElement
    const arquivo = input.files?.[0]

    if (arquivo) aplicarFoto(arquivo)
    input.value = ''
  }

  function soltarFoto (event: DragEvent): void {
    arrastando.value = false
    const arquivo = event.dataTransfer?.files[0]
    if (arquivo) aplicarFoto(arquivo)
  }

  function validarDados (): boolean {
    if (!nome.value.trim()) {
      mostrarErro(
        new Error('Informe o nome da turma para continuar.'),
        'Nome obrigatório.',
      )
      return false
    }

    if (
      anoLetivoTexto.value.length !== 4
      || !Number.isInteger(anoLetivo.value)
      || anoLetivo.value < 2000
      || anoLetivo.value > 2100
    ) {
      mostrarErro(
        new Error('Informe um ano letivo válido com quatro dígitos.'),
        'Ano inválido.',
      )
      return false
    }

    if (!turno.value) {
      mostrarErro(
        new Error('Selecione o turno da turma.'),
        'Turno obrigatório.',
      )
      return false
    }

    return true
  }

  async function continuar (): Promise<void> {
    if (!validarDados() || processando.value || salvando.value) return

    limparErro()

    if (!foto.value) {
      if (modoIntegrantes.value) {
        mostrarErro(new Error('Envie a foto da chamada para continuar.'), 'Foto obrigatória.')
        return
      }
      await criarTurma()
      return
    }

    processando.value = true

    try {
      const resultado = await escolasStore.reconhecerChamada(foto.value)

      if (!Array.isArray(resultado.nomes)) {
        throw new TypeError('O reconhecimento não retornou uma lista válida.')
      }

      alunos.value = resultado.nomes.map((item, index) => ({
        id: String(item.id ?? `aluno-${index}`),
        nome: item.nome ?? '',
        confianca: item.confianca ?? null,
        revisado: false,
      }))

      passo.value = 2
      mensagemSucesso.value = 'Reconhecimento concluído! Confira os nomes abaixo.'
    } catch (error) {
      mostrarErro(error, 'Não foi possível reconhecer a chamada.')
    } finally {
      processando.value = false
    }
  }

  function adicionarAluno (): void {
    alunos.value.push({
      id: `manual-${++proximoId}`,
      nome: '',
      confianca: null,
      revisado: true,
    })
    limparErro()
  }

  function removerAluno (index: number): void {
    alunos.value.splice(index, 1)
    limparErro()
  }

  function voltar (): void {
    passo.value = 1
    limparErro()
    mensagemSucesso.value = ''
  }

  async function adicionarAlunosNaTurma (turmaId: number, nomes: string[]): Promise<void> {
    salvando.value = true
    limparErro()

    try {
      await Promise.all(nomes.map(nomeAluno => alunosStore.createAluno({ nome: nomeAluno, turma: turmaId })))
      notify.success(`${nomes.length} ${nomes.length === 1 ? 'aluno adicionado' : 'alunos adicionados'} à turma!`)
      await router.push(`/turmas/${turmaId}`)
    } catch (error) {
      mostrarErro(error, 'Não foi possível adicionar os alunos.')
    } finally {
      salvando.value = false
    }
  }

  async function criarTurma (): Promise<void> {
    if (salvando.value || !validarDados()) return

    const nomes = passo.value === 2
      ? alunos.value.map(aluno => aluno.nome.trim())
      : []

    if (nomes.some(nomeAluno => !nomeAluno)) {
      mostrarErro(
        new Error('Preencha ou remova os nomes de estudantes que estão vazios.'),
        'Nome vazio.',
      )
      return
    }

    if (passo.value === 2 && pendentes.value > 0) {
      mostrarErro(
        new Error(
          `Ainda existem ${pendentes.value} nomes para conferir. Edite ou confirme os nomes sinalizados.`,
        ),
        'Revisão pendente.',
      )
      return
    }

    if (modoIntegrantes.value && turmaExistenteId.value) {
      await adicionarAlunosNaTurma(turmaExistenteId.value, nomes)
      return
    }

    const payload: TurmaPayload = {
      nome: nome.value.trim(),
      turno: turno.value,
      ano_letivo: anoLetivo.value,
      ...(passo.value === 2 ? { alunos: nomes } : {}),
    }

    salvando.value = true
    limparErro()

    try {
      const novaTurma = await escolasStore.createTurma(payload)
      turmaCriadaId.value = novaTurma.id
      criada.value = true
      mensagemSucesso.value = 'Turma criada com sucesso!'
      await router.push(`/turmas/${novaTurma.id}`)
    } catch (error) {
      mostrarErro(error, 'Não foi possível criar a turma.')
    } finally {
      salvando.value = false
    }
  }

  async function carregarTurmaExistente (): Promise<void> {
    if (!turmaExistenteId.value) return
    carregandoTurma.value = true
    try {
      const turma = await escolasStore.fetchTurma(turmaExistenteId.value)
      nome.value = turma.nome
      if (turma.ano_letivo) anoLetivoTexto.value = String(turma.ano_letivo)
      if (turma.turno) turno.value = turma.turno as TurnoTurma
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Turma não encontrada.')
      await router.replace('/turmas')
    } finally {
      carregandoTurma.value = false
    }
  }

  function cancelar (): void {
    void router.push(modoIntegrantes.value ? `/turmas/${turmaExistenteId.value}` : '/turmas')
  }

  onMounted(() => {
    void carregarTurmaExistente()
    document.addEventListener('pointerdown', fecharTurnoFora)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', fecharTurnoFora)
    if (fotoUrl.value) URL.revokeObjectURL(fotoUrl.value)
  })
</script>

<template>
  <main class="nova-turma">
    <div class="page-wrap">

      <nav aria-label="Navegação" class="breadcrumb">
        <RouterLink class="breadcrumb-link" to="/turmas">
          Minhas turmas
        </RouterLink>

        <span class="breadcrumb-separator">/</span>

        <template v-if="modoIntegrantes">
          <RouterLink class="breadcrumb-link" :to="`/turmas/${turmaExistenteId}`">
            {{ nome || 'Turma' }}
          </RouterLink>

          <span class="breadcrumb-separator">/</span>
        </template>

        <span aria-current="page" class="breadcrumb-current">
          {{ modoIntegrantes ? 'Cadastrar alunos' : 'Nova turma' }}
        </span>
      </nav>

      <header class="page-heading">
        <div>
          <h1>
            {{ criada ? 'Turma criada!' : passo === 1 ? (modoIntegrantes ? 'Cadastrar alunos' : 'Nova turma') : 'Confira os nomes reconhecidos' }}
          </h1>

          <p>
            {{
              criada
                ? 'O cadastro foi concluído.'
                : passo === 1
                  ? (modoIntegrantes ? 'Envie a foto da chamada para adicionar os alunos a esta turma.' : 'Cadastre sua turma a partir de uma foto da chamada.')
                  : 'Revise os nomes antes de confirmar a turma.'
            }}
          </p>
        </div>

        <IlustracaoLivroBroto class="heading-livro" />
      </header>

      <template v-if="!criada">
        <div class="steps">
          <div class="step" :class="{ active: passo === 1, done: passo === 2 }">
            <span class="step-dot">
              <Check v-if="passo === 2" :size="13" />
              <template v-else>1</template>
            </span>
            Dados e foto
          </div>

          <div class="step-connector" />

          <div class="step" :class="{ active: passo === 2 }">
            <span class="step-dot">2</span>
            Conferir e criar
          </div>
        </div>

        <div class="progress">
          <div :style="{ width: passo === 1 ? '50%' : '100%' }" />
        </div>
      </template>

      <div v-if="mensagemErro" class="message error-message" role="alert">
        <AlertCircle :size="19" />
        <span>{{ mensagemErro }}</span>

        <button aria-label="Fechar aviso" type="button" @click="mensagemErro = ''">
          <X :size="16" />
        </button>
      </div>

      <div v-if="mensagemSucesso" class="message success-message" role="status">
        <CheckCircle2 :size="19" />
        <span>{{ mensagemSucesso }}</span>
      </div>

      <section v-if="criada" class="success-panel">
        <img alt="" class="mascote-estado" :src="sucessoUrl">

        <h2>{{ nome.trim() }}</h2>

        <p>
          {{ anoLetivo }} · {{ turnoLabel }}
        </p>

        <p>
          {{ alunos.length }} estudantes incluídos no cadastro.
        </p>

        <button class="primary-button" type="button" @click="router.push(turmaCriadaId ? `/turmas/${turmaCriadaId}` : '/turmas')">
          Ver minha turma
          <ArrowRight :size="17" />
        </button>
      </section>

      <section v-else-if="processando" class="loading-panel">
        <img alt="" class="mascote-estado" :src="carregandoUrl">

        <h2>Processando</h2>
        <div class="loading-track"><span /></div>
      </section>

      <template v-else-if="passo === 1">
        <div class="content-grid">
          <section class="form-panel">
            <div class="section-heading">
              <h2>Dados da turma</h2>
              <p>Preencha as informações para continuar.</p>
            </div>

            <form novalidate @submit.prevent="continuar">
              <div class="field">
                <label for="nome-turma">Nome da turma <span>*</span></label>

                <div class="input-shell">
                  <GraduationCap :size="18" />

                  <input
                    id="nome-turma"
                    v-model="nome"
                    autocomplete="off"
                    :disabled="modoIntegrantes"
                    maxlength="100"
                    placeholder="Ex.: 1º ano A"
                    @input="limparErro"
                  >
                </div>
              </div>

              <div class="field-grid">
                <div class="field">
                  <label for="ano-letivo">Ano letivo <span>*</span></label>

                  <div class="input-shell">
                    <CalendarDays :size="18" />

                    <input
                      id="ano-letivo"
                      v-model="anoLetivoTexto"
                      :disabled="modoIntegrantes"
                      inputmode="numeric"
                      maxlength="4"
                      placeholder="2026"
                      type="text"
                      @input="normalizarAno"
                    >
                  </div>
                </div>

                <div class="field">
                  <label id="turno-label">Turno <span>*</span></label>

                  <div ref="turnoRef" class="select-wrapper">
                    <button
                      :aria-expanded="turnoAberto"
                      aria-haspopup="listbox"
                      aria-labelledby="turno-label"
                      class="select-trigger"
                      :class="{ opened: turnoAberto }"
                      :disabled="modoIntegrantes"
                      type="button"
                      @click="turnoAberto = !turnoAberto"
                    >
                      <Sun :size="18" />
                      <span>{{ turnoLabel || 'Selecione o turno' }}</span>
                      <ChevronDown class="select-chevron" :size="17" />
                    </button>

                    <div v-if="turnoAberto" aria-labelledby="turno-label" class="select-options" role="listbox">
                      <button
                        v-for="opcao in turnos"
                        :key="opcao.value"
                        :aria-selected="turno === opcao.value"
                        :class="{ selected: turno === opcao.value }"
                        role="option"
                        type="button"
                        @click="selecionarTurno(opcao.value)"
                      >
                        <span>{{ opcao.label }}</span>
                        <Check v-if="turno === opcao.value" :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="field photo-field">
                <label>Foto da chamada <span v-if="modoIntegrantes">*</span><span v-else class="optional">(opcional)</span></label>

                <div
                  class="upload-box"
                  :class="{ 'is-dragging': arrastando }"
                  @dragleave.prevent="arrastando = false"
                  @dragover.prevent="arrastando = true"
                  @drop.prevent="soltarFoto"
                >
                  <div class="upload-icon" :class="{ 'upload-icon--ok': foto }">
                    <component :is="foto ? Check : ImageUp" :size="22" />
                  </div>

                  <div class="upload-description">
                    <strong>{{ foto?.name || 'Envie a foto da lista de chamada' }}</strong>

                    <small>
                      {{
                        foto
                          ? `${(foto.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB · Foto adicionada`
                          : 'JPG, PNG ou WEBP · Máximo 20 MB'
                      }}
                    </small>
                  </div>

                  <button class="file-button" type="button" @click="abrirSeletor">
                    {{ foto ? 'Trocar foto' : 'Procurar' }}
                  </button>
                </div>

                <input
                  ref="fileInput"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden-file"
                  type="file"
                  @change="selecionarFoto"
                >

                <p class="field-help">
                  Os nomes são reconhecidos automaticamente. Você poderá revisar tudo antes de salvar.
                </p>
              </div>

              <div class="form-actions">
                <button class="secondary-button" type="button" @click="cancelar">
                  Cancelar
                </button>

                <button class="primary-button" :disabled="salvando" type="submit">
                  <LoaderCircle v-if="salvando" class="spin" :size="17" />
                  {{ salvando ? 'Criando...' : foto || modoIntegrantes ? 'Reconhecer nomes' : 'Criar sem foto' }}
                  <ArrowRight v-if="!salvando" :size="17" />
                </button>
              </div>
            </form>
          </section>

          <aside class="info-panel">
            <img alt="" class="mascote-info" :src="planejamentoUrl">

            <h2>Uma foto, menos cadastro.</h2>
            <p>Envie a lista completa da turma. A Marsupi encontra os nomes para você.</p>

            <h3>Para reconhecer melhor</h3>

            <div class="tips">
              <p><span>01</span> Fotografe a lista inteira</p>
              <p><span>02</span> Use um ambiente bem iluminado</p>
              <p><span>03</span> Evite cortes e imagens desfocadas</p>
            </div>

            <div class="tip-note">
              <strong>Não precisa cadastrar um por um.</strong>
              <span>Confira tudo na próxima etapa.</span>
            </div>
          </aside>
        </div>
      </template>

      <template v-else>
        <div class="review-grid">
          <section class="review-panel">
            <div class="section-heading">
              <h2>{{ alunos.length }} nomes encontrados</h2>
              <p>Revise e acerte os nomes destacados antes de confirmar.</p>
            </div>

            <div v-if="pendentes > 0" class="review-warning">
              <AlertTriangle :size="16" />
              {{ pendentes }} nomes precisam da sua conferência.
            </div>

            <div class="student-table-heading">
              <span>ESTUDANTE</span>
              <span>RECONHECIMENTO</span>
            </div>

            <div class="student-list">
              <div v-for="(aluno, index) in alunos" :key="aluno.id" class="student-row">
                <span class="student-number">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>

                <input
                  v-model="aluno.nome"
                  :aria-label="`Nome do estudante ${index + 1}`"
                  maxlength="120"
                  placeholder="Digite o nome"
                  @input="aluno.revisado = true; limparErro()"
                >

                <span
                  class="student-status"
                  :class="{ pending: aluno.confianca !== null && aluno.confianca < 0.8 && !aluno.revisado }"
                >
                  {{
                    aluno.revisado
                      ? 'Conferido'
                      : aluno.confianca !== null && aluno.confianca < 0.8 ? 'Conferir nome' : 'Reconhecido' }} </span>

                <button
                  v-if="aluno.confianca !== null && aluno.confianca < 0.8 && !aluno.revisado"
                  :aria-label="`Confirmar nome ${index + 1}`"
                  class="review-check"
                  title="Confirmar nome"
                  type="button"
                  @click="aluno.revisado = true"
                >
                  <Check :size="15" />
                </button>

                <button
                  :aria-label="`Remover estudante ${index + 1}`"
                  class="remove-student"
                  title="Remover estudante"
                  type="button"
                  @click="removerAluno(index)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </div>

            <button class="add-student" type="button" @click="adicionarAluno">
              <Plus :size="16" />
              Adicionar nome
            </button>
          </section>

          <aside class="photo-panel">
            <h2>Foto da chamada</h2>

            <div class="photo-frame">
              <img v-if="fotoUrl" alt="Foto da lista de chamada enviada" :src="fotoUrl">

              <FileImage v-else :size="42" />
            </div>

            <p class="photo-name">{{ foto?.name || 'Sem foto' }}</p>

            <button class="change-photo" type="button" @click="voltar">
              <RefreshCw :size="14" />
              Trocar foto
            </button>
          </aside>
        </div>

        <div class="review-actions">
          <button class="secondary-button" type="button" @click="voltar">
            <ArrowLeft :size="16" />
            Voltar
          </button>

          <button class="primary-button" :disabled="salvando" type="button" @click="criarTurma">
            <LoaderCircle v-if="salvando" class="spin" :size="17" />
            {{ salvando ? (modoIntegrantes ? 'Adicionando...' : 'Criando turma...') : (modoIntegrantes ? `Adicionar ${alunos.length} alunos` : `Confirmar ${alunos.length} alunos`) }}
            <ArrowRight v-if="!salvando" :size="17" />
          </button>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.nova-turma {
  width: 100%;
  min-height: calc(100dvh - 90px);
  padding: 4px 0 40px;
  background: #f7f8f4;
  color: #263d35;
}

.page-wrap {
  /* Mesma margem lateral do perfil. */
  position: relative;
  left: 50%;
  width: 100vw;
  padding-inline: 0.75rem;
  transform: translateX(-50%);
}

@media (min-width: 640px) {
  .page-wrap {
    padding-inline: 2rem;
  }
}

@media (min-width: 1024px) {
  .page-wrap {
    padding-inline: 7rem;
  }
}

.breadcrumb {
  margin-bottom: 12px;
  color: #92a197;
  font-size: 12px;
}

.breadcrumb span {
  margin: 0 6px;
  color: #b5c3b8;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.page-heading h1 {
  margin: 0 0 7px;
  font-size: clamp(25px, 2.7vw, 34px);
  font-weight: 750;
  letter-spacing: -0.7px;
}

.page-heading p,
.section-heading p {
  margin: 0;
  color: #8b9d90;
  font-size: 13px;
  line-height: 1.6;
}

.heading-illustration {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #619b80;
}

.heading-illustration svg:last-child {
  color: #d5a95c;
}

.steps {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 14px;
}

.step {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #9bab9e;
  font-size: 12px;
  font-weight: 600;
}

.step.active,
.step.done {
  color: #356b5b;
}

.step-dot {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid #b9d1c0;
  border-radius: 50%;
  font-size: 12px;
}

.step.active .step-dot,
.step.done .step-dot {
  border-color: #356b5b;
  background: #356b5b;
  color: white;
}

.step-connector {
  width: 68px;
  height: 1px;
  background: #b7cbbd;
}

.progress {
  height: 2px;
  margin-bottom: 24px;
  background: #dde8df;
}

.progress>div {
  height: 100%;
  background: #356b5b;
  transition: width 350ms ease;
}

.content-grid,
.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(270px, 1fr);
  align-items: start;
  gap: 24px;
}

.review-grid {
  grid-template-columns: minmax(0, 1.85fr) minmax(260px, 1fr);
}

.form-panel,
.review-panel,
.photo-panel {
  min-width: 0;
  padding: 30px;
  border: 1px solid #eef1eb;
  border-radius: 14px;
  background: #fff;
}

.section-heading h2,
.photo-panel h2 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 22px;
}

.field label {
  color: #344f42;
  font-size: 12px;
  font-weight: 650;
}

.field label>span:not(.optional) {
  color: #b67e5d;
}

.optional {
  color: #96a99b;
  font-weight: 400;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.input-shell,
.select-trigger {
  display: flex;
  width: 100%;
  height: 48px;
  align-items: center;
  gap: 11px;
  padding: 0 14px;
  border: 1px solid #dce7df;
  border-radius: 10px;
  background: #fff;
  color: #83a08c;
  transition:
    border-color 250ms ease,
    box-shadow 250ms ease,
    background-color 250ms ease;
}

.input-shell:hover,
.select-trigger:hover {
  border-color: #abc9b6;
}

.input-shell:focus-within,
.select-trigger:focus-visible,
.select-trigger.opened {
  border-color: #73a68a;
  box-shadow: 0 0 0 3px rgba(95, 151, 116, 0.1);
}

.input-shell input {
  width: 100%;
  height: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #304a3c;
  font-family: inherit;
  font-size: 13px;
}

.input-shell input::placeholder {
  color: #a6b6aa;
}

.select-wrapper {
  position: relative;
}

.select-trigger {
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 13px;
}

.select-trigger>span {
  flex: 1;
  color: #304a3c;
}

.select-chevron {
  transition: transform 250ms ease;
}

.select-trigger.opened .select-chevron {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  z-index: 20;
  top: calc(100% + 7px);
  right: 0;
  left: 0;
  padding: 6px;
  border: 1px solid #dce7df;
  border-radius: 11px;
  background: white;
  box-shadow: 0 12px 30px rgba(32, 65, 46, 0.11);
  animation: dropdown-in 180ms ease both;
}

.select-options button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #456455;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 180ms ease;
}

.select-options button:hover,
.select-options button.selected {
  background: #eef5ee;
  color: #356b5b;
}

.upload-box {
  display: flex;
  min-height: 92px;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px dashed #bcd4c2;
  border-radius: 11px;
  background: #f3f8f3;
  transition: background 220ms ease, border-color 220ms ease;
}

.upload-box.is-dragging {
  border-color: #356b5b;
  background: #e8f3e9;
}

.upload-icon,
.info-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: #e2efe5;
  color: #548b6c;
}

.upload-description {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.upload-description strong {
  overflow: hidden;
  color: #41614c;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-description small {
  color: #8ca593;
  font-size: 11px;
}

.file-button {
  flex-shrink: 0;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  background: #e4f0e6;
  color: #356b5b;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.file-button:hover {
  background: #d5e7d9;
}

.hidden-file {
  display: none;
}

.field-help {
  margin: 1px 0 0;
  color: #9aaa9d;
  font-size: 11px;
  line-height: 1.6;
}

.form-actions,
.review-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 30px;
}

.review-actions {
  justify-content: flex-end;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 19px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background-color 280ms ease,
    box-shadow 280ms ease,
    border-color 280ms ease;
}

.primary-button {
  border: 1px solid #356b5b;
  background: #356b5b;
  color: #fff;
}

.primary-button:hover:not(:disabled) {
  background: #2b584b;
  box-shadow: 0 6px 18px rgba(53, 107, 91, 0.13);
}

.secondary-button {
  border: 1px solid #d7e5da;
  background: white;
  color: #356b5b;
}

.secondary-button:hover {
  background: #f0f6f0;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-grid {
  align-items: stretch;
}

.info-panel {
  padding: 32px;
  border-radius: 14px;
  background: #e9f1e9;
}

.info-icon {
  width: 54px;
  height: 54px;
  margin-bottom: 24px;
  border-radius: 50%;
}

.info-panel h2 {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 700;
}

.info-panel>p {
  margin: 0 0 30px;
  color: #7d9784;
  font-size: 13px;
  line-height: 1.8;
}

.info-panel h3 {
  margin-bottom: 17px;
  font-size: 13px;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tips p {
  display: flex;
  gap: 10px;
  margin: 0;
  color: #597b63;
  font-size: 12px;
}

.tips span {
  color: #8eac94;
  font-weight: 700;
}

.tip-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 32px;
  padding: 16px;
  border-radius: 10px;
  background: #f8faf6;
  color: #668c71;
  font-size: 12px;
  line-height: 1.7;
}

.tip-note svg {
  flex-shrink: 0;
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.message>span {
  flex: 1;
}

.message button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.error-message {
  border: 1px solid #f0d5cc;
  background: #fff2ed;
  color: #a24e3a;
}

.success-message {
  border: 1px solid #cfe5d4;
  background: #ecf7ee;
  color: #3c7652;
}

.loading-panel,
.success-panel {
  display: flex;
  min-height: 390px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border-radius: 14px;
  background: white;
  text-align: center;
}

.loading-circle,
.success-icon {
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  margin-bottom: 24px;
  border-radius: 50%;
  background: #e6f2e8;
  color: #4f8867;
}

.loading-circle {
  animation: breathe 1600ms ease-in-out infinite;
}

.loading-panel h2,
.success-panel h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.loading-panel p,
.success-panel p {
  margin: 0 0 14px;
  color: #82998a;
  font-size: 13px;
}

.loading-track {
  width: min(100%, 250px);
  height: 5px;
  margin-top: 18px;
  overflow: hidden;
  border-radius: 10px;
  background: #e2ede4;
}

.loading-track span {
  display: block;
  width: 35%;
  height: 100%;
  border-radius: inherit;
  background: #5a9773;
  animation: loading-slide 1500ms ease-in-out infinite alternate;
}

.success-panel .primary-button {
  margin-top: 15px;
}

.review-warning {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 22px 0 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fbefd9;
  color: #a27838;
  font-size: 12px;
}

.student-table-heading {
  display: flex;
  justify-content: space-between;
  padding: 15px 12px 10px;
  color: #93a598;
  font-size: 10px;
  font-weight: 700;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.student-row {
  display: flex;
  min-height: 43px;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 7px;
}

.student-row:nth-child(odd) {
  background: #f4f8f3;
}

.student-number {
  width: 24px;
  color: #9eaf9f;
  font-size: 11px;
}

.student-row input {
  min-width: 0;
  flex: 1;
  padding: 6px;
  border: 1px solid transparent;
  border-radius: 5px;
  outline: none;
  background: transparent;
  color: #344f42;
  font-family: inherit;
  font-size: 12px;
}

.student-row input:focus {
  border-color: #a8cbb1;
  background: white;
}

.student-status {
  color: #579271;
  font-size: 11px;
  white-space: nowrap;
}

.student-status.pending {
  color: #ba813d;
}

.review-check,
.remove-student {
  display: grid;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #8da797;
  cursor: pointer;
}

.review-check:hover {
  color: #356b5b;
  background: #e5f2e7;
}

.remove-student:hover {
  color: #b85b50;
  background: #fff0ec;
}

.add-student {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  border: 0;
  background: transparent;
  color: #356b5b;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.photo-panel h2 {
  margin-bottom: 17px;
}

.photo-frame {
  display: grid;
  min-height: 250px;
  place-items: center;
  padding: 14px;
  border-radius: 10px;
  background: #f4f5ee;
  color: #9cb3a2;
}

.photo-frame img {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.photo-name {
  margin: 14px 0;
  overflow-wrap: anywhere;
  color: #8fa392;
  font-size: 11px;
}

.change-photo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: #356b5b;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.spin {
  animation: spin 850ms linear infinite;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  font-size: 12px;
}

.breadcrumb-link {
  color: #92a197;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #356b5b;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.breadcrumb-link:focus-visible {
  outline: 2px solid #356b5b;
  outline-offset: 4px;
  border-radius: 2px;
}

.breadcrumb-separator {
  color: #b5c3b8;
}

.breadcrumb-current {
  color: #789382;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes breathe {
  50% {
    transform: scale(1.06);
  }
}

@keyframes loading-slide {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(190%);
  }
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 850px) {

  .content-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .info-panel {
    order: 2;
  }
}

@media (max-width: 550px) {
  .nova-turma {
    padding-top: 16px;
  }

  .form-panel,
  .review-panel,
  .photo-panel,
  .info-panel {
    padding: 20px;
  }

  .field-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .page-heading h1 {
    font-size: 25px;
  }

  .heading-illustration {
    display: none;
  }

  .step-connector {
    width: 24px;
  }

  .upload-box {
    flex-wrap: wrap;
  }

  .student-row {
    gap: 5px;
    padding: 6px;
  }

  .student-status {
    font-size: 10px;
  }

  .review-actions {
    flex-wrap: wrap;
  }

  .review-actions button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>

<style scoped>
.mascote-estado {
  display: block;
  width: 140px;
  height: 140px;
  margin: 0 auto 8px;
  object-fit: contain;
}

.mascote-info {
  display: block;
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
  object-fit: contain;
}
</style>

<style scoped>
.heading-livro {
  width: 190px;
  flex: none;
}

.tip-note {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 22px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgb(255 255 255 / 70%);
  font-size: 13px;
}

.tip-note span {
  color: #6f8578;
  font-size: 12px;
}

/* Dados da turma travados no modo "Cadastrar alunos". */
.input-shell:has(input:disabled),
.select-trigger:disabled {
  background: #eef2ec;
  color: #6f8578;
  cursor: not-allowed;
}

.input-shell input:disabled {
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .heading-livro {
    display: none;
  }
}

.upload-icon--ok {
  background: #356b5b;
  color: #fff;
  animation: foto-ok 0.4s cubic-bezier(.3, 1.6, .5, 1);
}

@keyframes foto-ok {
  from { scale: 0.6; }
}

@media (prefers-reduced-motion: reduce) {
  .upload-icon--ok { animation: none; }
}
</style>
