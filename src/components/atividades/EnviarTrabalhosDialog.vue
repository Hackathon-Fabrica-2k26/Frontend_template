<script setup lang="ts">
  import type { ArquivoEnvio, Estudante, StatusAnalise, Trabalho } from '@/interfaces/trabalho'
  import {
    Check,
    CircleCheck,
    FileText,
    LoaderCircle,
    RotateCw,
    Trash2,
    Upload,
    X,
  } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { SIMBOLO } from '@/assets/mascote-simbolo'
  import trabalhosService from '@/services/trabalho'
  import { notify } from '@/utils/notify'

  const props = defineProps<{
    atividadeId: number
    atividadeNome?: string
    estudantes: Estudante[]
  }>()

  const model = defineModel<boolean>({ required: true })

  const emit = defineEmits<{
    completed: [trabalhos: Trabalho[]]
  }>()

  /* ---------- regras de envio (iguais às do texto do design) ---------- */
  const ACEITOS_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ])
  const ACEITOS_EXTENSAO = /\.(?:pdf|docx?|jpe?g|png)$/i
  const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  const TAMANHO_MAXIMO = 20 * 1024 * 1024

  /* ---------- estado ---------- */
  type Etapa = 'envio' | 'processamento' | 'revisao' | 'concluido'

  const etapa = ref<Etapa>('envio')
  const arquivos = ref<ArquivoEnvio[]>([])
  const trabalhos = ref<Trabalho[]>([])
  const entrada = ref<HTMLInputElement | null>(null)
  const arrastando = ref(false)
  const salvando = ref(false)

  let proximoUid = 0
  // A análise segue rodando mesmo com o modal fechado ("você pode continuar usando o Marsupi").
  let analisando = false

  /* ---------- derivados ---------- */
  const total = computed(() => arquivos.value.length)
  const concluidos = computed(() => arquivos.value.filter(a => a.status === 'concluido').length)
  // Falhou uma vez (dá para recarregar) ou duas (só enviando outro arquivo).
  const falhas = computed(() => arquivos.value.filter(a => a.status === 'erro' || a.status === 'reenviar').length)
  const finalizados = computed(() => concluidos.value + falhas.value)
  // Terminou quando ninguém está na fila nem sendo analisado.
  const terminou = computed(() => total.value > 0 && finalizados.value === total.value)
  const percentual = computed(() => (total.value === 0 ? 0 : Math.round((finalizados.value / total.value) * 100)))
  const podeContinuar = computed(() => terminou.value && concluidos.value > 0)
  // Há análise rodando (alguém na fila ou sendo analisado).
  const ocupado = computed(() => arquivos.value.some(a => a.status === 'fila' || a.status === 'analisando'))

  const podeConfirmar = computed(() =>
    trabalhos.value.length > 0 && trabalhos.value.every(trabalho => trabalho.aluno !== null),
  )

  const pendentesRevisao = computed(() =>
    trabalhos.value.filter(trabalho => trabalho.identificacao === 'pendente').length,
  )

  // Revisão completa: o selo do canguru estoura.
  const pronto = computed(() => etapa.value === 'revisao' && podeConfirmar.value)

  // O recibo da etapa final: cada trabalho confirmado, com o aluno a quem pertence.
  const guardados = computed(() => trabalhos.value.map(trabalho => ({
    id: trabalho.id,
    aluno: props.estudantes.find(estudante => estudante.id === trabalho.aluno)?.nome
      ?? trabalho.aluno_nome
      ?? (trabalho.nome_lido || 'Aluno não identificado'),
    arquivo: trabalho.nome_arquivo,
  })))

  const cabecalho = computed(() => ({
    envio: {
      titulo: 'Enviar atividades',
      texto: 'A IA identifica os alunos e preenche os dados automaticamente.',
    },
    processamento: terminou.value
      ? {
        titulo: 'Análise concluída',
        texto: falhas.value > 0
          ? 'Recarregue ou envie de novo os trabalhos que falharam.'
          : 'Todos os trabalhos foram verificados. Continue para revisar os alunos.',
      }
      : {
        titulo: 'Processando...',
        texto: 'Estamos analisando os trabalhos da sua turma.',
      },
    revisao: {
      titulo: 'Revisar identificação',
      texto: pendentesRevisao.value > 0
        ? `${pendentesRevisao.value} ${pendentesRevisao.value === 1 ? 'trabalho com dúvida pede' : 'trabalhos com dúvida pedem'} confirmação.`
        : 'Confira os alunos identificados antes de concluir.',
    },
    concluido: {
      titulo: 'Tudo certo!',
      texto: 'As identificações foram confirmadas.',
    },
  })[etapa.value])

  const rotuloStatus: Record<StatusAnalise, string> = {
    fila: 'Na fila',
    analisando: 'Analisando',
    concluido: 'Verificado',
    erro: 'Recarregar',
    reenviar: 'Enviar arquivo',
  }

  /* ---------- abrir / fechar ---------- */
  // Reabrir durante a análise ou numa revisão pendente retoma de onde parou;
  // no resto, começa limpo.
  watch(model, aberto => {
    if (aberto && etapa.value === 'envio' && !analisando) {
      reiniciar()
    }
  })

  function reiniciar (): void {
    arquivos.value = []
    trabalhos.value = []
    etapa.value = 'envio'
    arrastando.value = false
  }

  function fechar (): void {
    if (salvando.value) {
      return
    }
    if (etapa.value === 'concluido') {
      finalizar()
      return
    }
    // Só descarta o que ainda não foi enviado; análise e revisão ficam guardadas.
    if (etapa.value === 'envio') {
      reiniciar()
    }
    model.value = false
  }

  // Fim do fluxo: avisa a página (que comemora) e deixa o modal pronto para um novo envio.
  function finalizar (): void {
    emit('completed', [...trabalhos.value])
    reiniciar()
    model.value = false
  }

  /* ---------- seleção de arquivos ---------- */
  function abrirSeletor (): void {
    entrada.value?.click()
  }

  function arquivoValido (file: File): boolean {
    return (ACEITOS_EXTENSAO.test(file.name) || ACEITOS_MIME.has(file.type)) && file.size <= TAMANHO_MAXIMO
  }

  function adicionar (novos: File[]): void {
    let invalido = false

    for (const file of novos) {
      if (!arquivoValido(file)) {
        invalido = true
        continue
      }

      const repetido = arquivos.value.some(
        atual => atual.file.name === file.name
          && atual.file.size === file.size
          && atual.file.lastModified === file.lastModified,
      )

      if (!repetido) {
        arquivos.value.push({
          uid: ++proximoUid,
          file,
          status: 'fila',
          trabalhos: [],
          erro: '',
          tentativas: 0,
        })
      }
    }

    if (invalido) {
      notify.error('Selecione arquivos PDF, DOC, DOCX, JPG ou PNG de até 20 MB.')
    }
  }

  function aoEscolher (event: Event): void {
    const campo = event.target as HTMLInputElement
    adicionar(Array.from(campo.files ?? []))
    campo.value = ''
  }

  function aoSoltar (event: DragEvent): void {
    arrastando.value = false
    adicionar(Array.from(event.dataTransfer?.files ?? []))
  }

  function remover (uid: number): void {
    arquivos.value = arquivos.value.filter(arquivo => arquivo.uid !== uid)
  }

  function tamanho (bytes: number): string {
    const mb = bytes / 1024 / 1024
    if (mb < 0.1) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`
    }
    return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`
  }

  /* ---------- análise ---------- */
  async function enviar (): Promise<void> {
    if (arquivos.value.length === 0 || analisando) {
      return
    }

    for (const arquivo of arquivos.value) {
      arquivo.status = 'fila'
      arquivo.trabalhos = []
      arquivo.erro = ''
      arquivo.tentativas = 0
    }
    etapa.value = 'processamento'
    await analisar()
  }

  // Um arquivo por vez, para mostrar o progresso real. Só analisa quem está "na fila": quem já
  // foi verificado não é reenviado, e quem foi recarregado ou trocado volta para a fila.
  // Se alguém entrar na fila enquanto o laço roda, ele é pego antes de o laço terminar.
  async function analisar (): Promise<void> {
    if (analisando) {
      return
    }
    analisando = true

    while (arquivos.value.some(a => a.status === 'fila')) {
      for (const [indice, arquivo] of arquivos.value.entries()) {
        if (arquivo.status !== 'fila') {
          continue
        }

        arquivo.status = 'analisando'
        arquivo.erro = ''

        try {
          arquivo.trabalhos = await trabalhosService.analisar(
            props.atividadeId,
            arquivo.file,
            props.estudantes,
            indice,
          )
          arquivo.status = 'concluido'
        } catch (error) {
          // Primeira falha: dá para recarregar uma vez. Segunda: só enviando outro arquivo.
          arquivo.tentativas++
          arquivo.erro = error instanceof Error ? error.message : 'Erro ao enviar o arquivo.'
          arquivo.status = arquivo.tentativas >= 2 ? 'reenviar' : 'erro'
        }
      }
    }

    analisando = false
    trabalhos.value = arquivos.value.flatMap(arquivo => arquivo.trabalhos)

    // Com o modal fechado, avisa que terminou.
    if (!model.value) {
      if (concluidos.value > 0) {
        notify.success('Trabalhos analisados. Abra o envio para revisar os alunos.')
      } else {
        notify.error('Não foi possível analisar os trabalhos enviados.')
      }
    }
  }

  // Ícone de recarregar: uma nova tentativa para o arquivo que falhou.
  function recarregar (arquivo: ArquivoEnvio): void {
    if (arquivo.status !== 'erro') {
      return
    }
    arquivo.status = 'fila'
    arquivo.erro = ''
    void analisar()
  }

  // Ícone de enviar arquivo: escolhe outro arquivo para ocupar o lugar do que falhou duas vezes.
  const entradaTroca = ref<HTMLInputElement | null>(null)
  let trocando: number | null = null

  function pedirReenvio (arquivo: ArquivoEnvio): void {
    if (arquivo.status !== 'reenviar') {
      return
    }
    trocando = arquivo.uid
    entradaTroca.value?.click()
  }

  function aoTrocar (event: Event): void {
    const campo = event.target as HTMLInputElement
    const novo = campo.files?.[0]
    campo.value = ''

    const alvo = arquivos.value.find(arquivo => arquivo.uid === trocando)
    trocando = null
    if (!novo || !alvo) {
      return
    }

    if (!arquivoValido(novo)) {
      notify.error('Selecione um arquivo PDF, DOC, DOCX, JPG ou PNG de até 20 MB.')
      return
    }

    // O novo arquivo começa do zero: sem tentativas anteriores.
    alvo.file = novo
    alvo.status = 'fila'
    alvo.tentativas = 0
    alvo.erro = ''
    alvo.trabalhos = []
    void analisar()
  }

  function nomeDoArquivo (arquivo: ArquivoEnvio): string {
    if (arquivo.status !== 'concluido') {
      return arquivo.file.name
    }
    return arquivo.trabalhos[0]?.nome_lido || 'Aluno não identificado'
  }

  /* ---------- revisão ---------- */
  function formatarConfianca (valor: number | null): string {
    return valor === null ? 'Não informada' : `${Math.round(valor * 100)}%`
  }

  function aoAlterarAluno (trabalho: Trabalho): void {
    trabalho.identificacao = 'pendente'
  }

  async function confirmar (): Promise<void> {
    if (!podeConfirmar.value || salvando.value) {
      return
    }

    salvando.value = true

    try {
      for (const trabalho of trabalhos.value) {
        if (trabalho.aluno === null) {
          continue
        }
        const atualizado = await trabalhosService.confirmar(trabalho.id, {
          aluno: trabalho.aluno,
        })
        if (atualizado) {
          trabalho.identificacao = atualizado.identificacao
          trabalho.confianca = atualizado.confianca
          trabalho.confianca_nome = atualizado.confianca_nome
          trabalho.aluno_nome = atualizado.aluno_nome
        } else {
          trabalho.identificacao = 'confirmada'
        }
      }

      // A etapa final já comemora: um toast aqui só repetiria a mensagem.
      etapa.value = 'concluido'
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível confirmar os trabalhos.')
    } finally {
      salvando.value = false
    }
  }
</script>

<template>
  <v-dialog
    v-model="model"
    class="dialogo-atividades"
    max-width="720"
    persistent
    scrim="#263d35"
    style="--v-overlay-opacity: 0.55"
  >
    <div class="modal-wrap">
      <!-- Canguru espiando por cima da borda do modal; muda a cada etapa -->
      <MascoteModal
        :arrastando="arrastando"
        class="modal-wrap__mascote modal-wrap__mascote--tras"
        :concluidos="concluidos"
        :etapa="etapa"
        :ocupado="ocupado"
        parte="tras"
        :pronto="pronto"
        :recebidos="arquivos.length"
      />

      <div aria-live="polite" class="modal">
        <header class="modal__cabecalho">
          <div>
            <h2>{{ cabecalho.titulo }}</h2>
            <p>{{ cabecalho.texto }}</p>
          </div>

          <button
            aria-label="Fechar"
            class="botao-icone"
            :disabled="salvando"
            type="button"
            @click="fechar"
          >
            <X :size="22" :stroke-width="1.6" />
          </button>
        </header>

        <!-- O conteúdo troca com uma transição suave entre as etapas -->
        <Transition mode="out-in" name="etapa">
          <div :key="etapa" class="modal__corpo">
            <!-- ===== 1. Envio ===== -->
            <template v-if="etapa === 'envio'">
              <div
                class="soltar"
                :class="{ 'soltar--arrastando': arrastando }"
                role="button"
                tabindex="0"
                @click="abrirSeletor"
                @dragleave.prevent="arrastando = false"
                @dragover.prevent="arrastando = true"
                @drop.prevent="aoSoltar"
                @keydown.enter.prevent="abrirSeletor"
                @keydown.space.prevent="abrirSeletor"
              >
                <span aria-hidden="true" class="soltar__icone">
                  <Upload :size="20" :stroke-width="1.7" />
                </span>

                <strong>Arraste e solte ou Procurar arquivos</strong>
                <span>PDF, DOC, DOCX, JPG e PNG · Até 20 MB por arquivo</span>
              </div>

              <input
                ref="entrada"
                :accept="ACCEPT"
                class="entrada-oculta"
                multiple
                type="file"
                @change="aoEscolher"
              >

              <TransitionGroup v-if="arquivos.length > 0" class="lista" name="item" tag="ul">
                <li v-for="arquivo in arquivos" :key="arquivo.uid" class="arquivo">
                  <FileText class="arquivo__icone" :size="28" :stroke-width="1.3" />

                  <div class="arquivo__info">
                    <strong>{{ arquivo.file.name }}</strong>
                    <span>{{ tamanho(arquivo.file.size) }} · Concluído</span>
                  </div>

                  <button
                    :aria-label="`Remover ${arquivo.file.name}`"
                    class="botao-icone"
                    type="button"
                    @click="remover(arquivo.uid)"
                  >
                    <Trash2 :size="20" :stroke-width="1.5" />
                  </button>
                </li>
              </TransitionGroup>

              <p v-else class="vazio">Nenhum arquivo selecionado.</p>
            </template>

            <!-- ===== 4. Concluído: os trabalhos são guardados na bolsa do canguru ===== -->
            <div v-else-if="etapa === 'concluido'" class="festa" role="status">
              <div class="festa__cena">
                <svg aria-hidden="true" class="festa__canguru" viewBox="0 0 1263 1245">
                  <path :d="SIMBOLO" fill="#356B5B" fill-rule="evenodd" />
                </svg>

                <!-- Recibo real: o aluno de cada trabalho confirmado -->
                <ul class="festa__lista">
                  <li v-for="(item, i) in guardados" :key="item.id" class="festa__item" :style="{ '--i': i }">
                    <div class="festa__info">
                      <strong>{{ item.aluno }}</strong>
                      <span>Trabalho {{ String(i + 1).padStart(2, '0') }} · {{ item.arquivo }}</span>
                    </div>

                    <Check class="festa__ok" :size="16" :stroke-width="2.4" />
                  </li>
                </ul>

                <!-- Cada trabalho viaja do recibo até a bolsa (a bolsa é o que dá nome ao Marsupi) -->
                <span
                  v-for="(item, i) in guardados.slice(0, 4)"
                  :key="`papel-${item.id}`"
                  aria-hidden="true"
                  class="festa__papel"
                  :style="{ '--i': i, '--y': `${i * 60 + 9}px`, '--dy': `${133 - i * 60}px` }"
                >
                  <FileText :size="18" :stroke-width="1.6" />
                </span>
              </div>

              <strong class="festa__total">
                {{ trabalhos.length }} {{ trabalhos.length === 1 ? 'trabalho guardado' : 'trabalhos guardados' }} na turma
              </strong>
            </div>

            <!-- ===== 2. Processando ===== -->
            <template v-else-if="etapa === 'processamento'">
              <div class="resumo">
                <strong v-if="atividadeNome">{{ atividadeNome }}</strong>
                <span>{{ total }} {{ total === 1 ? 'arquivo enviado' : 'arquivos enviados' }}</span>
              </div>

              <div class="progresso">
                <div class="progresso__linha">
                  <strong>
                    {{ finalizados }} de {{ total }} {{ total === 1 ? 'trabalho analisado' : 'trabalhos analisados' }}
                    <template v-if="falhas > 0"> · {{ falhas }} com falha</template>
                  </strong>

                  <span>{{ percentual }}%</span>
                </div>

                <div
                  aria-valuemax="100"
                  aria-valuemin="0"
                  :aria-valuenow="percentual"
                  class="progresso__trilha"
                  role="progressbar"
                >
                  <span class="progresso__barra" :style="{ '--p': percentual / 100 }" />
                </div>

                <small v-if="terminou && falhas > 0">
                  {{ falhas === 1 ? 'O trabalho com falha fica' : 'Os trabalhos com falha ficam' }} de fora se você continuar.
                </small>

                <small v-else>Você pode continuar usando o Marsupi.</small>
              </div>

              <input
                ref="entradaTroca"
                :accept="ACCEPT"
                class="entrada-oculta"
                type="file"
                @change="aoTrocar"
              >

              <ul class="lista lista--status">
                <li v-for="(arquivo, indice) in arquivos" :key="arquivo.uid" class="trabalho">
                  <div class="trabalho__info">
                    <strong>{{ nomeDoArquivo(arquivo) }}</strong>

                    <span>
                      Trabalho {{ String(indice + 1).padStart(2, '0') }}
                      <template v-if="arquivo.status === 'erro'"> · {{ arquivo.erro }}</template>
                      <template v-else-if="arquivo.status === 'reenviar'"> · Falhou de novo. Envie o arquivo outra vez.</template>
                    </span>
                  </div>

                  <!-- Falhou: ícone de recarregar (uma nova tentativa). Falhou de novo: ícone de enviar arquivo. -->
                  <button
                    v-if="arquivo.status === 'erro'"
                    :aria-label="`Recarregar a análise de ${arquivo.file.name}`"
                    class="estado estado--acao estado--erro"
                    type="button"
                    @click="recarregar(arquivo)"
                  >
                    <RotateCw :size="14" :stroke-width="2" />
                    {{ rotuloStatus.erro }}
                  </button>

                  <button
                    v-else-if="arquivo.status === 'reenviar'"
                    :aria-label="`Enviar outro arquivo no lugar de ${arquivo.file.name}`"
                    class="estado estado--acao estado--reenviar"
                    type="button"
                    @click="pedirReenvio(arquivo)"
                  >
                    <Upload :size="14" :stroke-width="2" />
                    {{ rotuloStatus.reenviar }}
                  </button>

                  <span v-else class="estado" :class="`estado--${arquivo.status}`">
                    <LoaderCircle v-if="arquivo.status === 'analisando'" class="estado__giro" :size="14" />
                    <CircleCheck v-else-if="arquivo.status === 'concluido'" :size="14" :stroke-width="2.2" />
                    {{ rotuloStatus[arquivo.status] }}
                  </span>
                </li>
              </ul>
            </template>

            <!-- ===== 3. Revisão ===== -->
            <template v-else-if="etapa === 'revisao'">
              <ul class="lista lista--revisao">
                <li v-for="trabalho in trabalhos" :key="trabalho.id" class="revisao">
                  <div class="revisao__topo">
                    <div class="arquivo__info">
                      <strong>{{ trabalho.nome_arquivo }}</strong>
                      <span>Nome lido: {{ trabalho.nome_lido || 'Não identificado' }}</span>
                    </div>

                    <span class="selo" :class="`selo--${trabalho.identificacao}`">
                      {{ trabalho.identificacao === 'pendente' ? 'Pendente' : 'Identificado' }}
                    </span>
                  </div>

                  <p class="revisao__confianca">
                    Confiança da IA: {{ formatarConfianca(trabalho.confianca) }}
                  </p>

                  <label class="revisao__campo">
                    {{ trabalho.identificacao === 'pendente' ? 'Confirme o estudante da turma' : 'Estudante da turma' }}
                    <select
                      v-model="trabalho.aluno"
                      class="revisao__select"
                      :disabled="salvando"
                      @change="aoAlterarAluno(trabalho)"
                    >
                      <option :value="null">Selecione um estudante</option>

                      <option v-for="estudante in estudantes" :key="estudante.id" :value="estudante.id">
                        {{ estudante.nome }}
                      </option>
                    </select>
                  </label>
                </li>
              </ul>
            </template>

          </div>
        </Transition>

        <footer class="modal__rodape">
          <!-- Envio -->
          <template v-if="etapa === 'envio'">
            <button class="botao botao--contorno" type="button" @click="fechar">Cancelar</button>

            <button class="botao botao--cheio" :disabled="arquivos.length === 0" type="button" @click="enviar">
              Enviar
            </button>
          </template>

          <!-- Processando -->
          <template v-else-if="etapa === 'processamento'">
            <button
              class="botao botao--cheio botao--largo"

              :disabled="!podeContinuar"
              type="button"
              @click="etapa = 'revisao'"
            >
              Continuar
            </button>
          </template>

          <!-- Concluído -->
          <template v-else-if="etapa === 'concluido'">
            <button class="botao botao--cheio botao--largo" type="button" @click="finalizar">
              Concluir
            </button>
          </template>

          <!-- Revisão -->
          <template v-else>
            <button
              class="botao botao--contorno"
              :disabled="salvando"
              type="button"
              @click="etapa = 'processamento'"
            >
              Voltar
            </button>

            <button
              class="botao botao--cheio"
              :disabled="!podeConfirmar || salvando"
              type="button"
              @click="confirmar"
            >
              <LoaderCircle v-if="salvando" class="estado__giro" :size="17" />
              {{ salvando ? 'Salvando...' : 'Confirmar identificação' }}
            </button>
          </template>
        </footer>
      </div>

      <MascoteModal
        :arrastando="arrastando"
        class="modal-wrap__mascote modal-wrap__mascote--frente"
        :concluidos="concluidos"
        :etapa="etapa"
        :ocupado="ocupado"
        parte="frente"
        :pronto="pronto"
      />
    </div>
  </v-dialog>
</template>

<style scoped>
.modal-wrap {
  position: relative;
  isolation: isolate;
}

/* O canguru espia por cima da borda do modal: a cabeça fica atrás dele, as patas na frente. */
.modal-wrap__mascote {
  /* Cresce com a altura da tela, para sempre caber acima do modal. */
  --mw: clamp(104px, 17vh, 190px);

  position: absolute;
  right: 92px;
  bottom: calc(100% - var(--mw) * 0.0891);
  width: var(--mw);
  height: auto;
  pointer-events: none;
}

.modal-wrap__mascote--tras {
  z-index: 0;
}

.modal-wrap__mascote--frente {
  z-index: 2;
}

.modal {
  --ease: var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));

  position: relative;
  z-index: 1;
  padding: 32px;
  border-radius: 20px;
  background: #fcfcf9;
  color: var(--color-text);
  box-shadow: 0 24px 60px -12px rgb(38 61 53 / 0.35);
}

.modal__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #dfe6de;
}

.modal__cabecalho h2 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
}

.modal__cabecalho p {
  margin: 0;
  color: #4d6b5e;
  font-size: 0.875rem;
  line-height: 1.5;
}

.botao-icone {
  display: grid;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 10px;
  color: #4d6b5e;
  cursor: pointer;
  transition: background-color 0.2s var(--ease), color 0.2s var(--ease);
}

.botao-icone:hover:not(:disabled) {
  background: #e6eee6;
  color: var(--color-primary);
}

.botao-icone:focus-visible,
.soltar:focus-visible,
.botao:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ---------- envio ---------- */
.soltar {
  display: flex;
  min-height: 155px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  padding: 20px;
  background: #f1f5ef;
  border: 1.5px dashed #bdd0c3;
  border-radius: 12px;
  color: var(--color-text);
  cursor: pointer;
  text-align: center;
  transition: background-color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.soltar:hover,
.soltar--arrastando {
  background: #e8f0e8;
  border-color: var(--color-primary);
}

.soltar strong {
  font-size: 0.9375rem;
  font-weight: 500;
}

.soltar > span:last-child {
  color: #5d786b;
  font-size: 0.6875rem;
}

.soltar__icone {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  background: #e1eae0;
  border-radius: 50%;
  color: var(--color-primary);
  transition: transform 0.35s var(--ease);
}

.soltar:hover .soltar__icone,
.soltar--arrastando .soltar__icone {
  transform: translateY(-3px) scale(1.08);
}

.entrada-oculta {
  display: none;
}

.lista {
  display: flex;
  max-height: 232px;
  flex-direction: column;
  gap: 10px;
  margin: 18px 0 0;
  padding: 2px 8px 2px 0;
  overflow-y: auto;
  list-style: none;
  scrollbar-color: var(--color-support) #e1eae0;
  scrollbar-width: thin;
}

.lista--status {
  max-height: 300px;
}

.lista--revisao {
  max-height: 340px;
}

.arquivo,
.trabalho,
.revisao {
  background: #fff;
  border: 1px solid #dfe7e0;
  border-radius: 10px;
}

.arquivo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
}

.arquivo__icone {
  flex-shrink: 0;
  color: #3f5a4e;
}

.arquivo__info,
.trabalho__info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.arquivo__info strong,
.trabalho__info strong {
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arquivo__info span,
.trabalho__info span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.vazio {
  margin: 18px 0 0;
  color: #6a8276;
  font-size: 0.8125rem;
  text-align: center;
}

/* ---------- processando ---------- */
.resumo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 22px;
}

.resumo strong {
  font-size: 0.9375rem;
  font-weight: 500;
}

.resumo span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.progresso {
  margin-top: 18px;
}

.progresso__linha {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.75rem;
}

.progresso__linha strong {
  font-weight: 600;
}

.progresso__linha span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.progresso__trilha {
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  background: #e4e9e2;
  border-radius: 999px;
}

.progresso__barra {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transform: scaleX(var(--p, 0));
  transform-origin: left center;
  transition: transform 0.6s var(--ease);
  will-change: transform;
}

.progresso small {
  display: block;
  margin-top: 8px;
  color: #6a8276;
  font-size: 0.6875rem;
}

.trabalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
}

.estado {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  color: #6a8276;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: color 0.3s var(--ease);
}

.estado--analisando {
  color: var(--color-primary);
}

.estado--concluido {
  color: #39734d;
}

.estado--concluido svg {
  animation: estado-pop 0.35s var(--ease);
}

.estado--erro {
  color: #b3261e;
}

/* Estados com ação: recarregar (1ª falha) e enviar arquivo (2ª falha) */
.estado--acao {
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #cfd9d1;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: background-color 0.2s var(--ease), border-color 0.2s var(--ease);
}

.estado--acao:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.estado--erro.estado--acao {
  border-color: #ecc9c6;
}

.estado--erro.estado--acao:hover {
  background: #fbeeed;
}

.estado--reenviar {
  color: var(--color-primary);
  border-color: #bdd0c3;
}

.estado--reenviar:hover {
  background: #eef4ee;
}

.estado__giro {
  animation: giro 0.85s linear infinite;
}

@keyframes giro {
  to {
    transform: rotate(360deg);
  }
}

@keyframes estado-pop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* ---------- revisão ---------- */
.revisao {
  padding: 14px;
}

.revisao__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.revisao__confianca {
  margin: 8px 0 12px;
  color: #6a8276;
  font-size: 0.6875rem;
}

.revisao__campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.revisao__select {
  width: 100%;
  min-height: 42px;
  padding: 0 10px;
  background: #fff;
  border: 1px solid #cad9ce;
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.8125rem;
}

.revisao__select:focus-visible {
  outline: 2px solid var(--color-support);
}

.selo {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 600;
}

.selo--confirmada,
.selo--automatica {
  background: #e5f3e9;
  color: #39734d;
}

.selo--pendente {
  background: #fff1dc;
  color: #a36c25;
}

/* ---------- rodapé e botões ---------- */
.modal__rodape {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid #dfe6de;
}

.botao {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 26px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.25s var(--ease),
    color 0.25s var(--ease),
    opacity 0.25s var(--ease),
    transform 0.2s var(--ease);
}

.botao:active:not(:disabled) {
  transform: scale(0.985);
}

.botao--contorno {
  background: #fff;
  border: 1px solid #cfd9d1;
  color: var(--color-text);
  font-weight: 500;
}

.botao--contorno:hover:not(:disabled) {
  background: #f0f5f1;
}

.botao--cheio {
  background: #2f5a4b;
  border: 1px solid #2f5a4b;
  color: #fff;
}

.botao--cheio:hover:not(:disabled) {
  background: #264a3d;
}

.botao--largo {
  flex: 1;
}

.botao:disabled {
  cursor: not-allowed;
}

.botao--cheio:disabled {
  background: #dfe8e0;
  border-color: #dfe8e0;
  color: #6a8276;
}

.botao--contorno:disabled {
  opacity: 0.5;
}

/* ---------- etapa final: os trabalhos vão para a bolsa do canguru ---------- */
.festa {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 22px;
}

.festa__cena {
  position: relative;
  display: grid;
  width: 100%;
  height: 240px;
  grid-template-columns: 200px minmax(0, 1fr);
  align-items: start;
  gap: 28px;
  text-align: left;
}

/* O canguru que espiava pela borda reaparece inteiro: só opacidade e deslocamento, sem salto. */
.festa__canguru {
  display: block;
  width: 200px;
  height: auto;
  animation: festa-entra 0.7s var(--ease) both;
}

@keyframes festa-entra {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

.festa__lista {
  display: flex;
  max-height: 240px;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0 6px 0 0;
  overflow-x: hidden;
  overflow-y: auto;
  list-style: none;
  scrollbar-color: var(--color-support) #e1eae0;
  scrollbar-width: thin;
}

.festa__item {
  display: flex;
  height: 52px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #dfe7e0;
  border-radius: 10px;
  animation: festa-item 0.4s var(--ease) both;
  animation-delay: calc(0.45s + var(--i) * 0.28s);
}

@keyframes festa-item {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
}

.festa__info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.festa__info strong {
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.festa__info span {
  overflow: hidden;
  color: #6a8276;
  font-size: 0.6875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.festa__ok {
  flex-shrink: 0;
  color: #39734d;
}

/* O momento único: cada trabalho sai da sua linha e entra na bolsa (centro do filhote). */
.festa__papel {
  --dx: -160px;

  position: absolute;
  top: var(--y);
  left: 228px;
  display: grid;
  width: 30px;
  height: 36px;
  place-items: center;
  background: #fff;
  border: 1px solid #cfd9d1;
  border-radius: 6px;
  color: var(--color-primary);
  opacity: 0;
  animation: festa-guarda 0.9s cubic-bezier(0.45, 0, 0.2, 1) forwards;
  animation-delay: calc(0.7s + var(--i) * 0.28s);
  will-change: transform, opacity;
}

@keyframes festa-guarda {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }

  14% {
    opacity: 1;
  }

  62% {
    opacity: 1;
    transform: translate(calc(var(--dx) * 0.62), calc(var(--dy) * 0.62 - 30px)) scale(0.9) rotate(-6deg);
  }

  100% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) scale(0.25) rotate(-10deg);
  }
}

.festa__total {
  margin-top: 18px;
  font-size: 1rem;
  font-weight: 600;
  animation: festa-texto 0.5s var(--ease) 1.5s both;
}

@keyframes festa-texto {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (max-width: 600px) {
  .festa__cena {
    height: auto;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .festa__canguru {
    width: 150px;
    margin: 0 auto;
  }

  .festa__papel {
    display: none;
  }
}

/* ---------- troca de etapa: o conteúdo sai e entra com suavidade ---------- */
.etapa-enter-active {
  transition: opacity 0.28s var(--ease), transform 0.4s var(--ease);
}

.etapa-leave-active {
  transition: opacity 0.16s ease, transform 0.2s ease;
}

.etapa-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.etapa-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- lista: entrada e saída dos itens ---------- */
.item-enter-active {
  transition: opacity 0.3s var(--ease), transform 0.4s var(--ease);
}

.item-leave-active {
  position: absolute;
  width: calc(100% - 8px);
  transition: opacity 0.2s ease, transform 0.25s var(--ease);
}

.item-move {
  transition: transform 0.35s var(--ease);
}

.item-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.item-leave-to {
  opacity: 0;
  transform: translateX(14px);
}

@media (max-width: 600px) {
  .modal {
    padding: 22px 18px;
  }

  .modal__cabecalho h2 {
    font-size: 1.25rem;
  }

  .botao {
    padding: 0 18px;
  }

  .revisao__topo {
    align-items: flex-start;
  }
}
</style>
